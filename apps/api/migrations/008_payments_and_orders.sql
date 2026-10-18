-- 008_payments_and_orders.sql: Orders, payments, subscriptions, and credit ledger
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  base_paise INTEGER NOT NULL,
  discount_paise INTEGER NOT NULL DEFAULT 0,
  taxable_paise INTEGER NOT NULL,
  gst_paise INTEGER NOT NULL,
  total_paise INTEGER NOT NULL,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'expired')),
  payment_id TEXT,
  payment_provider TEXT DEFAULT 'fake',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  household_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('authorized', 'captured', 'failed', 'refunded')),
  provider_payment_id TEXT,
  provider_signature TEXT,
  raw_event_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TEXT NOT NULL,
  current_period_end TEXT NOT NULL,
  bonus_minutes INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  amount_minutes INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TEXT NOT NULL
);
