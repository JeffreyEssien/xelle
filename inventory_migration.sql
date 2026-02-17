-- ==============================================
-- 6. Profit-First Inventory Architecture
-- ==============================================

-- 6.1 Create Inventory Items Table
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

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access inventory_items" ON inventory_items FOR ALL USING (true); -- Implement role check in prod

-- 6.2 Add foreign key to products (nullable for now during migration)
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id);

-- 6.3 Update Inventory Logs to point to Inventory Items
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id);

-- 6.4 Link Function (Ideally run once manually or via migration script)
-- For now, we will add a function that can be called via RPC or executed directly here if possible.
CREATE OR REPLACE FUNCTION migrate_inventory() 
RETURNS VOID AS $$
DECLARE
    prod RECORD;
    new_inv_id UUID;
BEGIN
    FOR prod IN SELECT * FROM products WHERE inventory_item_id IS NULL LOOP
        -- Create Inventory Item using Product data
        INSERT INTO inventory_items (sku, name, cost_price, selling_price, stock)
        VALUES (
            prod.slug, -- Use slug as initial SKU
            prod.name,
            0, -- Default cost
            prod.price, -- Current selling price
            prod.stock
        )
        RETURNING id INTO new_inv_id;

        -- Update Product with new Inventory ID
        UPDATE products SET inventory_item_id = new_inv_id WHERE id = prod.id;
        
        -- Update existing Logs for this product
        UPDATE inventory_logs SET inventory_item_id = new_inv_id WHERE product_id = prod.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_inventory();
