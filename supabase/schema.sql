-- ==============================================
-- XELLÉ Complete Database Schema (Source of Truth)
-- Use this to recreate the entire database from scratch
-- Last updated: 2026-02-19
-- ==============================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT NOT NULL,
  description TEXT
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT DEFAULT 'XELLÉ',
  stock INT DEFAULT 0,
  images TEXT[] NOT NULL,
  variants JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  inventory_item_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  shipping_address JSONB NOT NULL,
  notes TEXT,
  coupon_code TEXT,
  discount_total NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT,
  proof_of_payment TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- 4. Site Settings (Singleton)
CREATE TABLE IF NOT EXISTS site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
  site_name TEXT DEFAULT 'XELLÉ',
  logo_url TEXT,
  hero_heading TEXT,
  hero_subheading TEXT,
  hero_image TEXT,
  hero_cta_text TEXT,
  hero_cta_link TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. CMS Pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  inventory_item_id UUID,
  change_amount INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  stock INT DEFAULT 0,
  reorder_level INT DEFAULT 5,
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from products to inventory_items
ALTER TABLE products
  ADD CONSTRAINT fk_products_inventory
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);

-- Add FK from inventory_logs to inventory_items
ALTER TABLE inventory_logs
  ADD CONSTRAINT fk_inventory_logs_item
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);

-- 9. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- Row Level Security
-- ==============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Orders: public insert (customers place orders), service read/update
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Service update orders" ON orders FOR UPDATE USING (true);

-- Admin full access (open for now — restrict with role checks when auth is added)
CREATE POLICY "Admin full access inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Admin read inventory_logs" ON inventory_logs FOR SELECT USING (true);
CREATE POLICY "Public insert inventory_logs" ON inventory_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin all pages" ON pages FOR ALL USING (true);
CREATE POLICY "Admin manage coupons" ON coupons FOR ALL USING (true);
CREATE POLICY "Admin insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update site_settings" ON site_settings FOR UPDATE USING (true);

-- Profiles
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==============================================
-- Functions / RPCs
-- ==============================================

-- Atomic stock deduction (prevents race conditions)
CREATE OR REPLACE FUNCTION deduct_stock(
  p_inventory_id UUID,
  p_quantity INT
)
RETURNS INT AS $$
DECLARE
  v_current_stock INT;
BEGIN
  SELECT stock INTO v_current_stock
  FROM inventory_items
  WHERE id = p_inventory_id
  FOR UPDATE;

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found: %', p_inventory_id;
  END IF;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_stock, p_quantity;
  END IF;

  UPDATE inventory_items
  SET stock = stock - p_quantity,
      updated_at = now()
  WHERE id = p_inventory_id;

  RETURN v_current_stock - p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
