-- 009_analytics_and_rollups.sql: Daily analytics rollups, provider usage tracking, and demo dataset metadata
CREATE TABLE IF NOT EXISTS daily_analytics_rollups (
  day TEXT PRIMARY KEY,
  waitlist_total INTEGER DEFAULT 0,
  waitlist_confirmed INTEGER DEFAULT 0,
  households_active INTEGER DEFAULT 0,
  devices_active INTEGER DEFAULT 0,
  sessions_total INTEGER DEFAULT 0,
  alerts_l2 INTEGER DEFAULT 0,
  alerts_l3 INTEGER DEFAULT 0,
  scam_attempts_intercepted INTEGER DEFAULT 0,
  tickets_opened INTEGER DEFAULT 0,
  tickets_solved INTEGER DEFAULT 0,
  revenue_paise INTEGER DEFAULT 0,
  cost_paise INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_usage (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  usage_type TEXT NOT NULL,
  units INTEGER NOT NULL,
  estimated_cost_paise INTEGER NOT NULL,
  session_id TEXT,
  recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_dataset_meta (
  key TEXT PRIMARY KEY,
  is_demo INTEGER DEFAULT 0,
  seeded_at TEXT,
  record_count INTEGER DEFAULT 0
);
