-- 006_articles.sql — one short article per category per day, written by the AI at 04:00
-- (scripts/generate-articles.ts) and read by the app via /api/articles.
-- Safe to run more than once.
CREATE TABLE IF NOT EXISTS articles (
  category        text        NOT NULL,
  article_date    date        NOT NULL,
  title           text        NOT NULL,
  topic           text        NOT NULL,
  summary         text        NOT NULL,
  reading_minutes smallint    NOT NULL,
  body            jsonb       NOT NULL,                 -- the full article, checked with ArticleSchema
  source          text        NOT NULL DEFAULT 'groq',  -- e.g. "groq:openai/gpt-oss-120b"
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (category, article_date)
);
CREATE INDEX IF NOT EXISTS articles_date_idx ON articles (article_date);
