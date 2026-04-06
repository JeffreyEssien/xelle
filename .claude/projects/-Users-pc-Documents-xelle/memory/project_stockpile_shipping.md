---
name: Stockpile Shipping Fix
description: Fixed bug where stockpile "Request Shipping" showed empty cart — now routes to shipping fee payment flow
type: project
---

**What was fixed (2026-04-06):** Stockpile page's "Request Shipping" button links to `/checkout?stockpile={id}`. Previously, the checkout page only checked Zustand cart store for items, showing "Your cart is empty" since stockpile items live in DB, not in the cart.

**Changes made:**
- `app/checkout/page.tsx`: Reads `?stockpile=` param, skips empty cart check, wrapped in `<Suspense>` for `useSearchParams()`
- `components/modules/CheckoutForm.tsx`: Accepts `stockpileId` prop, fetches stockpile data, shows shipping-only checkout, calls `update_shipping` API action on submit
- `components/modules/CheckoutSummary.tsx`: Accepts `stockpileItems` prop, shows items as "Already paid", displays only shipping fee as total

**Why:** Stockpile items are stored in Supabase (stockpile_items table), completely separate from the Zustand cart store. The checkout page needed a second code path for shipping-only payment.

**How to apply:** The stockpile shipping flow creates orders with ID prefix `ORD-SHP-` and subtotal of 0 (only shipping fee). The existing `update_shipping` API action in `/api/stockpile` saves delivery details to the stockpile record.
