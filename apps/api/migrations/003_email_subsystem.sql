-- 003_email_subsystem.sql: Outbox and suppression list tables
CREATE TABLE IF NOT EXISTS email_outbox (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'suppressed')),
  attempts INTEGER DEFAULT 0,
  next_attempt_at TEXT,
  error_message TEXT,
  message_id TEXT,
  campaign_id TEXT,
  ticket_id TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS suppression_list (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribed', 'bounced', 'complaint', 'manual')),
  created_at TEXT NOT NULL
);
