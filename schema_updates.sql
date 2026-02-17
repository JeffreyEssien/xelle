-- 1. Enable Internal Notes for Orders (Phase 2)
alter table public.orders add column if not exists notes text;

-- 2. Create Site Settings Table (Phase 3)
create table if not exists public.site_settings (
  id bool primary key default true,
  site_name text default 'XELLÉ',
  logo_url text,
  hero_heading text,
  hero_subheading text,
  hero_image text,
  hero_cta_text text,
  hero_cta_link text,
  constraint site_settings_id_check check (id)
);

-- 3. Initialize Settings Row
insert into public.site_settings (id) values (true) on conflict do nothing;

-- 4. Create Coupons Table (Phase 2 Extension)
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  is_active boolean default true,
  usage_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS)
alter table public.site_settings enable row level security;
alter table public.coupons enable row level security;

-- 6. Create Policies (Drop first to avoid errors)
-- Settings
drop policy if exists "Public read settings" on public.site_settings;
drop policy if exists "Admin update settings" on public.site_settings;
drop policy if exists "Admin insert settings" on public.site_settings;

create policy "Public read settings" on public.site_settings for select using (true);
create policy "Admin update settings" on public.site_settings for update using (true);
create policy "Admin insert settings" on public.site_settings for insert with check (true);

-- Coupons
drop policy if exists "Admin full access coupons" on public.coupons;
drop policy if exists "Public read active coupons" on public.coupons;

-- Admin access
create policy "Admin full access coupons" on public.coupons for all using (true);

-- Public access: Only active coupons can be read directly
create policy "Public read active coupons" on public.coupons for select using (is_active = true);

-- 7. Missing Admin Policies (Fix for "Status not updating" and other CRUD issues)
-- Orders
alter table public.orders enable row level security;
drop policy if exists "Public insert orders" on public.orders;
drop policy if exists "Admin full access orders" on public.orders;

create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Admin full access orders" on public.orders for all using (true);

-- Products (Ensure Update/Delete works)
alter table public.products enable row level security;
drop policy if exists "Public read products" on public.products;
drop policy if exists "Admin full access products" on public.products;

create policy "Public read products" on public.products for select using (true);
create policy "Admin full access products" on public.products for all using (true);

-- Categories
alter table public.categories enable row level security;
drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Admin full access categories" on public.categories;

create policy "Public read categories" on public.categories for select using (true);
create policy "Admin full access categories" on public.categories for all using (true);
