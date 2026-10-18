-- 001_initial_core.sql: Base tables for Kavach Core System
CREATE TABLE IF NOT EXISTS guardians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('m', 'f')),
  telegram_chat_id TEXT,
  token TEXT,
  token_hash TEXT
);

CREATE TABLE IF NOT EXISTS daily_usage (
  usage_date TEXT PRIMARY KEY,
  minutes REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS elders (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS voice_profiles (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  elder_id TEXT REFERENCES elders(id) ON DELETE SET NULL,
  embedding_json TEXT NOT NULL,
  consent_ts TEXT NOT NULL,
  liveness_phrase TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS clips (
  id TEXT PRIMARY KEY,
  voice_profile_id TEXT NOT NULL REFERENCES voice_profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  language TEXT NOT NULL,
  audio_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  elder_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  max_score INTEGER DEFAULT 0,
  max_level INTEGER DEFAULT 0,
  synthetic INTEGER DEFAULT 1,
  feedback TEXT,
  last_heartbeat TEXT,
  offline_alert_sent INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  segment_index INTEGER,
  text_excerpt TEXT,
  stages TEXT,
  score INTEGER,
  level INTEGER,
  reason_en TEXT,
  reason_hi TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  level INTEGER NOT NULL,
  delivered INTEGER NOT NULL,
  action_token TEXT
);
