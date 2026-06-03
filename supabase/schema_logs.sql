-- ══════════════════════════════════════════════════════
-- Fitness | FitnessBaba  —  Supabase daily_logs schema
-- Run this in: Supabase dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS daily_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL,
  log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  weight     NUMERIC,
  calories   INTEGER,
  water_ml   INTEGER,
  workout    JSONB DEFAULT '{}',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS daily_logs_user_id_date_idx ON daily_logs (user_id, log_date);

-- Enable RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Deny direct client access
CREATE POLICY "deny_direct_client_access_logs"
  ON daily_logs FOR ALL
  USING (false);
