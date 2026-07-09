-- ═══════════════════════════════════════════════════════════════════
-- Migration 002: DB-only admin auth (bcrypt accounts + server sessions)
--
-- WHAT THIS DOES:
--   Replaces the shared-password admin login with real per-admin
--   accounts. Adds:
--     • admin_users     — one row per admin, bcrypt password_hash
--     • admin_sessions  — opaque session tokens, 7-day expiry
--   Both tables are locked to the service_role only. The public anon
--   key can neither read hashes nor forge sessions — all access goes
--   through Next.js server code using SUPABASE_SERVICE_ROLE_KEY.
--
-- HOW TO RUN:
--   1. Supabase Dashboard → SQL Editor
--   2. Paste this whole file, click "Run"
--   3. Seed the first admin:  npm run seed:admin
--      (reads INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD / INITIAL_ADMIN_NAME)
--
-- ROLLBACK: run the section at the bottom of this file.
--
-- PREREQUISITE: SUPABASE_SERVICE_ROLE_KEY set in the app environment.
-- ═══════════════════════════════════════════════════════════════════

-- ─── admin_users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(lower(email));

-- ─── admin_sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id   UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token      TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token   ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ─── RLS: service_role only ─────────────────────────────────────
-- No policies are created, so with RLS enabled the anon/authenticated
-- keys get zero access. The service_role key bypasses RLS entirely,
-- which is exactly (and only) how the app touches these tables.
ALTER TABLE admin_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE admin_users    FORCE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- ROLLBACK (run to undo this migration):
--   DROP TABLE IF EXISTS admin_sessions;
--   DROP TABLE IF EXISTS admin_users;
-- ═══════════════════════════════════════════════════════════════════
