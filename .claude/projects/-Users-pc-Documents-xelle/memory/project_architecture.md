---
name: Xelle Project Architecture
description: Core architecture of the Xelle e-commerce platform — tech stack, key files, database schema, and feature map
type: project
---

Xelle is a Nigerian e-commerce platform for high-end lifestyle products. Full details documented in /CLAUDE.md at project root.

**Key architectural decisions:**
- All DB operations centralized in `lib/queries.ts` (~65 functions)
- Order creation goes through `lib/orderQueue.ts` (max 3 concurrent) to prevent DB overload
- Delivery pricing has dual sources: DB-driven (delivery_zones/delivery_locations tables) with hardcoded fallback in `lib/deliveryPricing.ts`
- Stock deduction uses Supabase RPC functions (`deduct_stock`, `deduct_variant_stock`) for atomicity
- Admin auth is simple password + cookie, no OAuth
- Stockpile system is separate from regular cart — items stored in DB (stockpiles + stockpile_items tables), not in Zustand cart store

**Why:** This is a small-team e-commerce project prioritizing simplicity and speed over enterprise patterns.

**How to apply:** When adding features, follow existing patterns — DB ops in queries.ts, API routes as thin handlers, client state in Zustand stores. Always wrap `useSearchParams()` in Suspense.
