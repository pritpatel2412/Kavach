-- 011_data_rights_and_modules.sql: Data rights queue (access / erasure) and household state
CREATE TABLE IF NOT EXISTS data_rights_requests (
  id TEXT PRIMARY KEY,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'erasure', 'rectification')),
  requester_email TEXT NOT NULL,
  household_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  sla_due_at TEXT NOT NULL,
  processed_at TEXT,
  processed_by TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);
