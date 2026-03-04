-- Migration: Add delivery detail columns to orders table
-- Run this in Supabase SQL Editor alongside add_delivery_tables.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_zone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_discount JSONB;
