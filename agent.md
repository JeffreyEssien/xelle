# AGENT.md — ZúTa Ya → XELLE Feature Port

> **Purpose of this file.** This is a work queue for an AI coding agent (e.g. Claude Code) operating **inside the XELLE repo**. It ports selected subsystems from ZúTa Ya (`JeffreyEssien/zutaya`) into XELLE. Work it **one task at a time**, top to bottom, respecting the phase order. Do not batch phases.

---

## How to use this file

1. **Pick the first unchecked task** (`- [ ]`) that has all its dependencies met. Do not skip ahead.
2. **Read the referenced source** in ZúTa Ya before writing anything, and **read the current XELLE code** it will touch. Never assume a signature — verify it against the real file. Where this doc says "port X," it means *adapt* X to XELLE's existing patterns, not paste it.
3. **Do the task, then run its Verify step.** If verification fails, fix it before moving on.
4. **Check the box** (`- [x]`) and add a one-line note of what actually changed (files, migration numbers). This file is the source of truth for where the port stands — treat it like ZúTa Ya's `CLAUDE.md`.
5. **Commit per task** with a message like `port(phase-1): DB-only admin auth`. One task ≈ one reviewable commit.

### Ground rules (apply to every task)

- **XELLE keeps integer stock.** Do NOT bring weight-based `NUMERIC` stock or 0.5 kg steps. Wherever ZúTa Ya widened stock to NUMERIC (migrations 025/029/030), keep XELLE's integer columns.
- **XELLE keeps Stockpiles.** ZúTa Ya deleted the pay-now-ship-later system; XELLE's is a signature feature. Never remove `stockpiles` / `stockpile_items` / the `ORD-SP-` flow.
- **Do NOT port food-specific code.** Excluded: kitchen/grill menu, marinades, processing options, outdoor butchery, `OwambeWizard`, `EatModeSelector`, `ProcessingConfigurator`, `service_bookings`/events/occasions, cold-chain/insulated-packaging scheduling, and the "Meat & Delivery" analytics tab.
- **Paystack is deferred.** Do NOT port the payment ledger, HMAC webhook, resume-payment flow, recovery cron, attempt counters, or subscriptions in these phases. XELLE keeps its current WhatsApp / bank-transfer confirm cycle. See Phase 4 (parked).
- **Migrations are additive and numbered.** Continue XELLE's own migration sequence; don't reuse ZúTa Ya's numbers. Every schema change ships as a migration file plus a rollback note.
- **Preserve XELLE's mapper convention.** XELLE funnels the data layer through `lib/queries.ts` (snake_case ↔ camelCase). Any new table gets a mapper there, matching the existing `toProduct`/`toOrder` style. Guard JSONB fields with the `typeof === "string" ? JSON.parse() : value` pattern.
- **Never commit secrets.** New env vars go in `.env.example` with placeholder values only.

---

## Phase 0 — Recon (do once, before Phase 1)

Establish what XELLE actually looks like today so later tasks adapt instead of assume.

- [x] **0.1 Map the divergence.** Read XELLE's `CLAUDE.md`, `lib/queries.ts`, `lib/supabase.ts`, `proxy.ts`, the `/api/orders` + `lib/orderQueue.ts` path, and the admin auth flow (`ADMIN_PASSWORD` → `admin_session` cookie → `/api/admin/login`). Read the equivalent ZúTa Ya files. Write a short `PORT-NOTES.md` in the XELLE repo listing: which tables already match, which functions have drifted, and any XELLE-only code the port must not break (Stockpiles especially).
  - **Verify:** `PORT-NOTES.md` exists and names concrete file/function differences, not generalities.
  - _Done: wrote `PORT-NOTES.md`. Read both repos' `proxy.ts`/login/`supabase.ts`, XELLE `createOrder` (queries.ts:281) + `orderQueue.ts` + `/api/orders`, ZúTa Ya `adminAuth.ts`/`rateLimit.ts`/migrations 015+025 + `create_order_atomic`. Key drifts: getter name `getServiceClient` vs `getSupabaseServiceClient` (+ anon-key fallback footgun), static-password vs bcrypt/DB-session auth, non-atomic multi-step order write vs single locking RPC, and `001_tighten_rls.sql` already locks customer data but leaves catalog tables open. XELLE-only to preserve: Stockpiles/`ORD-SP-`, integer stock._

---

## Phase 1 — Security + Money-Integrity Release

**Goal:** replace the shared-password admin with real accounts, add an audit trail, tighten RLS, and make the order write-path atomic — all on XELLE's *current* payment flow. These ship together because they all touch the write/auth path.

- [ ] **1.1 DB-only bcrypt admin auth.**
  Source: ZúTa Ya `admin_users` table, `admin_sessions`, bcryptjs hashing, `proxy.ts` session validation.
  - Add migration: `admin_users` (id, email, password_hash, role `admin|super_admin`, timestamps) and `admin_sessions` (token, admin_id, expires_at ~7 days).
  - Add `bcryptjs`. Rewrite `/api/admin/login` to look up `admin_users`, `bcrypt.compare`, mint a session token, set an httpOnly cookie.
  - Update `proxy.ts` middleware over `/admin/*` to validate the session token against `admin_sessions` (not the static password).
  - Add a seed script / one-off route to create the first `super_admin` (read the initial password from an env var, hash it, insert; never store plaintext).
  - Keep `ADMIN_PASSWORD` working ONLY as a temporary fallback behind a feature flag if needed for cutover, then remove it in 1.2's verify.
  - **Verify:** logging in with a seeded `admin_users` row works; the old static `ADMIN_PASSWORD` no longer grants access once the flag is off; sessions expire.

- [ ] **1.2 Admin audit log.**
  Source: ZúTa Ya `admin_audit_logs` + `logAdminAction` / `logCronEvent`.
  - Add migration: `admin_audit_logs` (id, admin_id, action, target_type, target_id, metadata jsonb, created_at).
  - Add a `logAdminAction(adminId, action, target, meta)` helper. Call it from the sensitive admin mutations first: order status changes, payment confirmation (`PATCH`/`PUT /api/orders/[id]`), product create/edit, inventory adjustments, coupon changes.
  - Add a read-only admin view listing recent audit entries.
  - **Verify:** confirming a payment or changing an order status writes a row; the admin view renders it. Remove the `ADMIN_PASSWORD` fallback now.

- [ ] **1.3 RLS rewrite.**
  Source: ZúTa Ya's RLS model (the non-permissive one).
  - Replace XELLE's permissive `USING (true)` **write** policies. Reads can stay public where the storefront needs them; writes must be gated to the service role / authenticated admin context.
  - Audit the admin client components XELLE's `CLAUDE.md` flags as calling the service client from the browser and falling back to the anon key. Move those writes server-side (route handlers) so the anon key is never used for privileged writes.
  - **Verify:** an anon-key client can no longer write to `orders`/`products`/`inventory_items`/`coupons`; admin routes (running server-side with the service role) still can. Storefront reads still work.

- [ ] **1.4 Atomic order RPC (oversell fix) — no Paystack.**
  Source: ZúTa Ya `create_order_atomic` RPC (migrations 025/029/030), but take **only the locking/atomicity approach**, not the NUMERIC stock.
  - Write a new RPC that, in a single transaction: checks stock, deducts it (integer, via XELLE's `deduct_stock`/`deduct_variant_stock` logic), and increments coupon usage — with row locking so concurrent checkouts can't oversell or double-count coupon usage.
  - Wire it into XELLE's **existing** order path (`POST /api/orders` → `lib/orderQueue.ts`). Keep the `orderQueue` limiter; the RPC replaces the non-atomic multi-step writes inside it.
  - This closes the concurrency races XELLE's `CLAUDE.md` documents (coupon-usage + stockpile-total). Also apply the same locking to the stockpile total update (`ORD-SP-` path).
  - **Verify:** an integration test firing N parallel orders against a product with stock < N never oversells and never double-increments coupon usage. Stockpile totals stay consistent under parallel adds.

> **Phase 1 done when:** no static-password admin access remains, sensitive admin actions are audited, anon-key privileged writes are gone, and parallel-order tests pass without oversell — all on the current WhatsApp/bank-transfer flow.

---

## Phase 2 — Growth / Marketing Release (fully Paystack-free)

**Goal:** the high-ROI, on-brand wins for a luxury retail business. None of this touches checkout.

- [ ] **2.1 Catalogue / lookbook generator.** *(Highest priority — most on-brand for luxury fashion.)*
  Source: ZúTa Ya `lib/catalogue.ts` + `lib/catalogueExport.ts` (16:9 photo-card carousels, cover slide, balanced grids, PNG + PDF via jsPDF).
  - Port the generator, reading from XELLE's product data. Reframe copy/labels from "price list" to a **lookbook / edit** framing suitable for fashion.
  - Add the admin control to generate + download (PNG and PDF) for a selected category or hand-picked product set.
  - Add `jspdf` / `jspdf-autotable` if XELLE lacks them.
  - **Verify:** an admin can produce a shareable PDF and PNG lookbook of a category; images resolve from Cloudinary; layout doesn't break with 1, 4, and 12 products.

- [ ] **2.2 Newsletter + campaigns.**
  Source: ZúTa Ya Newsletter (footer signup → welcome email), admin campaign CRUD + batch send, token-based unsubscribe.
  - Add migration: `newsletter_subscribers` (email, status, unsubscribe_token, timestamps) and `campaigns` (subject, body, status, sent_at).
  - Footer signup writes a subscriber + fires a welcome email via XELLE's existing `lib/email.ts` (Nodemailer/Gmail). Reuse XELLE's template style.
  - Admin: create a campaign, batch-send to subscribers, token unsubscribe link in every email footer.
  - **Verify:** signup stores + sends welcome; a test campaign sends to subscribers; unsubscribe link flips status and stops future sends.

- [ ] **2.3 Technical SEO foundation.**
  Source: ZúTa Ya `lib/seo.ts` (central JSON-LD builders), `sitemap.ts`, `robots.ts`, `metadataBase` + title templates + canonicals.
  - Port the schema builders, swapping ZúTa Ya's `GroceryStore` / meat address for XELLE's **Organization + Product/Offer/Breadcrumb** JSON-LD with XELLE's real business details.
  - Add dynamic `sitemap.ts` (products, categories, CMS pages) and `robots.ts`.
  - Set `metadataBase`, title templates, and canonicals across storefront routes.
  - **Verify:** product pages emit valid Product/Offer JSON-LD; sitemap lists live products + CMS pages; canonicals resolve; no console/SSR metadata warnings.

- [ ] **2.4 Google Merchant feed.**
  Source: ZúTa Ya `app/feed/google-merchant.xml` (RSS 2.0 from live products) + admin copy-URL/download controls.
  - Port the feed route, reading XELLE products. Drop meat-specific fields (`unit_pricing_measure`, etc.); keep fashion-relevant fields (id, title, description, link, image, price, availability, `identifier_exists=no` where GTINs are absent).
  - Add the admin copy-URL/download control.
  - **Verify:** the feed validates as RSS 2.0, reflects live stock/price, and only lists purchasable products.

> **Phase 2 done when:** admin can ship lookbooks, run email campaigns, the store is SEO-complete, and a Merchant feed is live.

---

## Phase 3 — Merchandising + Engineering Hygiene

**Goal:** curated selling surfaces + the safety net that keeps Phase 1's fixes from regressing. Cherry-pick in any order within this phase.

- [ ] **3.1 Curated collections / gift sets.** *(Reframe of ZúTa Ya "Packages," migration 028.)*
  Source: fixed curated boxes that deduct real stock at a flat price, with live availability + sold-out states.
  - Add migration: a `collections` (or `gift_sets`) table + line items referencing real products.
  - Each collection charges a flat price and, on checkout, deducts each line item's real stock **through the Phase 1 atomic RPC** and routes through XELLE's current order path (works on WhatsApp/bank flow — no Paystack needed).
  - Storefront page with live availability + sold-out state; admin CRUD.
  - **Verify:** buying a gift set deducts each component's stock atomically; a set shows sold-out when any component is out; flat price is charged.

- [ ] **3.2 Vitest + GitHub Actions CI.**
  Source: ZúTa Ya's Vitest suite + CI matrix (lint / typecheck / test / integration → build).
  - Add Vitest. Port/adapt the tests that matter for XELLE: the **atomic-order / parallel-order integration test from 1.4**, coupon validation, delivery pricing, and the queue limiter.
  - Add a GitHub Actions workflow: lint → typecheck → unit → integration → build.
  - **Verify:** `npm test` passes locally; CI runs green on a PR; the oversell test actually fails if the atomic RPC is reverted (guard is real, not a no-op).

- [ ] **3.3 CSV export suite.**
  Source: ZúTa Ya `lib/csv.ts` (Snapshot, Sales & Movement, Product Upload formats).
  - Port the inventory Export dropdown. Drop the meat-specific "Bumpa" format unless useful; keep Snapshot, Sales & Movement, Product Upload, Full Report.
  - **Verify:** each format downloads and opens cleanly with correct columns against live data.

- [ ] **3.4 Light/dark theming done right.**
  Source: ZúTa Ya's Tailwind v4 approach — remap concrete `--color-*` tokens per `@media (light)` and `[data-theme]` scope (the fix for the v4 arbitrary-variant-opacity bug; storefront light / admin dark).
  - Apply XELLE's palette. Reuse the already-solved token-remapping so opacity variants render correctly.
  - **Verify:** storefront renders light, admin renders dark, opacity utilities (e.g. `/50`) show correctly, no invisible text.

- [ ] **3.5 Upgraded NotificationBell + trimmings.**
  Source: ZúTa Ya NotificationBell (polling for new orders / pending payments / expiring + low stock, sound alerts), announcement bar, PromiseBar, and seeded admin-editable legal pages (Return/Privacy/Terms) that are sitemap-listed.
  - Extend XELLE's existing NotificationBell to also surface **expiring stockpiles** (XELLE-specific win) and low stock, with optional sound.
  - Add the announcement bar + PromiseBar to the storefront (content driven by editable site settings).
  - Seed Return/Privacy/Terms as admin-editable CMS pages; ensure they're picked up by the Phase 2 sitemap.
  - **Verify:** bell shows new orders + expiring stockpiles + low stock; legal pages render, are editable, and appear in the sitemap.

> **Phase 3 done when:** gift sets sell atomically, CI is green and guarding the order path, exports/theming/notifications are in, and legal pages are live.

---

## Phase 4 — PARKED until Paystack is live (do NOT start now)

Blocked on the XELLE Paystack merchant account + API keys. Listed so the plan is complete; leave every box unchecked.

- [ ] **4.1 Paystack + ledger** (`lib/paystack.ts`, `customers`/`payments` tables, HMAC-SHA512 webhook, `ZY-…-aN` attempt counters). Replaces the WhatsApp/bank confirm cycle.
- [ ] **4.2 Payment recovery** (`restoreStockForOrder` inverse RPCs, stuck-pending reconciliation cron via `/verify`, admin re-verify, resume-payment email + tokens).
- [ ] **4.3 Subscriptions** (Paystack `charge_authorization` auto-renewal + the MRR/ARR + retention analytics that support them). Reframe as a VIP / seasonal-drop membership. **No meaningful non-Paystack version — do not attempt earlier.**

**Precondition for un-parking Phase 4:** Paystack account approved, live + test API keys in `.env` (placeholders in `.env.example`), and `CRON_SECRET` provisioned.

---

## Quick reference — port / adapt / skip

| ZúTa Ya feature | XELLE action |
|---|---|
| DB bcrypt admin auth, audit logs, tight RLS | **Port** (Phase 1) |
| `create_order_atomic` locking | **Port the locking only; keep integer stock** (1.4) |
| Catalogue/lookbook, Newsletter, SEO, Merchant feed | **Port** (Phase 2) |
| Packages | **Reframe → gift sets / collections** (3.1) |
| Vitest + CI, CSV exports, v4 theming, NotificationBell, legal pages | **Port** (Phase 3) |
| Paystack ledger/webhook/recovery, Subscriptions | **Park** until Paystack (Phase 4) |
| NUMERIC/weight stock, 0.5 kg steps | **Skip — keep integer stock** |
| Kitchen/marinades/butchery, OwambeWizard, EatModeSelector, ProcessingConfigurator, service_bookings/events, cold-chain scheduling, Meat & Delivery analytics tab | **Skip** |
| Stockpiles (XELLE-only) | **Keep — never remove** |