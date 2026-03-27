/**
 * ============================================================
 * index.js — Express Backend Entry Point
 * ============================================================
 *
 * ── DATABASE LOCATION ─────────────────────────────────────────
 *   server/shopkart.db  (SQLite binary, auto-created on first run)
 *   See server/db.js for the full schema and seeding logic.
 *
 * ── EMAIL CONFIGURATION ───────────────────────────────────────
 *   server/.env  (environment variables — NOT committed to git)
 *   See server/services/emailService.js for the full email logic.
 *
 *   MAIL_PROVIDER=gmail    → real emails via Gmail SMTP
 *   MAIL_PROVIDER=ethereal → terminal preview URL only
 *
 * ── API ENDPOINTS ─────────────────────────────────────────────
 *   GET  /api/health              → server status check
 *   GET  /api/products            → list all products (search/filter)
 *   GET  /api/products/categories → distinct category list
 *   GET  /api/products/:id        → single product detail
 *   POST /api/orders              → place order + send email
 *   GET  /api/orders?userId=      → order history for a user
 *   GET  /api/orders/:id          → single order detail
 * ============================================================
 */

require("dotenv").config(); // Load server/.env before anything else
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check (no DB needed)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start database FIRST, then mount routes and start server
initDb()
  .then(() => {
    // Mount routes after DB is ready
    const productRoutes = require("./routes/products");
    const orderRoutes = require("./routes/orders");

    app.use("/api/products", productRoutes);
    app.use("/api/orders", orderRoutes);

    // 404 handler
    app.use((_req, res) => res.status(404).json({ error: "Endpoint not found" }));

    // Error handler
    app.use((err, _req, res, _next) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });

    app.listen(PORT, () => {
      console.log("\n╔══════════════════════════════════════════╗");
      console.log("║      ShopKart Backend API v1.0           ║");
      console.log("╠══════════════════════════════════════════╣");
      console.log(`║  API:      http://localhost:${PORT}/api      ║`);
      console.log(`║  Products: /api/products                  ║`);
      console.log(`║  Orders:   /api/orders                    ║`);
      console.log(`║  Health:   /api/health                    ║`);
      console.log("╚══════════════════════════════════════════╝\n");
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

module.exports = app;
