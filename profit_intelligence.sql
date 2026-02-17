CREATE OR REPLACE FUNCTION process_new_order(
  p_order_id TEXT,
  p_customer_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_items JSONB, 
  p_subtotal NUMERIC,
  p_shipping NUMERIC,
  p_total NUMERIC,
  p_status TEXT,
  p_shipping_address JSONB
) 
RETURNS VOID AS $$
DECLARE
  v_item JSONB;
  v_inventory_id UUID;
  v_quantity INT;
  v_cost_price NUMERIC;
  v_product_name TEXT;
  v_final_items JSONB := '[]'::JSONB;
  v_new_item JSONB;
BEGIN
  -- 1. Loop through items to process stock and snapshot cost
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_inventory_id := (v_item->'product'->>'inventoryId')::UUID;
    v_quantity := (v_item->>'quantity')::INT;
    
    -- Default to 0 cost if not found
    v_cost_price := 0;

    -- If linked to inventory, process stock, log, and get cost
    IF v_inventory_id IS NOT NULL THEN
      -- Get current cost price and name
      SELECT cost_price, name INTO v_cost_price, v_product_name 
      FROM inventory_items 
      WHERE id = v_inventory_id;

      -- Deduct Stock
      UPDATE inventory_items 
      SET stock = stock - v_quantity,
          updated_at = now()
      WHERE id = v_inventory_id;

      -- Log Transaction
      INSERT INTO inventory_logs (product_id, change_amount, reason, created_at)
      VALUES (
        (v_item->'product'->>'id')::UUID, 
        -v_quantity,
        'order',
        now()
      );
    END IF;

    -- Create new item object with snapshot cost
    -- We extend the existing item JSON with 'costPrice'
    v_new_item := v_item || jsonb_build_object('costPrice', COALESCE(v_cost_price, 0));
    v_final_items := v_final_items || v_new_item;
  END LOOP;

  -- 2. Insert Order with the updated items (containing snapshots)
  INSERT INTO orders (
    id, customer_name, email, phone, items, subtotal, shipping, total, status, shipping_address, created_at
  ) VALUES (
    p_order_id, p_customer_name, p_email, p_phone, p_final_items, p_subtotal, p_shipping, p_total, p_status, p_shipping_address, now()
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
