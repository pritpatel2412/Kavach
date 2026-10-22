-- 012_guardian_auth_and_pairing.sql: Guardian passwordless auth, sessions with refresh rotation, and device pairing with elder consent
ALTER TABLE guardians ADD COLUMN email TEXT;

CREATE TABLE IF NOT EXISTS guardian_magic_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guardian_sessions (
  session_id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL,
  email TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_activity TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS device_pairing_codes (
  code TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL,
  elder_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
  FOREIGN KEY (elder_id) REFERENCES elders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paired_devices (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL,
  elder_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  elder_consent_ts TEXT NOT NULL,
  paired_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
  FOREIGN KEY (elder_id) REFERENCES elders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guardian_otps (
  identifier TEXT PRIMARY KEY,
  otp_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
