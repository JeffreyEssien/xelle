# PORT-NOTES.md — XELLE ← ZúTa Ya divergence map

> Phase 0.1 recon output. Records the **concrete** file/function/table differences between
> XELLE (this repo) and ZúTa Ya (`/Users/pc/Documents/zutaya`, `JeffreyEssien/zutaya`) so later
> port tasks *adapt* to XELLE instead of pasting. Source of truth for what already matches, what
> has drifted, and XELLE-only code the port must not break.

Read on **2026-07-09** against XELLE branch `ci/setup-pipeline` and the local ZúTa Ya checkout.

---

## 1. Admin auth — FULLY DIVERGED (Phase 1.1/1.2 target)

| Concern | XELLE (today) | ZúTa Ya (port source) |
|---|---|---|
| `proxy.ts` | **sync** fn; compares cookie `admin_session` == `process.env.ADMIN_SESSION_SECRET \|\| "xelle-admin-default-secret"`. No DB. | **async** fn; looks up `admin_sessions` by `token`, `expires_at > now()` via service client; clears cookie + redirects on miss. |
| Login route | `app/api/admin/login/route.ts` — `password === process.env.ADMIN_PASSWORD`, sets cookie to the **static** secret. **Password-only, no email.** | `authenticateAdmin(email,password)` → `bcrypt.compare` vs `admin_users.password_hash`; mints `crypto.randomBytes(48)` token → `admin_sessions`; sets httpOnly cookie (7d). **Email + password.** |
| Rate limiting | **none** | `lib/rateLimit.ts` (Supabase `rate_limits` table + `increment_rate_limit` RPC, fail-open); login = 8 attempts / IP / 15 min → 429. |
| Audit | **none** | `logAdminAction(...)` / `logCronEvent(...)` → `admin_audit_logs`; login is logged. |
| Auth helper module | **none** | `lib/adminAuth.ts`: `authenticateAdmin`, `validateSession`, `getCurrentAdmin`, `destroySession`, `logAdminAction`, `logCronEvent`, `getAuditLogs`. |
| Logout route | **none** (no `/api/admin/logout`) | present; `proxy.ts` whitelists it. |

**Drifted names / signatures the port MUST honor:**
- **Supabase service getter name differs.** XELLE = `getServiceClient()` (in `lib/supabase.ts`); ZúTa Ya = `getSupabaseServiceClient()`. ZúTa Ya's `adminAuth.ts`/`rateLimit.ts` call the ZúTa name — **rename to `getServiceClient` when porting.**
- **XELLE `getServiceClient()` falls back to the anon client** when `SUPABASE_SERVICE_ROLE_KEY` is missing (dev convenience, `lib/supabase.ts`). Security-sensitive port code (auth, RLS-bypass writes) must treat a null/anon fallback as failure, not proceed.
- **XELLE proxy is synchronous**, `matcher` = `/admin/:path*`. DB session validation makes it **async** (as in ZúTa Ya). ZúTa Ya also fails **open** if Supabase env is unset — keep that only behind a dev guard, not prod.
- **Admin login form is password-only.** Porting email+password means the login **UI** (`app/admin/login/…`) needs an email field, not just the route.

**Tables XELLE lacks (Phase 1.1/1.2 must create):** `admin_users`, `admin_sessions`, `admin_audit_logs`, `rate_limits` (+ `increment_rate_limit` RPC). ZúTa Ya defines the first three in `supabase/migrations/015_admin_users_audit.sql`; `rate_limits`/RPC live in `025`.

---

## 2. Order write-path — DIVERGED, integer stock must stay (Phase 1.4 target)

**XELLE (current):**
- `POST /app/api/orders/route.ts` → server-side price recalc + server-generated ID (`ORD-` / `ORD-SP-` / `ORD-SHP-`) → `enqueue(() => createOrder(order))`.
- `lib/orderQueue.ts` = in-memory limiter, `MAX_CONCURRENT=3`, `MAX_WAITING=200`. **Keep this** — the RPC replaces the writes *inside* it, not the queue.
- `createOrder` (`lib/queries.ts:281`) is **non-atomic, multi-step**: insert order row → loop items calling RPC `deduct_variant_stock` / `deduct_stock` + `inventory_logs` inserts → on any failure `DELETE` the order → then **read-then-write coupon `usage_count`** (`lib/queries.ts:364-381`) = the documented lost-update race.
- Existing RPC signatures (integer): `deduct_stock(p_inventory_id UUID, p_quantity INT)`, `deduct_variant_stock(p_product_id UUID, p_variant_name TEXT, p_quantity INT)` (`supabase/schema.sql:264,397`).
- Stockpile orders (`deliveryZone === "stockpile"`) **skip** stock deduction (already deducted at add-to-stockpile time).

**ZúTa Ya (port source, take LOCKING ONLY):**
- Single `create_order_atomic(p_order JSONB, p_items JSONB)` RPC — one txn, `FOR UPDATE` row locks per product/inventory row, deduct + insert order + increment coupon usage all atomic (`supabase/migrations/025_atomic_orders_and_rate_limit.sql`).
- **DO NOT PORT:** its `NUMERIC` stock (migrations 029/030), and its Paystack/food columns in the INSERT (`paystack_reference`, `payment_status`, `processing_fee`, `packaging_fee`, `prep_fee`, `prep_instructions`, `requested_delivery_date/slot`, `subscription_id`). XELLE's new RPC must INSERT only XELLE's actual `orders` columns and keep `INT` stock.
- Apply the same row-locking to the **stockpile total** update (`ORD-SP-` path) per task 1.4.

---

## 3. RLS — partially tightened already (Phase 1.3 target)

- `supabase/schema.sql` ships **permissive** `USING (true)` / `WITH CHECK (true)` write policies on: `categories`, `products`, `inventory_items`, `inventory_logs`, `coupons`, `pages`, `delivery_zones`, `delivery_locations`, `site_settings`, `media`, `reviews`.
- **XELLE already has `supabase/migrations/001_tighten_rls.sql`** which locked down **customer data** (`orders`, `stockpiles`, `stockpile_items`, `profiles`) to service_role and *deliberately left the admin catalog tables open* "for admin client components." **Phase 1.3 = finish that job**: gate the still-open write policies above and move the browser-side service-client writes into route handlers.
- Admin client components flagged (CLAUDE.md) as calling `getServiceClient()` from the browser (anon-key fallback): `AddProductForm`, `CouponForm`, `CouponList`, `InventoryContent`, `SiteSettingsForm`, `CategoryForm`. Each needs a server route before its table's write policy can be closed.

---

## 4. Tables: match / XELLE-only / to-add

- **Already match (both repos):** products, categories, orders, coupons, inventory_items, inventory_logs, pages, delivery_zones, delivery_locations, site_settings, profiles, reviews, media.
- **XELLE-ONLY — never remove (ZúTa Ya deleted these):** `stockpiles`, `stockpile_items`, and the `ORD-SP-` pay-now-ship-later flow. Signature feature.
- **To add for Phase 1:** `admin_users`, `admin_sessions`, `admin_audit_logs`, `rate_limits`.

## 5. Dependencies & migration convention

- **Deps present:** `vitest ^4.1.2` (Phase 3.2 partly seeded; test script `vitest run` already in `package.json`).
- **Deps missing (add when the phase needs them):** `bcryptjs` (1.1), `jspdf`/`jspdf-autotable` (2.1).
- **Migration numbering is mixed** in `supabase/migrations/`: `001_tighten_rls.sql` (3-digit) + `20260316_variant_stock_deduction.sql` (dated). **Continue the `NNN_` sequence** starting at `002_` for new work; do **not** reuse ZúTa Ya's numbers (015/025/028…). Every schema change ships with a rollback note (001 already models this).

## 6. Hard constraints carried from AGENT.md

Integer stock only · keep Stockpiles · no food-specific code · Paystack parked (Phase 4) · additive numbered migrations · all data access through `lib/queries.ts` mappers (snake↔camel, JSONB `typeof === "string" ? JSON.parse() : value` guard) · no secrets (placeholders in `.env.example`).
