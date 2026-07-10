-- ═══════════════════════════════════════════════════════════════════
-- Migration 005: Actually ENABLE RLS on catalog tables (fixes 004)
--
-- WHY:
--   004 only DROPPED the permissive write policies. But on this database RLS
--   was never enabled on several catalog tables (products, coupons, categories
--   …), and with RLS DISABLED a table ignores policies entirely — so the anon
--   key could still INSERT/UPDATE/DELETE. (inventory_items already had RLS on,
--   which is why only it was actually blocked.)
--
-- WHAT THIS DOES, per catalog table that exists:
--   1. ENABLE ROW LEVEL SECURITY
--   2. Drop ALL existing policies (names varied across envs — done dynamically)
--   3. Recreate ONLY the read policy the app needs
--   Result: anon/authenticated get read-only; every write is denied. The
--   service_role bypasses RLS, so admin writes (via /api/admin/db and the
--   server API routes) keep working.
--
--   Customer-data tables (orders, stockpiles, stockpile_items, profiles) are
--   left to 001_tighten_rls.sql and untouched here.
--
-- HOW TO RUN: Supabase SQL editor → paste → Run. Re-runnable.
-- ROLLBACK: RLS-enable is the safe state; to loosen a table again, e.g.
--   ALTER TABLE products DISABLE ROW LEVEL SECURITY;  (NOT recommended)
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
    t   text;
    pol record;
    tables text[] := ARRAY[
        'categories','products','site_settings','inventory_items','inventory_logs',
        'pages','coupons','delivery_zones','delivery_locations','media','reviews'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF to_regclass('public.' || t) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        -- clear every existing policy so no stale permissive write policy remains
        FOR pol IN
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
        END LOOP;
    END LOOP;

    -- Recreate read-only public policies (writes have NO policy → denied for anon).
    IF to_regclass('public.categories')          IS NOT NULL THEN CREATE POLICY "Public read categories"          ON categories          FOR SELECT USING (true); END IF;
    IF to_regclass('public.products')            IS NOT NULL THEN CREATE POLICY "Public read products"            ON products            FOR SELECT USING (true); END IF;
    IF to_regclass('public.site_settings')       IS NOT NULL THEN CREATE POLICY "Public read site_settings"       ON site_settings       FOR SELECT USING (true); END IF;
    IF to_regclass('public.inventory_items')     IS NOT NULL THEN CREATE POLICY "Public read inventory_items"     ON inventory_items     FOR SELECT USING (true); END IF;
    IF to_regclass('public.inventory_logs')      IS NOT NULL THEN CREATE POLICY "Public read inventory_logs"      ON inventory_logs      FOR SELECT USING (true); END IF;
    IF to_regclass('public.pages')               IS NOT NULL THEN CREATE POLICY "Public read pages"               ON pages               FOR SELECT USING (true); END IF;
    IF to_regclass('public.coupons')             IS NOT NULL THEN CREATE POLICY "Public read coupons"             ON coupons             FOR SELECT USING (true); END IF;
    IF to_regclass('public.delivery_zones')      IS NOT NULL THEN CREATE POLICY "Public read delivery_zones"      ON delivery_zones      FOR SELECT USING (true); END IF;
    IF to_regclass('public.delivery_locations')  IS NOT NULL THEN CREATE POLICY "Public read delivery_locations"  ON delivery_locations  FOR SELECT USING (true); END IF;
    IF to_regclass('public.media')               IS NOT NULL THEN CREATE POLICY "Public read media"               ON media               FOR SELECT USING (true); END IF;
    IF to_regclass('public.reviews')             IS NOT NULL THEN CREATE POLICY "Public read visible reviews"     ON reviews             FOR SELECT USING (is_visible = true); END IF;
END $$;
