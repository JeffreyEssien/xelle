# XELLE - E-Commerce Platform

## Overview
XELLE is a Nigerian e-commerce platform for high-end lifestyle products. Built with Next.js 16, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL), and Zustand for state management.

## Tech Stack
- **Framework**: Next.js 16.2.1 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with brand colors (lilac #C8A2C8, purple #B665D2, dark #4B0082)
- **Database**: Supabase (PostgreSQL) with RLS policies
- **State**: Zustand 5 (cart, orders, notifications stores)
- **Email**: Nodemailer via Gmail SMTP
- **Rich Text**: TipTap editor for CMS pages
- **Charts**: Recharts for analytics
- **Animations**: Framer Motion

## Key Commands
```bash
npm run dev      # Start dev server
npx next build   # Production build
```

## Project Structure
```
app/                  # Next.js pages & API routes
  (public pages)      # /, /shop, /track, /checkout, /stockpile, /product/[slug], /[slug]
  admin/              # Password-protected admin dashboard (14 sub-routes)
  api/                # REST endpoints: /orders, /stockpile, /search, /admin/*
components/
  modules/            # Feature components (CheckoutForm, ProductCard, etc.)
  ui/                 # Primitive UI (Button, Badge, Skeletons, etc.)
lib/
  queries.ts          # ~65 database query functions (ALL DB ops go here)
  cartStore.ts        # Zustand cart store with coupon support
  orderStore.ts       # Zustand order tracking store
  notificationStore.ts # Admin notification store
  deliveryPricing.ts  # Delivery zones, fees, discounts logic
  email.ts            # Email templates (order confirm, shipped, delivered, etc.)
  constants.ts        # Site constants, WhatsApp number, bank details
  orderQueue.ts       # Concurrency control (max 3 concurrent orders)
  supabase.ts         # Supabase client init
types/index.ts        # All TypeScript types (Product, Order, CartItem, Stockpile, etc.)
supabase/
  schema.sql          # Full DB schema (13 tables)
  seed.sql            # Sample data
proxy.ts              # Admin auth middleware (cookie-based)
```

## Database Tables
products, categories, orders, site_settings, inventory_items, inventory_logs, coupons, pages, profiles, delivery_zones, delivery_locations, stockpiles, stockpile_items

## Key Features
- **Stockpile System**: Pay now, ship later. 14-day expiry. Items accumulated across orders, single shipping fee when ready.
- **Delivery Pricing**: Lagos (4 zones) and interstate. Doorstep or hub pickup. DB-driven with fallback to hardcoded values.
- **Order Queue**: In-memory queue prevents DB overload (max 3 concurrent order writes).
- **Payment Flow**: WhatsApp chat or bank transfer with admin confirmation cycle.
- **Inventory**: SKU-based with atomic stock deduction via Supabase RPC (`deduct_stock`, `deduct_variant_stock`).
- **CMS Pages**: Dynamic pages at `/[slug]` with TipTap rich text editor.
- **Analytics Dashboard**: Revenue, inventory, customer, marketing metrics (client-side calculated).

## API Endpoints
| Method | Route | Purpose |
|--------|-------|---------|
| POST | /api/orders | Create order (queued, with stock deduction) |
| PUT | /api/orders/[id] | Update order status + email |
| PATCH | /api/orders/[id] | Update payment info |
| POST | /api/orders/track | Track order (public) |
| GET/POST | /api/stockpile | CRUD stockpiles (actions: create, add_items, remove_item, update_status, update_shipping) |
| GET | /api/search | Product search |
| POST | /api/admin/login | Admin auth |
| GET | /api/admin/notifications | Poll new orders/payments |
| GET/POST | /api/admin/delivery | Delivery zone management |

## Admin Auth
Simple password-based: `ADMIN_PASSWORD` env var, sets `admin_session` cookie. Middleware in `proxy.ts` protects `/admin/*` routes.

## Important Constants (lib/constants.ts)
- Currency: NGN (Nigerian Naira)
- WhatsApp: 2347011378490
- Bank: Pocketapp / 9765752252 / Excellence Okey Orji
- Low stock threshold: 5

## Conventions
- All DB operations go through `lib/queries.ts`
- Supabase client from `lib/supabase.ts`
- Currency formatting via `lib/formatCurrency.ts`
- Brand classes: `text-brand-dark`, `text-brand-purple`, `bg-brand-lilac`
- `useSearchParams()` must be wrapped in `<Suspense>` (Next.js requirement)
- Order IDs: `ORD-{timestamp}`, Stockpile orders: `ORD-SP-{timestamp}`, Shipping orders: `ORD-SHP-{timestamp}`
