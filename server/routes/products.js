/**
 * routes/products.js — Product API endpoints (PostgreSQL async)
 *
 * All handlers are async/await since pg queries return Promises.
 * Data comes from the PostgreSQL `products`, `product_images`,
 * and `product_specifications` tables.
 */

const express = require("express");
const { getDb } = require("../db");
const router = express.Router();

/**
 * hydrate(product, pool)
 * ──────────────────────
 * Enriches a raw products row with its related images and specs
 * from the product_images and product_specifications tables.
 */
async function hydrate(product, pool) {
  // Fetch ordered images for this product
  const imgResult = await pool.query(
    "SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order",
    [product.id]
  );
  const images = imgResult.rows.map((r) => r.url);

  // Fetch key-value specifications and build a plain object
  const specResult = await pool.query(
    "SELECT spec_key, spec_value FROM product_specifications WHERE product_id = $1",
    [product.id]
  );
  const specifications = specResult.rows.reduce(
    (acc, r) => ({ ...acc, [r.spec_key]: r.spec_value }),
    {}
  );

  return {
    ...product,
    images,
    specifications,
    // Normalise boolean columns (PostgreSQL returns real booleans)
    inStock: product.in_stock === true || product.in_stock === 1,
    isPrime: product.is_prime === true || product.is_prime === 1,
    originalPrice: product.original_price ?? undefined,
    reviewCount: product.review_count,
    price: parseFloat(product.price),
  };
}

// GET /api/products?search=&category=
router.get("/", async (req, res) => {
  try {
    const pool = getDb();
    const { search, category } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    let idx = 1;

    if (search) {
      sql += ` AND (name ILIKE $${idx} OR description ILIKE $${idx + 1} OR brand ILIKE $${idx + 2})`;
      const term = `%${search}%`;
      params.push(term, term, term);
      idx += 3;
    }
    if (category && category !== "All") {
      sql += ` AND category = $${idx}`;
      params.push(category);
      idx++;
    }
    sql += " ORDER BY rating DESC";

    const { rows } = await pool.query(sql, params);
    const hydrated = await Promise.all(rows.map((r) => hydrate(r, pool)));
    res.json(hydrated);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/categories — must be BEFORE /:id
router.get("/categories", async (_req, res) => {
  try {
    const pool = getDb();
    const { rows } = await pool.query(
      "SELECT DISTINCT category FROM products ORDER BY category"
    );
    res.json(["All", ...rows.map((r) => r.category)]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const pool = getDb();
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json(await hydrate(rows[0], pool));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
