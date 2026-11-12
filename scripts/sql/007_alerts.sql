-- 007_alerts.sql — alerts already emailed to the owner (e.g. "groq-1 limit reached"),
-- so each alert is sent at most once per day. Safe to run more than once.
CREATE TABLE IF NOT EXISTS alerts (
  alert_key text        NOT NULL,   -- e.g. "groq-limit:groq-1"
  sent_on   date        NOT NULL,   -- content day (Asia/Kolkata)
  sent_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (alert_key, sent_on)
);
