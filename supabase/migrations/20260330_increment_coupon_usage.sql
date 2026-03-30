-- Atomically increment coupon usage_count when an order uses a coupon
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET usage_count = usage_count + 1 WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
