-- 004_waitlist.sql: Waitlist submissions and email campaign management
CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  language TEXT NOT NULL DEFAULT 'hi-IN',
  city TEXT,
  for_who TEXT,
  consent_version TEXT NOT NULL,
  source TEXT DEFAULT 'direct',
  utm_source TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL DEFAULT 'pending_confirm' CHECK (status IN ('pending_confirm', 'confirmed', 'invited', 'activated', 'unsubscribed', 'bounced')),
  confirmation_token_hash TEXT,
  confirmed_at TEXT,
  invite_code TEXT,
  invited_at TEXT,
  tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '[]',
  ip TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waitlist_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  segment_filter TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  scheduled_for TEXT,
  completed_at TEXT
);
