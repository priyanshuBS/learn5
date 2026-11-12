-- 005_tiers.sql — question tiers (1 Basic, 2 Intermediate, 3 Advanced).
-- Every drop is written once per tier, and each result remembers the tier played.
-- Safe to run more than once.

-- drops: one row per (category, date, drop, tier). Old rows become tier 1.
ALTER TABLE drops ADD COLUMN IF NOT EXISTS tier smallint NOT NULL DEFAULT 1;
ALTER TABLE drops DROP CONSTRAINT IF EXISTS drops_pkey;
CREATE UNIQUE INDEX IF NOT EXISTS drops_key_idx ON drops (category, drop_date, drop_no, tier);

-- drop_results: the tier the player answered (old rows = tier 1).
ALTER TABLE drop_results ADD COLUMN IF NOT EXISTS tier smallint NOT NULL DEFAULT 1;
