-- 004_otp_ip.sql — remember which network asked for each sign-in code, so one
-- person can't spam codes to many different emails. Safe to run more than once.
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS ip text;
CREATE INDEX IF NOT EXISTS otp_codes_ip_created_idx ON otp_codes (ip, created_at DESC);
