-- ═══════════════════════════════════════════════════════════════════
-- Migration: Tighten RLS policies for customer data protection
--
-- WHAT THIS DOES:
--   Locks down orders, stockpiles, stockpile_items, and profiles
--   so the public anon key can no longer read/write customer data.
--   All sensitive operations now go through the service_role key
--   (used by Next.js API routes server-side).
--
-- WHAT STAYS OPEN (Phase 2 — admin client components still need access):
--   products, categories, pages, inventory_items, inventory_logs,
--   coupons, delivery_zones, delivery_locations, site_settings
--
-- HOW TO RUN:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--
-- HOW TO ROLLBACK:
--   Run the rollback section at the bottom of this file.
--
-- PREREQUISITE:
--   Add SUPABASE_SERVICE_ROLE_KEY to your .env.local
--   (Find it in Supabase Dashboard → Settings → API → service_role key)
-- ═══════════════════════════════════════════════════════════════════

-- ─── ORDERS ─────────────────────────────────────────────────────
-- Before: anyone with anon key could SELECT all orders, INSERT, UPDATE
-- After:  anon can only INSERT (place orders). All reads/updates via service_role.

DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Service read orders" ON orders;
DROP POLICY IF EXISTS "Service update orders" ON orders;

-- Customers can still place orders via the API (the API route uses service_role,
-- but we keep INSERT open as a safety net in case the service key isn't set yet)
CREATE POLICY "anon_insert_orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Only service_role can read orders (bypasses RLS automatically).
-- No SELECT policy for anon = anon cannot read ANY orders.

-- Only service_role can update orders.
-- No UPDATE policy for anon = anon cannot modify ANY orders.


-- ─── STOCKPILES ─────────────────────────────────────────────────
-- Before: anyone could read all stockpiles, insert, update, delete
-- After:  no anon access at all. All ops via service_role (API routes).

DROP POLICY IF EXISTS "Public insert stockpiles" ON stockpiles;
DROP POLICY IF EXISTS "Public read own stockpiles" ON stockpiles;
DROP POLICY IF EXISTS "Service update stockpiles" ON stockpiles;
DROP POLICY IF EXISTS "Admin delete stockpiles" ON stockpiles;

-- No policies for anon = service_role only (it bypasses RLS).


-- ─── STOCKPILE ITEMS ────────────────────────────────────────────
-- Before: anyone could read, insert, update, delete
-- After:  no anon access. All ops via service_role (API routes).

DROP POLICY IF EXISTS "Public insert stockpile_items" ON stockpile_items;
DROP POLICY IF EXISTS "Public read stockpile_items" ON stockpile_items;
DROP POLICY IF EXISTS "Service update stockpile_items" ON stockpile_items;
DROP POLICY IF EXISTS "Admin delete stockpile_items" ON stockpile_items;

-- No policies for anon = service_role only.


-- ─── PROFILES ───────────────────────────────────────────────────
-- Before: anyone could read ALL profiles
-- After:  authenticated users can read their own profile only.
--         Admin reads go through service_role.

DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Authenticated users can read their own profile
CREATE POLICY "users_read_own_profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "users_update_own_profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);


-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run these after the migration to confirm)
-- ═══════════════════════════════════════════════════════════════════
--
-- Check policies on orders:
--   SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'orders';
--   Expected: only "anon_insert_orders" (INSERT)
--
-- Check policies on stockpiles:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'stockpiles';
--   Expected: empty (no policies = service_role only)
--
-- Check policies on stockpile_items:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'stockpile_items';
--   Expected: empty
--
-- Check policies on profiles:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
--   Expected: "users_read_own_profile" (SELECT), "users_update_own_profile" (UPDATE)


-- ═══════════════════════════════════════════════════════════════════
-- ROLLBACK (only run this if something goes wrong)
-- ═══════════════════════════════════════════════════════════════════
--
-- -- Restore orders
-- DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
-- CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Service read orders" ON orders FOR SELECT USING (true);
-- CREATE POLICY "Service update orders" ON orders FOR UPDATE USING (true);
--
-- -- Restore stockpiles
-- CREATE POLICY "Public insert stockpiles" ON stockpiles FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public read own stockpiles" ON stockpiles FOR SELECT USING (true);
-- CREATE POLICY "Service update stockpiles" ON stockpiles FOR UPDATE USING (true);
-- CREATE POLICY "Admin delete stockpiles" ON stockpiles FOR DELETE USING (true);
--
-- -- Restore stockpile_items
-- CREATE POLICY "Public insert stockpile_items" ON stockpile_items FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public read stockpile_items" ON stockpile_items FOR SELECT USING (true);
-- CREATE POLICY "Service update stockpile_items" ON stockpile_items FOR UPDATE USING (true);
-- CREATE POLICY "Admin delete stockpile_items" ON stockpile_items FOR DELETE USING (true);
--
-- -- Restore profiles
-- DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
-- DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
-- CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
