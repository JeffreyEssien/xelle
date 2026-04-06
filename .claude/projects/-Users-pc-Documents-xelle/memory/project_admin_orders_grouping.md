---
name: Admin Orders Stockpile Grouping
description: Stockpile orders grouped by customer in admin orders page with filter tabs, collapsible rows, and bulk actions
type: project
---

**What was done (2026-04-06):** Redesigned AdminOrdersContent.tsx to group stockpile orders by customer email instead of showing them as scattered individual rows.

**Changes:**
- Added filter tabs: "All Orders" | "Regular" | "Stockpile" with count badges
- Stockpile orders (ORD-SP-*, ORD-SHP-*) grouped by `order.email` into collapsible rows
- Group row shows: customer, combined total, order count, aggregate status (worst: pending > shipped > delivered), latest date
- Purple-tinted background + left border accent distinguishes groups from regular orders
- Expand/collapse reveals sub-orders with type pills ("Items" / "Shipping")
- Bulk status dropdown on group row updates all orders in that group
- Individual sub-orders still clickable to open OrderDetailPanel
- Mobile cards follow same collapsible group pattern

**Why:** User wanted orderliness — stockpile orders from the same customer cluttered the admin view. Individual orders preserved for accounting, but visually unified per customer.

**How to apply:** Stockpile order detection uses ID prefix: `o.id.startsWith("ORD-SP-") || o.id.startsWith("ORD-SHP-")`. All logic is self-contained in `components/modules/AdminOrdersContent.tsx`.
