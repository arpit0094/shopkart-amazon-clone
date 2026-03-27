# ShopKart — Amazon Clone E-Commerce Platform

> **SDE Intern Fullstack Assignment** — A fully functional e-commerce web application that closely replicates Amazon's design and user experience.

![ShopKart](https://img.shields.io/badge/ShopKart-E--Commerce%20Clone-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal?style=flat-square&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-Database-blue?style=flat-square&logo=sqlite)

---

## ✨ Features

### Core Features (Implemented)
| Feature | Status |
|---|---|
| Product Listing Page — grid, search, filter by category | ✅ |
| Product Detail Page — image carousel, specs, buy box | ✅ |
| Shopping Cart — quantity management, subtotal | ✅ |
| Order Placement — shipping form, order summary | ✅ |
| Order Confirmation — order ID, ETA | ✅ |
| Order History — all past orders | ✅ |
| **SQLite Database** — persistent orders, products, users | ✅ |
| **Email Notifications** — HTML order confirmation via Gmail/Ethereal | ✅ |

### Bonus Features (Implemented)
| Feature | Status |
|---|---|
| Wishlist — add/remove/move to cart | ✅ |
| User Authentication — Login / Signup | ✅ |
| Responsive Design — mobile, tablet, desktop | ✅ |
| Hero Banner — auto-rotating promotional carousel | ✅ |
| Category Grid — "Shop by Category" tiles | ✅ |
| Deals of the Day — discount-filtered section | ✅ |
| Related Products — horizontal scroll carousel | ✅ |
| Prime Badge — on eligible products | ✅ |
| Order Status Timeline — visual progress tracker | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18** with **TypeScript** |
| Build Tool | **Vite 5** |
| Routing | **React Router DOM v6** |
| Styling | **TailwindCSS v3** with custom design tokens |
| UI Components | **Radix UI** (via shadcn/ui) |
| State Management | **React Context API** |
| Backend | **Node.js + Express.js** |
| Database | **SQLite** (via sql.js — WebAssembly, no native compilation) |
| Email | **Nodemailer** (Gmail SMTP or Ethereal test inbox) |
| Icons | **Lucide React** |

---


## 📊 Database Schema Design

The data model is defined in TypeScript interfaces (`src/types/index.ts`) and maps directly to a relational schema:

```sql
-- Products table
CREATE TABLE products (
  id          VARCHAR(36) PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  brand       VARCHAR(100),
  category    VARCHAR(100),
  price       DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating      DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  in_stock    BOOLEAN DEFAULT TRUE,
  is_prime    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Product images (1:many)
CREATE TABLE product_images (
  id         SERIAL PRIMARY KEY,
  product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Product specifications (flexible key-value)
CREATE TABLE product_specifications (
  id         SERIAL PRIMARY KEY,
  product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
  spec_key   VARCHAR(100),
  spec_value TEXT
);

-- Users table
CREATE TABLE users (
  id         VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id         VARCHAR(50) PRIMARY KEY,
  user_id    VARCHAR(36) REFERENCES users(id),
  subtotal   DECIMAL(10,2) NOT NULL,
  shipping   DECIMAL(10,2) DEFAULT 0,
  tax        DECIMAL(10,2) NOT NULL,
  total      DECIMAL(10,2) NOT NULL,
  status     ENUM('Confirmed','Processing','Shipped','Delivered') DEFAULT 'Confirmed',
  placed_at  TIMESTAMP DEFAULT NOW()
);

-- Order items (many-to-many: orders ↔ products)
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(36) REFERENCES products(id),
  quantity   INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL  -- snapshot price at time of purchase
);

-- Shipping addresses
CREATE TABLE shipping_addresses (
  id           SERIAL PRIMARY KEY,
  order_id     VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  full_name    VARCHAR(255) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city         VARCHAR(100) NOT NULL,
  state        VARCHAR(100) NOT NULL,
  zip_code     VARCHAR(20) NOT NULL,
  phone        VARCHAR(20) NOT NULL
);

-- Wishlist (many-to-many: users ↔ products)
CREATE TABLE wishlist (
  user_id    VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
  added_at   TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Cart items
CREATE TABLE cart_items (
  user_id    VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, product_id)
);
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js **v18+**
- npm or bun

### 1. Install Frontend Dependencies

```bash
# From the project root
npm install
# or
bun install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure Email (server/.env)

The backend reads from `server/.env` — **copy and edit** this file before starting:

```bash
# The file is already created at server/.env
# Edit it to set your email provider:
```

**Option A — Gmail (real emails):**
```env
MAIL_PROVIDER=gmail
MAIL_USER=arpitsharma@gmail.com        # Your Gmail address
MAIL_PASS=xxxx xxxx xxxx xxxx          # Gmail App Password (not your login password)
MAIL_FROM=ShopKart <arpitsharma@gmail.com>
```
> Get an App Password: Google Account → Security → App Passwords → Mail

**Option B — Ethereal (no setup needed, just preview URL in terminal):**
```env
MAIL_PROVIDER=ethereal
```

### 4. Start the Backend

```bash
cd server
npm start
# Server runs at http://localhost:3001
```

You'll see:
```
╔══════════════════════════════════════════╗
║      ShopKart Backend API v1.0           ║
╠══════════════════════════════════════════╣
║  API:      http://localhost:3001/api     ║
║  Products: /api/products                 ║
║  Orders:   /api/orders                   ║
╚══════════════════════════════════════════╝
```

**Database is auto-created** at `server/shopkart.db` on first run (16 products seeded).

### 5. Start the Frontend

```bash
# In a new terminal, from project root
npm run dev
```

Frontend available at **http://localhost:8080**

### 6. Place a Test Order

1. Visit http://localhost:8080
2. Add products to cart
3. Go to Cart → Checkout
4. Fill in address (use any test data)
5. Click **"Place Your Order"**
6. Check your email inbox (Gmail) or the terminal for the Ethereal preview URL

---

## 📂 Where Is Everything?

| Thing | Location |
|---|---|
| **SQLite Database** | `server/shopkart.db` |
| **Database Schema + Seed** | `server/db.js` |
| **Email Service** | `server/services/emailService.js` |
| **Email Config** | `server/.env` |
| **API Routes** | `server/routes/` |
| **Backend Entry Point** | `server/index.js` |
| **Frontend API Client** | `src/lib/api.ts` |
| **Cart + Order Logic** | `src/context/CartContext.tsx` |

### Other Scripts

```bash
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run test         # Run tests (Vitest)
```

---


## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Sticky nav bar with search, cart, wishlist
│   ├── Footer.tsx          # Reusable 4-column footer
│   ├── ProductCard.tsx     # Grid product card with wishlist + prime
│   ├── StarRating.tsx      # Reusable star rating display
│   ├── HeroBanner.tsx      # Auto-rotating promotional carousel
│   ├── CategoryGrid.tsx    # "Shop by Category" tiles
│   ├── RelatedProducts.tsx # Horizontal scroll related items
│   └── WishlistButton.tsx  # Heart toggle wishlist button
├── context/
│   ├── CartContext.tsx     # Shopping cart + wishlist global state
│   └── AuthContext.tsx     # Simulated auth state
├── data/
│   └── products.ts         # 26 seed products + hero banner data
├── pages/
│   ├── Index.tsx           # Homepage with hero + categories + listing
│   ├── ProductDetail.tsx   # Full product page with carousel
│   ├── Cart.tsx            # Shopping cart management
│   ├── Checkout.tsx        # Shipping form + order summary
│   ├── OrderConfirmation.tsx # Post-order success page
│   ├── Orders.tsx          # Order history with status timeline
│   ├── Wishlist.tsx        # Saved items page
│   ├── Login.tsx           # Sign-in form
│   └── Signup.tsx          # Registration with password strength
└── types/
    └── index.ts            # TypeScript interfaces (Product, Order, User…)
```

---

## 💡 Assumptions Made

1. **No real backend** — localStorage is used for all persistence. The data schema (see above) reflects what a production backend would use.
2. **Default user always logged in** — As per the assignment spec: "assume a default user is logged in." The app auto-creates a default user on first load.
3. **Currency** — Indian Rupee (₹ / INR) is used throughout. Shipping is free above ₹499, and 18% GST is applied.
4. **Product images** — Sourced from Unsplash (public CDN). In production these would be stored in S3/CloudFront.
5. **Order status** — Orders are placed in "Confirmed" status. Status progression (Processing → Shipped → Delivered) would be driven by a backend job queue in production.
6. **Search** — Client-side filtering across name, description, brand, and category fields. In production this would be Elasticsearch or a SQL `ILIKE` query.

---

## 🌐 Deployment

The app is statically built and can be deployed to any CDN:

```bash
npm run build
# Outputs to dist/ → deploy to Vercel, Netlify, or any static host
```

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify deploy --prod --dir=dist
```

---

## 👨‍💻 Author

**Arpit Sharma** — SDE Intern Assignment Submission

---

*Built with ❤️ as an Amazon-inspired experience*
