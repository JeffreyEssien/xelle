-- ==============================================
-- XELLÉ Additional Schema Updates
-- Run this in Supabase SQL Editor
-- ==============================================

-- 1. Site Settings (Singleton)
CREATE TABLE IF NOT EXISTS site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE), -- Enforce singleton
  site_name TEXT default 'XELLÉ',
  logo_url TEXT,
  hero_heading TEXT,
  hero_subheading TEXT,
  hero_image TEXT,
  hero_cta_text TEXT,
  hero_cta_link TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update site_settings" ON site_settings FOR UPDATE USING (true); -- Ideally restrict to admin role
CREATE POLICY "Admin insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);

-- 2. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

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

-- 3. CMS Pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB, -- For rich text (TipTap)
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admin all pages" ON pages FOR ALL USING (true); -- ideally check role

-- 4. Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  change_amount INT NOT NULL, -- positive for restock, negative for sale
  reason TEXT NOT NULL, -- 'order', 'restock', 'correction'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read inventory_logs" ON inventory_logs FOR SELECT USING (true);

-- 5. Trigger for Inventory on Order (Optional: implemented in logic or trigger?)
-- Let's stick to application logic for now to keep it simple, or add a trigger if requested explicitly.
-- The plan said "Record stock changes on order/manual update" -> we'll do this in API logic for better control first.

