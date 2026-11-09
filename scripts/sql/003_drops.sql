-- 003_drops.sql — the learning content itself: one row per drop (5 questions).
-- Written by the daily generator (scripts/generate-drops.ts), read by the app via /api/content/*.
-- Safe to run more than once (everything is "IF NOT EXISTS").
CREATE TABLE IF NOT EXISTS drops (
  category   text        NOT NULL,
  drop_date  date        NOT NULL,
  drop_no    smallint    NOT NULL CHECK (drop_no BETWEEN 1 AND 3),
  title      text        NOT NULL,
  items      jsonb       NOT NULL,                 -- the 5 items, already checked with DropSchema
  source     text        NOT NULL DEFAULT 'seed',  -- e.g. "groq:openai/gpt-oss-120b" or "seed"
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (category, drop_date, drop_no)
);
CREATE INDEX IF NOT EXISTS drops_date_idx ON drops (drop_date);
