/**
 * routes/orders.js — Order API endpoints (PostgreSQL async)
 *
 * POST /api/orders   — Place a new order, persist to PostgreSQL, send email
 * GET  /api/orders   — Get order history for a user
 * GET  /api/orders/:id — Get a single order with items + shipping address
 *
 * All handlers are async/await since pg queries return Promises.
 */

const express = require("express");
const { getDb } = require("../db");
const { sendOrderConfirmationEmail } = require("../services/emailService");
const router = express.Router();

/**
 * getFullOrder(orderId, pool)
 * ───────────────────────────
 * Fetches a complete order from PostgreSQL including:
 *   - Base order row (totals, status, placed_at)
 *   - All ordered items (product name, image, qty, price)
 *   - Shipping address
 */
async function getFullOrder(orderId, pool) {
  const { rows: orderRows } = await pool.query(
    "SELECT * FROM orders WHERE id = $1",
    [orderId]
  );
  if (orderRows.length === 0) return null;

  const { rows: items } = await pool.query(
    "SELECT * FROM order_items WHERE order_id = $1",
    [orderId]
  );
  const { rows: addrRows } = await pool.query(
    "SELECT * FROM shipping_addresses WHERE order_id = $1",
    [orderId]
  );

  return {
    ...orderRows[0],
    // Ensure numeric fields are floats
    subtotal: parseFloat(orderRows[0].subtotal),
    shipping: parseFloat(orderRows[0].shipping),
    tax: parseFloat(orderRows[0].tax),
    total: parseFloat(orderRows[0].total),
    items: items.map((i) => ({
      ...i,
      unit_price: parseFloat(i.unit_price),
    })),
    shipping_address: addrRows[0] || null,
  };
}

// POST /api/orders — Place a new order
// Body: { userId, userEmail, items, shippingAddress, subtotal, shipping, tax, total }
router.post("/", async (req, res) => {
  const { userId, userEmail, items, shippingAddress, subtotal, shipping, tax, total } =
    req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ error: "Cart is empty" });
  if (!shippingAddress?.fullName)
    return res.status(400).json({ error: "Shipping address required" });

  // Generate unique order ID: ORD-<timestamp>-<random>
  const orderId = `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 5)
    .toUpperCase()}`;
  const placedAt = new Date().toISOString();

  try {
    const pool = getDb();

    // ── Insert order row ──────────────────────────────────────
    await pool.query(
      `INSERT INTO orders (id, user_id, subtotal, shipping, tax, total, status, placed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, userId || "guest-user", subtotal, shipping, tax, total, "Confirmed", placedAt]
    );

    // ── Insert each ordered item ──────────────────────────────
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.product.id,
          item.product.name,
          item.product.images?.[0] ?? "",
          item.product.price,
          item.quantity,
        ]
      );
    }

    // ── Insert shipping address ───────────────────────────────
    await pool.query(
      `INSERT INTO shipping_addresses
         (order_id, full_name, address_line1, address_line2, city, state, zip_code, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        orderId,
        shippingAddress.fullName,
        shippingAddress.addressLine1,
        shippingAddress.addressLine2 || null,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.zipCode,
        shippingAddress.phone,
      ]
    );

    // ── Fetch complete order for response + email ─────────────
    const fullOrder = await getFullOrder(orderId, pool);

    // ── Send confirmation email and capture preview URL ──────
    // EMAIL LOCATION:  server/services/emailService.js
    // EMAIL CONFIG:    server/.env → MAIL_PROVIDER, MAIL_USER, MAIL_PASS
    // In Ethereal mode: previewUrl is returned in the API response
    // In Gmail mode:    email goes to real inbox, previewUrl is null
    let emailPreviewUrl = null;
    try {
      emailPreviewUrl = await sendOrderConfirmationEmail(
        fullOrder,
        userEmail || "customer@shopkart.in"
      );
    } catch (emailErr) {
      console.error("Email send error (non-fatal):", emailErr.message);
    }

    res.status(201).json({
      success: true,
      order: fullOrder,
      message: `Order ${orderId} placed successfully!`,
      // Ethereal preview URL — frontend can show this as a link for demo purposes
      emailPreviewUrl,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders?userId=xxx — Order history for a user
router.get("/", async (req, res) => {
  try {
    const pool = getDb();
    const uid = req.query.userId || "guest-user";
    const { rows } = await pool.query(
      "SELECT id FROM orders WHERE user_id = $1 ORDER BY placed_at DESC",
      [uid]
    );
    const orders = await Promise.all(rows.map((r) => getFullOrder(r.id, pool)));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — Single order detail
router.get("/:id", async (req, res) => {
  try {
    const pool = getDb();
    const order = await getFullOrder(req.params.id, pool);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
