-- ==============================================
-- Delivery Zones & Locations
-- Supports Lagos local zones and interstate delivery
-- ==============================================

-- 10. Delivery Zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('lagos', 'interstate')),
  base_fee NUMERIC(10,2),
  allows_hub_pickup BOOLEAN DEFAULT FALSE,
  hub_estimate TEXT,
  doorstep_estimate TEXT,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_label TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Delivery Locations
CREATE TABLE IF NOT EXISTS delivery_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES delivery_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hub_pickup_fee NUMERIC(10,2),
  doorstep_fee NUMERIC(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_locations_zone ON delivery_locations(zone_id);

-- RLS
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- Public read (customers need to see pricing at checkout)
CREATE POLICY "Public read delivery_zones" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "Public read delivery_locations" ON delivery_locations FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin manage delivery_zones" ON delivery_zones FOR ALL USING (true);
CREATE POLICY "Admin manage delivery_locations" ON delivery_locations FOR ALL USING (true);
