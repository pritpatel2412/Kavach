-- 006_coupons_and_referrals.sql: Coupons engine, hold reservations, redemptions, and referral links
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat', 'extra_period', 'bonus_minutes', 'trial_upgrade', 'partner')),
  discount_value INTEGER NOT NULL,
  max_discount_paise INTEGER,
  min_order_paise INTEGER DEFAULT 0,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  max_per_user INTEGER DEFAULT 1,
  new_customer_only INTEGER DEFAULT 0,
  eligible_plans TEXT DEFAULT '["plus","family"]',
  is_active INTEGER DEFAULT 1,
  expires_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_code TEXT NOT NULL REFERENCES coupons(code),
  household_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'redeemed', 'released')),
  discount_paise INTEGER NOT NULL,
  reserved_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  redeemed_at TEXT,
  UNIQUE(household_id, coupon_code, order_id)
);

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_household_id TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referee_household_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded')),
  reward_minutes INTEGER DEFAULT 30,
  created_at TEXT NOT NULL,
  qualified_at TEXT
);
