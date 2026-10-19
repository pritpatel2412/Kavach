-- 010_export_jobs.sql: Export center jobs tracking, formula safety, and expiry
CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'xlsx', 'json', 'html')),
  filters_json TEXT,
  selected_columns TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  row_count INTEGER DEFAULT 0,
  file_hash TEXT,
  download_token TEXT,
  include_pii INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
