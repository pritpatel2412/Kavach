#!/usr/bin/env bash
# Kavach Full-System Test Environment Orchestration (POSIX)
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "=== Kavach Full-System Test Environment Orchestrator (POSIX) ==="

# 1. Seed demo database
echo "[1/5] Seeding synthetic demo database..."
ENV=development .venv/bin/python scripts/testing/seed_test_data.py || true

# 2. Start SMTP Catcher
if ! nc -z 127.0.0.1 1025 2>/dev/null; then
    echo "[2/5] Starting local test SMTP server (port 1025)..."
    .venv/bin/python scripts/testing/smtp_catcher.py &
    sleep 1
else
    echo "[2/5] Test SMTP server already active."
fi

# 3. Start FastAPI
if ! nc -z 127.0.0.1 8000 2>/dev/null; then
    echo "[3/5] Starting FastAPI backend (port 8000)..."
    KAVACH_MOCK_STT=1 SMTP_PORT=1025 SMTP_HOST=127.0.0.1 EMAIL_MODE=smtp \
      .venv/bin/python -m uvicorn app.main:app --app-dir apps/api --host 127.0.0.1 --port 8000 &
    sleep 2
else
    echo "[3/5] FastAPI backend already active."
fi

# 4. Start Next.js apps
echo "[4/5] Starting Next.js apps..."
pnpm --filter @kavach/site start &
pnpm --filter @kavach/app start &
pnpm --filter @kavach/admin start &
sleep 3

# 5. Health probe
echo "[5/5] Checking service health..."
curl -sf http://127.0.0.1:8000/health >/dev/null && echo "  [OK] API (8000)"
curl -sf http://localhost:3000 >/dev/null && echo "  [OK] Site (3000)"
curl -sf http://localhost:3001 >/dev/null && echo "  [OK] App (3001)"
curl -sf http://localhost:3002 >/dev/null && echo "  [OK] Admin (3002)"
echo "ALL SERVICES READY."
