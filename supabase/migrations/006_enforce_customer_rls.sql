-- ═══════════════════════════════════════════════════════════════════
-- Migration 006: Actually enforce RLS on customer-data tables (fixes 001)
--
-- WHY:
--   001_tighten_rls.sql dropped the permissive policies on orders/stockpiles/
--   profiles but never ran ALTER TABLE … ENABLE ROW LEVEL SECURITY. On this
--   database RLS was off for `orders`, so its "no SELECT policy = denied"
--   reasoning never held — the anon key could READ every order (customer name,
--   email, phone, address). Verified: an anon SELECT returned a probe order.
--
-- WHAT THIS DOES, per table:
--   orders           → ENABLE RLS; anon may INSERT only (checkout safety net);
--                      SELECT/UPDATE/DELETE have no anon policy → service_role
--                      only (all app order reads already run server-side).
--   stockpiles       → ENABLE RLS; no anon policies → service_role only.
--   stockpile_items  → ENABLE RLS; no anon policies → service_role only.
--   profiles         → ENABLE RLS; anon read removed (admin Customers page now
--                      reads via the service role — getCustomers change);
--                      authenticated users may read/update their own row.
--
--   All existing policies are cleared first so no stale USING(true) read
--   policy survives. service_role bypasses RLS, so every server API route keeps
--   working.
--
-- HOW TO RUN: Supabase SQL editor → paste → Run. Re-runnable.
-- ROLLBACK: not recommended (this closes a PII leak). To loosen a table:
--   ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
    t   text;
    pol record;
    tables text[] := ARRAY['orders','stockpiles','stockpile_items','profiles'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF to_regclass('public.' || t) IS NULL THEN
            CONTINUE;
        END IF;
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        FOR pol IN
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
        END LOOP;
    END LOOP;

    -- orders: keep the anon INSERT safety net; reads/updates are service_role only
    IF to_regclass('public.orders') IS NOT NULL THEN
        CREATE POLICY "anon_insert_orders" ON orders FOR INSERT WITH CHECK (true);
    END IF;

    -- profiles: authenticated users may see/update only their own row
    IF to_regclass('public.profiles') IS NOT NULL THEN
        CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- stockpiles / stockpile_items: no anon policies at all → service_role only.
END $$;
