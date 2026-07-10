-- ═══════════════════════════════════════════════════════════════════
-- Migration 004: Tighten RLS on admin catalog tables (Phase 1.3)
--
-- WHAT THIS DOES:
--   Removes the permissive USING(true) / FOR ALL *write* policies that let
--   anyone holding the public anon key INSERT/UPDATE/DELETE products,
--   categories, coupons, inventory, pages, delivery, settings, media and
--   reviews directly. All admin writes now run server-side under the
--   service_role (via /api/admin/db and existing API routes), which bypasses
--   RLS — so those keep working while the anon key loses write access.
--
--   Reads are preserved so the storefront and admin screens keep loading.
--   (001_tighten_rls.sql already locked customer data: orders, stockpiles,
--   stockpile_items, profiles — untouched here.)
--
--   Every table is guarded with to_regclass so this runs cleanly even if a
--   table (e.g. reviews/media) hasn't been created on this database yet.
--
-- FOLLOW-UP (not a regression — matches prior anon-read behaviour):
--   pages/coupons/inventory_items remain anon-READABLE. Moving those admin
--   reads server-side is future hardening; this migration only closes writes.
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → paste → Run. Re-runnable.
-- ROLLBACK: see the bottom of this file.
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- ── categories ──
    IF to_regclass('public.categories') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage categories" ON categories;
        DROP POLICY IF EXISTS "Admin update categories" ON categories;
        DROP POLICY IF EXISTS "Admin delete categories" ON categories;
        -- keep: "Public read categories"
    END IF;

    -- ── products ──
    IF to_regclass('public.products') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage products" ON products;
        DROP POLICY IF EXISTS "Admin update products" ON products;
        DROP POLICY IF EXISTS "Admin delete products" ON products;
        -- keep: "Public read products"
    END IF;

    -- ── site_settings ──
    IF to_regclass('public.site_settings') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin insert site_settings" ON site_settings;
        DROP POLICY IF EXISTS "Admin update site_settings" ON site_settings;
        -- keep: "Public read site_settings"
    END IF;

    -- ── inventory_items (was FOR ALL) → keep read only ──
    IF to_regclass('public.inventory_items') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin full access inventory_items" ON inventory_items;
        DROP POLICY IF EXISTS "Public read inventory_items" ON inventory_items;
        CREATE POLICY "Public read inventory_items" ON inventory_items FOR SELECT USING (true);
    END IF;

    -- ── inventory_logs → drop anon insert, keep read ──
    IF to_regclass('public.inventory_logs') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Public insert inventory_logs" ON inventory_logs;
    END IF;

    -- ── pages (was FOR ALL) → preserve prior read scope ──
    IF to_regclass('public.pages') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin all pages" ON pages;
        DROP POLICY IF EXISTS "Public read published pages" ON pages;
        DROP POLICY IF EXISTS "Public read pages" ON pages;
        CREATE POLICY "Public read pages" ON pages FOR SELECT USING (true);
    END IF;

    -- ── coupons (was FOR ALL) → preserve prior read scope ──
    IF to_regclass('public.coupons') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage coupons" ON coupons;
        DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
        DROP POLICY IF EXISTS "Public read coupons" ON coupons;
        CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
    END IF;

    -- ── delivery_zones / delivery_locations (were FOR ALL) ──
    IF to_regclass('public.delivery_zones') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage delivery_zones" ON delivery_zones;
    END IF;
    IF to_regclass('public.delivery_locations') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage delivery_locations" ON delivery_locations;
    END IF;

    -- ── media (was FOR ALL) ──
    IF to_regclass('public.media') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage media" ON media;
        -- keep: "Public read media"
    END IF;

    -- ── reviews (was FOR ALL + anon insert) → visible-read only ──
    IF to_regclass('public.reviews') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Admin manage reviews" ON reviews;
        DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
        -- keep: "Public read visible reviews"
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- ROLLBACK (restores the permissive write policies for tables that exist):
--   CREATE POLICY "Admin manage categories" ON categories FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Admin update categories" ON categories FOR UPDATE USING (true);
--   CREATE POLICY "Admin delete categories" ON categories FOR DELETE USING (true);
--   CREATE POLICY "Admin manage products" ON products FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Admin update products" ON products FOR UPDATE USING (true);
--   CREATE POLICY "Admin delete products" ON products FOR DELETE USING (true);
--   CREATE POLICY "Admin insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Admin update site_settings" ON site_settings FOR UPDATE USING (true);
--   CREATE POLICY "Admin full access inventory_items" ON inventory_items FOR ALL USING (true);
--   CREATE POLICY "Public insert inventory_logs" ON inventory_logs FOR INSERT WITH CHECK (true);
--   CREATE POLICY "Admin all pages" ON pages FOR ALL USING (true);
--   CREATE POLICY "Admin manage coupons" ON coupons FOR ALL USING (true);
--   CREATE POLICY "Admin manage delivery_zones" ON delivery_zones FOR ALL USING (true);
--   CREATE POLICY "Admin manage delivery_locations" ON delivery_locations FOR ALL USING (true);
--   CREATE POLICY "Admin manage media" ON media FOR ALL USING (true);
--   CREATE POLICY "Admin manage reviews" ON reviews FOR ALL USING (true);
--   CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);
--   (and drop the "Public read pages/coupons/inventory_items" SELECT policies this added)
-- ═══════════════════════════════════════════════════════════════════
