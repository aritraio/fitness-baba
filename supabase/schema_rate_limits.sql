-- ══════════════════════════════════════════════════════
-- Fitness | FitnessBaba  —  Supabase rate_limits schema
-- Run this in: Supabase dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  expire_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limits_expire_at_idx ON rate_limits (expire_at);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny direct client access
CREATE POLICY "deny_direct_client_access_rate_limits"
  ON rate_limits FOR ALL
  USING (false);
