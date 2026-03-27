/**
 * ============================================================
 * db.js — PostgreSQL Database (via node-postgres `pg`)
 * ============================================================
 *
 * ── WHERE IS THE DATABASE? ────────────────────────────────────
 *
 *   LOCAL DEVELOPMENT:
 *     PostgreSQL running locally (installed via Homebrew)
 *     Database name: shopkart
 *     Connection: postgresql://localhost/shopkart
 *     Config via: server/.env → DATABASE_URL
 *
 *   PRODUCTION (Render + Neon):
 *     Neon serverless PostgreSQL (cloud)
 *     DATABASE_URL set as environment variable on Render
 *     Format: postgresql://user:pass@host/dbname?sslmode=require
 *
 * ── HOW TO INSPECT THE DATA ───────────────────────────────────
 *
 *   CLI (local):  psql shopkart
 *                 \dt              — list all tables
 *                 SELECT * FROM products;
 *
 *   GUI:  pgAdmin, TablePlus, or DBeaver (all free)
 *   Cloud: Neon dashboard → SQL editor tab
 *
 * ── DATABASE TABLES ───────────────────────────────────────────
 *
 *   products              — product catalogue (16 seeded items)
 *   product_images        — 1:many product images
 *   product_specifications — flexible key-value specs per product
 *   users                 — registered user accounts
 *   orders                — placed orders (id, totals, status)
 *   order_items           — individual line items per order
 *   shipping_addresses    — delivery address for each order
 *   wishlist              — user ↔ product saved items
 *   cart_items            — persistent server-side cart (backup)
 *
 * ── MIGRATION NOTE ────────────────────────────────────────────
 *
 *   This file replaces the previous sql.js (SQLite/WASM) driver.
 *   The schema is identical — only the driver changed.
 *   All queries are now async (Promise-based via pg Pool).
 * ============================================================
 */

require("dotenv").config(); // Load server/.env for DATABASE_URL
const { Pool } = require("pg");
const path = require("path");

// ─── Connection Pool ───────────────────────────────────────────────────────────
// DATABASE LOCATION: configured via DATABASE_URL in server/.env
// Local:      postgresql://localhost/shopkart
// Production: postgresql://user:pass@neon-host/shopkart?sslmode=require

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost/shopkart",
  // Enable SSL in production (required by Neon / Render)
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

// ─── Schema ────────────────────────────────────────────────────────────────────

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    brand           TEXT,
    category        TEXT,
    price           NUMERIC(10,2) NOT NULL,
    original_price  NUMERIC(10,2),
    rating          NUMERIC(3,2) DEFAULT 0,
    review_count    INTEGER DEFAULT 0,
    in_stock        BOOLEAN DEFAULT TRUE,
    is_prime        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id          SERIAL PRIMARY KEY,
    product_id  TEXT NOT NULL,
    url         TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS product_specifications (
    id          SERIAL PRIMARY KEY,
    product_id  TEXT NOT NULL,
    spec_key    TEXT NOT NULL,
    spec_value  TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    subtotal    NUMERIC(10,2) NOT NULL,
    shipping    NUMERIC(10,2) DEFAULT 0,
    tax         NUMERIC(10,2) NOT NULL,
    total       NUMERIC(10,2) NOT NULL,
    status      TEXT DEFAULT 'Confirmed',
    placed_at   TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id            SERIAL PRIMARY KEY,
    order_id      TEXT NOT NULL,
    product_id    TEXT NOT NULL,
    product_name  TEXT NOT NULL,
    product_image TEXT,
    unit_price    NUMERIC(10,2) NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS shipping_addresses (
    id            SERIAL PRIMARY KEY,
    order_id      TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city          TEXT NOT NULL,
    state         TEXT NOT NULL,
    zip_code      TEXT NOT NULL,
    phone         TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    user_id     TEXT NOT NULL,
    product_id  TEXT NOT NULL,
    added_at    TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    user_id     TEXT NOT NULL,
    product_id  TEXT NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, product_id)
  );
`;

// ─── Seed data ────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id:"1", name:"Wireless Bluetooth Headphones with Active Noise Cancellation", description:"Experience immersive sound with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions.", brand:"SoundMax", category:"Electronics", price:4999, original_price:8999, rating:4.5, review_count:2847, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600","https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600","https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600"], specs:{"Battery Life":"30 hours","Connectivity":"Bluetooth 5.2","Weight":"250g","Driver Size":"40mm"} },
  { id:"2", name:"4K Ultra HD Smart TV 55-Inch with HDR10+", description:"Stunning 4K resolution with HDR10+ support. Built-in streaming apps, voice control, and sleek borderless design.", brand:"VisionTech", category:"Electronics", price:34999, original_price:54999, rating:4.3, review_count:1523, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600","https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=600"], specs:{"Screen Size":"55 Inch","Resolution":"3840x2160 (4K)","HDR":"HDR10+","Refresh Rate":"60Hz","Ports":"4x HDMI, 2x USB"} },
  { id:"3", name:"JBL Flip 6 Portable Waterproof Bluetooth Speaker", description:"IP67 waterproof portable speaker with powerful 30W RMS sound and 12-hour battery.", brand:"JBL", category:"Electronics", price:8499, original_price:13999, rating:4.6, review_count:4201, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600","https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600"], specs:{"Output Power":"30W RMS","Battery":"12 hours","Waterproof":"IP67","Connectivity":"Bluetooth 5.1"} },
  { id:"4", name:"Logitech G502 Hero Gaming Mouse", description:"High-performance gaming mouse with HERO 25K sensor, 11 programmable buttons.", brand:"Logitech", category:"Electronics", price:4499, original_price:7999, rating:4.7, review_count:8932, in_stock:true, is_prime:false, images:["https://images.unsplash.com/photo-1527814050087-3793815479db?w=600"], specs:{"Sensor":"HERO 25K","DPI":"100-25600","Buttons":"11 Programmable","Cable":"2.1m braided"} },
  { id:"5", name:"Apple Magic Keyboard - Space Grey", description:"Wireless keyboard with scissor mechanism keys and rechargeable battery.", brand:"Apple", category:"Electronics", price:9999, original_price:11999, rating:4.4, review_count:3102, in_stock:false, is_prime:true, images:["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"], specs:{"Connectivity":"Bluetooth","Battery":"Built-in rechargeable","Colour":"Space Grey","Layout":"US English"} },
  { id:"6", name:"Atomic Habits - James Clear (Paperback)", description:"Proven framework for improving every day. Learn how tiny changes in behaviour lead to remarkable results.", brand:"Penguin Books", category:"Books", price:399, original_price:599, rating:4.8, review_count:12405, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"], specs:{"Pages":"320","Language":"English","Publisher":"Random House Business","ISBN":"9781847941831"} },
  { id:"7", name:"The Psychology of Money - Morgan Housel", description:"Timeless lessons on wealth, greed, and happiness.", brand:"Harriman House", category:"Books", price:350, original_price:499, rating:4.7, review_count:8231, in_stock:true, is_prime:false, images:["https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600"], specs:{"Pages":"256","Language":"English","Publisher":"Harriman House","Format":"Paperback"} },
  { id:"8", name:"Nike Air Max 270 React Men Sneakers", description:"All-day cushioning with React foam and a huge Air unit. Lightweight, breathable mesh upper.", brand:"Nike", category:"Clothing", price:11995, original_price:14995, rating:4.5, review_count:3847, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600"], specs:{"Material":"Mesh Upper","Sole":"React Foam + Air","Closure":"Lace-up","Available Sizes":"UK 6-12"} },
  { id:"9", name:"Levi 511 Slim Fit Jeans - Dark Wash", description:"Classic slim fit jeans with a slight taper. Made with stretch denim for all-day comfort.", brand:"Levis", category:"Clothing", price:2999, original_price:4499, rating:4.3, review_count:5621, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=600"], specs:{"Fit":"Slim","Rise":"Mid-rise","Material":"94% Cotton, 4% Polyester, 2% Elastane","Wash":"Dark Indigo"} },
  { id:"10", name:"Instant Pot Duo 7-in-1 Electric Pressure Cooker 5L", description:"7-in-1 multi-cooker: pressure cooker, slow cooker, rice cooker, steamer, saute, yogurt maker, and warmer.", brand:"Instant Pot", category:"Home & Kitchen", price:6999, original_price:9999, rating:4.6, review_count:7203, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1585515320310-259814833e62?w=600"], specs:{"Capacity":"5 Litre","Power":"1000W","Functions":"7-in-1","Safety":"10+ safety features"} },
  { id:"11", name:"Philips Air Fryer HD9200 - 4.1L", description:"Up to 90% less fat than traditional frying. Rapid Air Technology for crispy results.", brand:"Philips", category:"Home & Kitchen", price:7499, original_price:11995, rating:4.4, review_count:4892, in_stock:true, is_prime:false, images:["https://images.unsplash.com/photo-1648170753857-a13cac6dab19?w=600"], specs:{"Capacity":"4.1L","Power":"1400W","Temperature":"60-200 degrees C","Timer":"30 min"} },
  { id:"12", name:"Yoga Mat Thick Non-Slip with Alignment Lines", description:"6mm thick eco-friendly TPE yoga mat with alignment lines, carry strap, and superior grip.", brand:"FitLife", category:"Sports & Outdoors", price:1299, original_price:2199, rating:4.5, review_count:2341, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"], specs:{"Thickness":"6mm","Material":"TPE eco-friendly","Dimensions":"183x61cm","Weight":"1.1kg"} },
  { id:"13", name:"Adjustable Dumbbell Set 2-24kg", description:"Space-saving adjustable dumbbells replacing 15 sets. Dial adjustment system, durable build.", brand:"PowerFlex", category:"Sports & Outdoors", price:8999, original_price:14999, rating:4.6, review_count:1834, in_stock:true, is_prime:false, images:["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"], specs:{"Weight Range":"2-24kg","Increment":"2kg","Material":"Steel + ABS","Replaces":"15 dumbbells"} },
  { id:"14", name:"LEGO Technic Formula E Racing Car 42156", description:"Build a detailed Formula E race car with 400+ pieces. Real-life design features, easy-to-follow instructions.", brand:"LEGO", category:"Toys & Games", price:3499, original_price:4999, rating:4.7, review_count:987, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"], specs:{"Pieces":"400+","Age":"10+","Theme":"Technic","Dimensions":"Assembled 43x11x14cm"} },
  { id:"15", name:"Maybelline Fit Me Matte Poreless Foundation", description:"Natural matte finish foundation that blurs pores. Oil-free formula for 12-hour wear.", brand:"Maybelline", category:"Beauty", price:549, original_price:799, rating:4.2, review_count:6701, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600"], specs:{"Finish":"Matte","Coverage":"Medium to full","SPF":"No","Volume":"30ml"} },
  { id:"16", name:"Tata Tea Gold Premium Blend 500g", description:"Premium Assam and Darjeeling blend for a rich, refreshing cup every time.", brand:"Tata Tea", category:"Grocery", price:299, original_price:350, rating:4.5, review_count:15023, in_stock:true, is_prime:true, images:["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"], specs:{"Weight":"500g","Type":"CTC Blend","Origin":"Assam + Darjeeling","Shelf Life":"24 months"} },
];

// ─── Initialize ───────────────────────────────────────────────────────────────

/**
 * initDb()
 * ─────────
 * Creates all tables (if not exist) and seeds products on first run.
 * Called once at server startup before routes are mounted.
 */
async function initDb() {
  const client = await pool.connect();
  try {
    console.log("⚙️  Running schema migrations...");
    await client.query(SCHEMA);
    console.log("✅ Schema ready");

    // Seed products if table is empty
    const { rows } = await client.query("SELECT COUNT(*) AS c FROM products");
    if (parseInt(rows[0].c) === 0) {
      console.log("🌱 Seeding products...");
      for (const p of PRODUCTS) {
        await client.query(
          `INSERT INTO products (id,name,description,brand,category,price,original_price,rating,review_count,in_stock,is_prime)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.description, p.brand, p.category, p.price, p.original_price ?? null, p.rating, p.review_count, p.in_stock, p.is_prime]
        );
        for (let i = 0; i < (p.images || []).length; i++) {
          await client.query(
            "INSERT INTO product_images (product_id,url,sort_order) VALUES ($1,$2,$3)",
            [p.id, p.images[i], i]
          );
        }
        for (const [k, v] of Object.entries(p.specs || {})) {
          await client.query(
            "INSERT INTO product_specifications (product_id,spec_key,spec_value) VALUES ($1,$2,$3)",
            [p.id, k, v]
          );
        }
      }
      console.log(`✅ Seeded ${PRODUCTS.length} products`);
    } else {
      console.log(`📦 Products already seeded (${rows[0].c} found)`);
    }
  } finally {
    client.release();
  }
}

/**
 * getDb()
 * ────────
 * Returns the pg Pool instance for use in route handlers.
 * All queries: await pool.query(sql, [params])
 */
function getDb() {
  return pool;
}

module.exports = { initDb, getDb };
