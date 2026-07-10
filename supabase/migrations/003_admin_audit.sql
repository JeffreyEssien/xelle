-- ═══════════════════════════════════════════════════════════════════
-- Migration 003: Admin audit log
--
-- WHAT THIS DOES:
--   Adds admin_audit_logs — an append-only trail of sensitive admin
--   actions (logins, order status changes, payment confirmations,
--   product deletes, review moderation, delivery/coupon changes).
--   admin_email is denormalised so the entry stays readable even if the
--   admin_users row is later removed (admin_id then goes NULL).
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → paste → Run.
-- Depends on migration 002 (admin_users).
--
-- ROLLBACK: DROP TABLE IF EXISTS admin_audit_logs;
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id    UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action      TEXT NOT NULL,
    target_type TEXT,
    target_id   TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON admin_audit_logs(action);

-- Service_role only: RLS on with no policies denies anon/authenticated
-- entirely. Writes come exclusively from server code via the service key.
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- ROLLBACK:  DROP TABLE IF EXISTS admin_audit_logs;
-- ═══════════════════════════════════════════════════════════════════
