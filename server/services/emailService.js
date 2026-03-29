/**
 * ============================================================
 * emailService.js — Order Confirmation Email via Nodemailer
 * ============================================================
 *
 * LOCATION: server/services/emailService.js
 *
 * This service sends a beautifully formatted HTML email to the
 * customer whenever they place an order.
 *
 * ── HOW EMAIL IS CONFIGURED ──────────────────────────────────
 * Settings are read from server/.env (never committed to git).
 *
 *  MAIL_PROVIDER=gmail      → Uses Gmail SMTP (real emails sent)
 *  MAIL_PROVIDER=ethereal   → Uses Ethereal fake inbox (preview URL only)
 *
 * ── GMAIL SETUP (to send real emails) ────────────────────────
 * 1. Go to: https://myaccount.google.com/security
 * 2. Enable "2-Step Verification" (required for App Passwords)
 * 3. Go to "App passwords" → Generate one for "Mail"
 * 4. Copy the 16-character password (no spaces)
 * 5. Set in server/.env:
 *      MAIL_USER=your.gmail@gmail.com
 *      MAIL_PASS=xxxx xxxx xxxx xxxx   ← App Password
 *      MAIL_PROVIDER=gmail
 *
 * ── ETHEREAL SETUP (for testing without real email) ───────────
 * No config needed. Nodemailer creates a temporary inbox automatically.
 * After placing an order, a preview URL is printed in the terminal.
 * Open that URL in a browser to see the email.
 *
 * ── PRODUCTION OPTIONS ────────────────────────────────────────
 * - Gmail:   Already wired up (see above)
 * - SendGrid: Replace transport with @sendgrid/mail
 * - AWS SES:  Use nodemailer-ses-transport
 * ============================================================
 */

require("dotenv").config(); // Load server/.env variables
const nodemailer = require("nodemailer");

// ── Transporter Cache ──────────────────────────────────────────
// Reuse the same SMTP connection for the life of the server process.
let transporter = null;

/**
 * getTransporter()
 * ─────────────────
 * Returns a cached Nodemailer transporter.
 * On first call, creates it based on MAIL_PROVIDER in .env:
 *   - "gmail"    → Gmail SMTP (sends real emails to real inboxes)
 *   - "ethereal" → Ethereal fake SMTP (preview URL printed in terminal)
 */
async function getTransporter() {
  if (transporter) return transporter;

  const provider = (process.env.MAIL_PROVIDER || "ethereal").toLowerCase();

  if (provider === "gmail") {
    // ── Gmail SMTP ──────────────────────────────────────────────
    // Uses your Gmail account with an "App Password" (not your normal password).
    // See server/.env for MAIL_USER and MAIL_PASS configuration.
    //
    // NOTE: Google displays App Passwords with spaces (e.g. "abcd efgh ijkl mnop")
    // but the actual credential used for auth has NO spaces. We strip them here.

    const rawPass = process.env.MAIL_PASS || "";
    const cleanPass = rawPass.replace(/\s/g, ""); // remove all spaces / formatting

    transporter = nodemailer.createTransport({
      service: "gmail", // nodemailer knows Gmail's SMTP settings
      auth: {
        user: process.env.MAIL_USER, // e.g. arpitsharma@gmail.com
        pass: cleanPass,             // 16-char App Password (spaces removed)
      },
    });

    // Verify the connection so we fail fast if credentials are wrong
    try {
      await transporter.verify();
      console.log("\n✅ Gmail SMTP connected successfully!");
      console.log(`   Sending as: ${process.env.MAIL_USER}`);
    } catch (err) {
      console.error("\n❌ Gmail SMTP failed:", err.message);
      console.error(
        "   Check MAIL_USER and MAIL_PASS in server/.env\n" +
        "   Make sure you're using an App Password (not your normal password).\n" +
        "   Step 1: Go to https://myaccount.google.com/security\n" +
        "   Step 2: Enable 2-Step Verification\n" +
        "   Step 3: Search 'App passwords' → create one for Mail\n" +
        "   Step 4: Paste the 16-char password in MAIL_PASS (spaces OK)\n" +
        "   Guide:  https://support.google.com/accounts/answer/185833\n" +
        "   ⚠️  Falling back to Ethereal for this session."
      );
      // Credential is bad — fall back to Ethereal so the server stays running
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.log(`\n📧 Ethereal fallback active. User: ${testAccount.user}`);
      console.log("   After placing an order, a preview URL will appear here.\n");
    }
  } else {
    // ── Ethereal (default/testing) ──────────────────────────────
    // Creates a free temporary inbox just for this server session.
    // Emails are never actually delivered — just preview them via URL.
    const testAccount = await nodemailer.createTestAccount();

    console.log("\n📧 Ethereal test email account created:");
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(
      "   ℹ️  After placing an order, a preview URL will be printed here.\n"
    );

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  return transporter;
}

// ── Email Template ─────────────────────────────────────────────

/**
 * buildOrderEmailHTML()
 * ─────────────────────
 * Returns a full HTML string for the order confirmation email.
 * Template matches ShopKart/Amazon branding:
 *   - Dark navy header
 *   - Green confirmation banner
 *   - Order ID, items table, shipping address, price summary
 */
function buildOrderEmailHTML(order) {
  // Build one <tr> per ordered item (product thumbnail, name, qty, amount)
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          <img src="${item.product_image}" width="60" height="60"
               style="object-fit:contain;" alt="${item.product_name}"/>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
          ₹${(item.unit_price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>`
    )
    .join("");

  // Estimated delivery = 3 days from order placement
  const deliveryDate = new Date(
    new Date(order.placed_at).getTime() + 3 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { font-family: Arial, sans-serif; background:#f0f2f2; margin:0; padding:0; }
    .container { max-width:600px; margin:20px auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
    /* Amazon-style dark header */
    .header { background:#131921; padding:16px 24px; }
    .header h1 { color:white; margin:0; font-size:24px; letter-spacing:-0.5px; }
    .header span { color:#ff9900; }
    /* Green success banner */
    .banner { background:#00a651; color:white; padding:16px 24px; }
    .banner h2 { margin:0 0 4px; font-size:18px; }
    .banner p { margin:0; font-size:14px; opacity:0.9; }
    /* Content sections */
    .section { padding:16px 24px; border-bottom:1px solid #eee; }
    .section h3 { font-size:12px; color:#565959; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px; }
    .order-id { font-size:20px; font-weight:bold; color:#c7511f; font-family:monospace; }
    /* Items table */
    table { width:100%; border-collapse:collapse; }
    th { background:#f0f2f2; padding:8px; text-align:left; font-size:12px; color:#565959; }
    /* Price summary rows */
    .summary-row { display:flex; justify-content:space-between; padding:4px 0; font-size:14px; }
    .summary-row.total { font-weight:bold; font-size:16px; border-top:2px solid #ddd; padding-top:8px; margin-top:4px; }
    /* Footer */
    .footer { background:#f0f2f2; padding:16px 24px; text-align:center; font-size:12px; color:#565959; }
  </style>
</head>
<body>
<div class="container">

  <!-- Header: ShopKart logo bar -->
  <div class="header">
    <h1>shop<span>kart</span></h1>
  </div>

  <!-- Green confirmation banner -->
  <div class="banner">
    <h2>✅ Order Confirmed!</h2>
    <p>Thank you for shopping with ShopKart. Your order has been placed successfully.</p>
  </div>

  <!-- Order ID + placement timestamp -->
  <div class="section">
    <h3>Order Details</h3>
    <p class="order-id">${order.id}</p>
    <p style="font-size:13px;color:#565959;margin:4px 0;">
      Placed on: ${new Date(order.placed_at).toLocaleString("en-IN")}<br/>
      Estimated delivery: <strong>${deliveryDate}</strong>
    </p>
  </div>

  <!-- Ordered items table -->
  <div class="section">
    <h3>Items Ordered</h3>
    <table>
      <tr>
        <th></th><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th>
      </tr>
      ${itemRows}
    </table>
  </div>

  <!-- Shipping address block -->
  <div class="section">
    <h3>Shipping To</h3>
    <p style="font-size:14px;margin:0;line-height:1.6;">
      <strong>${order.shipping_address.full_name}</strong><br/>
      ${order.shipping_address.address_line1}
      ${order.shipping_address.address_line2 ? "<br/>" + order.shipping_address.address_line2 : ""}
      <br/>${order.shipping_address.city}, ${order.shipping_address.state} — ${order.shipping_address.zip_code}
      <br/>📱 ${order.shipping_address.phone}
    </p>
  </div>

  <!-- Price breakdown -->
  <div class="section">
    <h3>Order Summary</h3>
    <div class="summary-row"><span>Subtotal:</span><span>₹${order.subtotal.toLocaleString("en-IN")}</span></div>
    <div class="summary-row"><span>Delivery:</span><span style="color:#00a651">${order.shipping === 0 ? "FREE" : "₹" + order.shipping}</span></div>
    <div class="summary-row"><span>GST (18%):</span><span>₹${Math.round(order.tax).toLocaleString("en-IN")}</span></div>
    <div class="summary-row total"><span>Total Paid:</span><span>₹${Math.round(order.total).toLocaleString("en-IN")}</span></div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Questions? Visit <a href="http://localhost:8080/orders">Your Orders</a></p>
    <p>© 2026 ShopKart, Inc. — Built by Arpit Sharma</p>
  </div>

</div>
</body>
</html>`;
}

// ── Public API ─────────────────────────────────────────────────

/**
 * sendOrderConfirmationEmail(order, toEmail)
 * ──────────────────────────────────────────
 * Sends an HTML order confirmation email.
 *
 * @param {object} order     - Full order object from DB
 *                             (includes order.items[], order.shipping_address)
 * @param {string} toEmail   - Customer's email address
 *                             (from checkout form or default "customer@shopkart.in")
 *
 * @returns {string|null}    - Ethereal preview URL (only in ethereal mode)
 *                             Returns null in Gmail mode (email went to real inbox)
 *
 * ── WHERE EMAIL IS SENT ────────────────────────────────────────
 * Gmail mode:   Real email → toEmail (the address collected at checkout)
 * Ethereal mode: Fake email → Preview URL printed in terminal
 *
 * ── WHERE TO FIND THE EMAIL ────────────────────────────────────
 * Gmail mode:   Check your Gmail inbox for the address in MAIL_USER
 *               (or MAIL_TO_OVERRIDE if set in .env)
 * Ethereal mode: Copy the preview URL from terminal and open in browser
 */
async function sendOrderConfirmationEmail(order, toEmail) {
  const transport = await getTransporter();
  const provider = (process.env.MAIL_PROVIDER || "ethereal").toLowerCase();

  // In development, optionally override recipient to a fixed address
  // (useful so test orders don't email random customers)
  const recipient = process.env.MAIL_TO_OVERRIDE || toEmail || "customer@shopkart.in";

  const fromAddress =
    process.env.MAIL_FROM ||
    (provider === "gmail"
      ? `"ShopKart" <${process.env.MAIL_USER}>`
      : '"ShopKart" <noreply@shopkart.in>');

  const html = buildOrderEmailHTML(order);

  const info = await transport.sendMail({
    from: fromAddress,
    to: recipient,
    subject: `Order Confirmed: ${order.id} — Your ShopKart order is placed! 🎉`,
    html,
    // Plain-text fallback for email clients that don't render HTML
    text:
      `Order Confirmed!\n\n` +
      `Order ID: ${order.id}\n` +
      `Total: ₹${Math.round(order.total).toLocaleString("en-IN")}\n\n` +
      `Thank you for shopping with ShopKart!`,
  });

  if (provider === "gmail") {
    // ── Gmail: email delivered to real inbox ──────────────────
    console.log("\n🎉 Order confirmation email SENT via Gmail!");
    console.log("════════════════════════════════════════");
    console.log(`   From:    ${fromAddress}`);
    console.log(`   To:      ${recipient}`);
    console.log(`   Order:   ${order.id}`);
    console.log(`   Subject: Order Confirmed: ${order.id}`);
    console.log("════════════════════════════════════════\n");
    return null; // No preview URL for real emails
  } else {
    // ── Ethereal: email is NOT actually delivered ─────────────
    // Open the preview URL in any browser to see the email.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("\n🎉 Order confirmation email sent (Ethereal preview)!");
    console.log("════════════════════════════════════════");
    console.log(`📧 Preview URL: ${previewUrl}`);
    console.log(
      "   ↑ Open this URL in your browser to see what the email looks like."
    );
    console.log("════════════════════════════════════════\n");
    return previewUrl;
  }
}

module.exports = { sendOrderConfirmationEmail };
