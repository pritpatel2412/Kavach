-- 007_feature_flags_and_meta.sql: Dynamic feature flags, changelog, and false alarm calibration reviews
CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  updated_by TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS changelog (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  release_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'release',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS false_alarm_reviews (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  guardian_id TEXT,
  elder_name TEXT,
  transcript_excerpt TEXT,
  verdict TEXT NOT NULL,
  proposed_dictionary_phrase TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL
);
