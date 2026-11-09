-- 002_progress.sql — each user's learning progress, saved to their account.
-- Safe to run more than once (everything is "IF NOT EXISTS").
--
-- "synced_at" is set by the server when a row arrives. Phones ask for
-- "everything since my last sync", so they only download what is new.

-- One row per finished drop. Only the FIRST play counts (replays are practice).
CREATE TABLE IF NOT EXISTS drop_results (
  user_id       uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  drop_key      text        NOT NULL,            -- e.g. "math/2026-11-08/2"
  category      text        NOT NULL,
  drop_date     date        NOT NULL,
  drop_no       smallint    NOT NULL,
  title         text        NOT NULL,
  items         jsonb       NOT NULL,            -- per-question results
  correct_count smallint    NOT NULL,
  points        integer     NOT NULL,
  perfect       boolean     NOT NULL,
  duration_sec  integer     NOT NULL,
  completed_at  timestamptz NOT NULL,
  completed_on  date        NOT NULL,            -- the player's own calendar day (streaks)
  synced_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, drop_key)
);
CREATE INDEX IF NOT EXISTS drop_results_user_synced_idx ON drop_results (user_id, synced_at);

-- Mistakes later answered correctly in Review mode.
CREATE TABLE IF NOT EXISTS fixed_mistakes (
  user_id   uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id   text        NOT NULL,
  fixed_at  timestamptz NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);
CREATE INDEX IF NOT EXISTS fixed_mistakes_user_synced_idx ON fixed_mistakes (user_id, synced_at);

-- "Report wrong answer" — one per user per question. Also lets us find bad questions.
CREATE TABLE IF NOT EXISTS answer_reports (
  user_id     uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id     text        NOT NULL,
  drop_key    text        NOT NULL,
  reported_at timestamptz NOT NULL,
  synced_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);
CREATE INDEX IF NOT EXISTS answer_reports_user_synced_idx ON answer_reports (user_id, synced_at);
CREATE INDEX IF NOT EXISTS answer_reports_item_idx ON answer_reports (item_id);
