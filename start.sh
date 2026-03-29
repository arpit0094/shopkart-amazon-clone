#!/usr/bin/env zsh
# ============================================================
#  ShopKart — One-Command Startup Script
#  Usage:  chmod +x start.sh  then  ./start.sh
# ============================================================

set -e

# Add Homebrew PostgreSQL to PATH (needed on Mac)
export PATH="/usr/local/Cellar/postgresql@16/16.10_1/bin:/opt/homebrew/bin:$PATH"

PROJ_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$PROJ_DIR/server"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║           ShopKart — Starting Up                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Check PostgreSQL is running ──────────────────────────
echo "🗄️  Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
  echo "   ✅ PostgreSQL is running"
else
  echo "   🔄 Starting PostgreSQL..."
  brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 2
  if pg_isready -q 2>/dev/null; then
    echo "   ✅ PostgreSQL started"
  else
    echo "   ❌ Could not start PostgreSQL — check Homebrew services"
    exit 1
  fi
fi

# Ensure the shopkart database exists
if ! psql -lqt 2>/dev/null | cut -d '|' -f 1 | grep -qw shopkart; then
  echo "   🛠️  Creating 'shopkart' database..."
  createdb shopkart 2>/dev/null || true
  echo "   ✅ Database created"
else
  echo "   ✅ Database 'shopkart' exists"
fi
echo ""

# ── 2. Install server dependencies if needed ─────────────────
echo "📦 Checking server dependencies..."
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "   Installing npm packages in server/..."
  (cd "$SERVER_DIR" && npm install)
fi
echo "   ✅ Server dependencies ready"
echo ""

# ── 3. Install frontend dependencies if needed ───────────────
echo "📦 Checking frontend dependencies..."
if [ ! -d "$PROJ_DIR/node_modules" ]; then
  echo "   Installing npm packages (frontend)..."
  (cd "$PROJ_DIR" && npm install)
fi
echo "   ✅ Frontend dependencies ready"
echo ""

# ── 4. Check Gmail credentials ───────────────────────────────
echo "📧 Checking email configuration..."
MAIL_PROVIDER=$(grep '^MAIL_PROVIDER=' "$SERVER_DIR/.env" 2>/dev/null | cut -d= -f2 | tr -d ' \r')
MAIL_USER=$(grep '^MAIL_USER=' "$SERVER_DIR/.env" 2>/dev/null | cut -d= -f2 | tr -d ' \r')
echo "   Provider : $MAIL_PROVIDER"
echo "   Gmail    : $MAIL_USER"
if [ "$MAIL_PROVIDER" = "gmail" ]; then
  echo "   Mode     : ✅ Gmail SMTP (real emails to customers)"
else
  echo "   Mode     : ⚠️  Ethereal (fake preview — update MAIL_PROVIDER=gmail for real emails)"
fi
echo ""

# ── 5. Start backend (background) ────────────────────────────
echo "🚀 Starting backend API server..."
(cd "$SERVER_DIR" && node index.js &)
BACKEND_PID=$!
sleep 3

# Quick health check
if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "   ✅ Backend running → http://localhost:3001/api"
else
  echo "   ⚠️  Backend may still be starting — check terminal output"
fi
echo ""

# ── 6. Start frontend (foreground) ───────────────────────────
echo "🌐 Starting frontend dev server..."
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Frontend:  http://localhost:8080               ║"
echo "║   Backend:   http://localhost:3001/api           ║"
echo "║   Health:    http://localhost:3001/api/health    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

trap "kill $BACKEND_PID 2>/dev/null; echo 'Servers stopped.'; exit 0" INT TERM

(cd "$PROJ_DIR" && npm run dev)
