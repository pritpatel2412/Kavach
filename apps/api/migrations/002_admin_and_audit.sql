-- 002_admin_and_audit.sql: Admin authentication, sessions, and append-only hash-chained audit log
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'support_agent', 'viewer')),
  totp_secret_enc TEXT,
  created_at TEXT NOT NULL,
  last_login TEXT,
  is_suspended INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_magic_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  session_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_activity TEXT NOT NULL,
  absolute_expiry TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  step_up_valid_until TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  prev_hash TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload_masked TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  locked_until TEXT,
  last_attempt TEXT
);
