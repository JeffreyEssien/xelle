-- ═══════════════════════════════════════════════════════════════════
-- Migration 007: Atomic order creation + locked stockpile totals (Phase 1.4)
--
-- Closes two concurrency races XELLE's CLAUDE.md documents:
--   1. createOrder was multi-step (insert order → loop stock RPCs → delete on
--      failure → non-atomic coupon read-then-write). Under parallel checkouts
--      it could oversell or double-count coupon usage.
--   2. recalcStockpileTotal read items, summed in JS, and wrote back — parallel
--      adds to one stockpile could lose updates.
--
-- create_order_atomic(): one transaction. FOR UPDATE row-locks every product /
-- inventory row it touches, deducts INTEGER stock, inserts the order, and
-- increments coupon usage. Any failure rolls the whole thing back — no leaked
-- stock, no orphan order. Two orders for DIFFERENT products run in parallel;
-- two for the SAME product/inventory serialize on the row lock.
--
-- Integer stock only (no NUMERIC/weight). XELLE `orders` columns only (no
-- Paystack/food fields). Stockpile orders pass p_items='[]' to skip deduction
-- (stock was already deducted when items were added to the stockpile).
--
-- HOW TO RUN: Supabase SQL editor → paste → Run. Re-runnable (CREATE OR REPLACE).
-- ROLLBACK: DROP FUNCTION IF EXISTS create_order_atomic(jsonb, jsonb);
--           DROP FUNCTION IF EXISTS recalc_stockpile_total(uuid);
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_order_atomic(p_order JSONB, p_items JSONB)
RETURNS JSONB AS $$
DECLARE
    v_item             JSONB;
    v_product_id       UUID;
    v_variant_name     TEXT;
    v_inventory_id     UUID;
    v_quantity         INT;
    v_variants         JSONB;
    v_variant_idx      INT;
    v_current_stock    INT;
    v_inv_current      INT;
    v_updated_variants JSONB;
    v_coupon_code      TEXT;
BEGIN
    -- ── Step 1: lock + deduct stock for every item ──
    FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) LOOP
        v_product_id   := (v_item->>'product_id')::UUID;
        v_variant_name := NULLIF(v_item->>'variant_name', '');
        v_inventory_id := NULLIF(v_item->>'inventory_item_id', '')::UUID;
        v_quantity     := (v_item->>'quantity')::INT;

        IF v_variant_name IS NOT NULL THEN
            -- Variant path — lock the product row
            SELECT COALESCE(variants, '[]'::jsonb) INTO v_variants
              FROM products WHERE id = v_product_id FOR UPDATE;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product not found: %', v_product_id;
            END IF;
            IF jsonb_typeof(v_variants) = 'string' THEN
                v_variants := (v_variants #>> '{}')::JSONB;
            END IF;

            SELECT idx - 1 INTO v_variant_idx
              FROM jsonb_array_elements(v_variants) WITH ORDINALITY arr(elem, idx)
             WHERE elem->>'name' = v_variant_name
             LIMIT 1;
            IF v_variant_idx IS NULL THEN
                RAISE EXCEPTION 'Variant "%" not found on product %', v_variant_name, v_product_id;
            END IF;

            v_current_stock := COALESCE((v_variants->v_variant_idx->>'stock')::INT, 0);
            IF v_current_stock < v_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%" (variant %). Available: %, requested: %',
                    (v_item->>'product_name'), v_variant_name, v_current_stock, v_quantity;
            END IF;

            v_updated_variants := jsonb_set(
                v_variants, ARRAY[v_variant_idx::text, 'stock'],
                to_jsonb(v_current_stock - v_quantity));

            UPDATE products
               SET variants = v_updated_variants,
                   stock = (SELECT COALESCE(SUM((elem->>'stock')::INT), 0)
                              FROM jsonb_array_elements(v_updated_variants) AS elem)
             WHERE id = v_product_id;

            INSERT INTO inventory_logs (product_id, change_amount, reason)
            VALUES (v_product_id, -v_quantity, 'order_variant_' || v_variant_name);

        ELSIF v_inventory_id IS NOT NULL THEN
            -- Main inventory path — lock the inventory row
            SELECT stock INTO v_inv_current
              FROM inventory_items WHERE id = v_inventory_id FOR UPDATE;
            IF v_inv_current IS NULL THEN
                RAISE EXCEPTION 'Inventory item not found: %', v_inventory_id;
            END IF;
            IF v_inv_current < v_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%". Available: %, requested: %',
                    (v_item->>'product_name'), v_inv_current, v_quantity;
            END IF;

            UPDATE inventory_items SET stock = stock - v_quantity, updated_at = now()
             WHERE id = v_inventory_id;

            INSERT INTO inventory_logs (product_id, change_amount, reason)
            VALUES (v_product_id, -v_quantity, 'order_main');
        END IF;
        -- neither variant nor inventory_item_id → item has no stock backing, skip
    END LOOP;

    -- ── Step 2: insert the order (XELLE columns only) ──
    INSERT INTO orders (
        id, customer_name, email, phone, items, subtotal, shipping, total,
        status, shipping_address, notes, coupon_code, discount_total,
        payment_method, sender_name, payment_status,
        delivery_zone, delivery_type, delivery_discount, created_at
    ) VALUES (
        p_order->>'id',
        p_order->>'customer_name',
        p_order->>'email',
        p_order->>'phone',
        COALESCE(p_order->'items', '[]'::jsonb),
        (p_order->>'subtotal')::NUMERIC,
        (p_order->>'shipping')::NUMERIC,
        (p_order->>'total')::NUMERIC,
        COALESCE(p_order->>'status', 'pending'),
        p_order->'shipping_address',
        p_order->>'notes',
        p_order->>'coupon_code',
        COALESCE((p_order->>'discount_total')::NUMERIC, 0),
        p_order->>'payment_method',
        p_order->>'sender_name',
        COALESCE(p_order->>'payment_status', 'pending'),
        p_order->>'delivery_zone',
        p_order->>'delivery_type',
        p_order->'delivery_discount',
        COALESCE((p_order->>'created_at')::TIMESTAMPTZ, now())
    );

    -- ── Step 3: increment coupon usage atomically (same txn, single UPDATE) ──
    v_coupon_code := NULLIF(p_order->>'coupon_code', '');
    IF v_coupon_code IS NOT NULL THEN
        UPDATE coupons SET usage_count = COALESCE(usage_count, 0) + 1
         WHERE UPPER(code) = UPPER(v_coupon_code);
    END IF;

    RETURN jsonb_build_object('id', p_order->>'id');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Stockpile total: recompute under a row lock (no lost updates) ──
CREATE OR REPLACE FUNCTION recalc_stockpile_total(p_stockpile_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Lock the stockpile row so concurrent adds/removes serialize here.
    PERFORM 1 FROM stockpiles WHERE id = p_stockpile_id FOR UPDATE;

    UPDATE stockpiles
       SET total_items_value = (
           SELECT COALESCE(SUM(price_paid * quantity), 0)
             FROM stockpile_items WHERE stockpile_id = p_stockpile_id)
     WHERE id = p_stockpile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
