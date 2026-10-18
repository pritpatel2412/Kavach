-- 005_support_tickets.sql: Modern support ticket system, customer portal, KB articles
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  category TEXT NOT NULL CHECK (category IN ('scam_emergency', 'billing', 'account_login', 'device_listening', 'voice_consent', 'privacy_data', 'bug', 'feedback')),
  priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  status TEXT NOT NULL CHECK (status IN ('open', 'pending', 'on_hold', 'solved', 'closed', 'spam')),
  subject TEXT NOT NULL,
  household_id TEXT,
  assignee_email TEXT,
  access_token_hash TEXT NOT NULL,
  sla_first_response_due TEXT,
  sla_resolution_due TEXT,
  first_responded_at TEXT,
  resolved_at TEXT,
  closed_at TEXT,
  csat_rating INTEGER CHECK (csat_rating IS NULL OR (csat_rating >= 1 AND csat_rating <= 5)),
  csat_feedback TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
  sender_email TEXT NOT NULL,
  is_internal INTEGER DEFAULT 0,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  message_id TEXT REFERENCES ticket_messages(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kb_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  is_published INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
