-- Add new site_settings columns for admin customizability
-- Run this in Supabase SQL Editor

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_bar_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_bar_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_bar_color TEXT DEFAULT '#B665D2';

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_facebook TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS business_whatsapp TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS business_address TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_tagline TEXT;
