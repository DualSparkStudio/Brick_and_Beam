-- Migration: Add occupancy-based pricing columns to rooms table
-- This adds support for double, triple, and four-person occupancy pricing
-- as well as extra mattress pricing

-- Add occupancy pricing columns
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS price_double_occupancy NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS price_triple_occupancy NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS price_four_occupancy NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS extra_mattress_price NUMERIC(10, 2) DEFAULT 200;

-- Add comments for documentation
COMMENT ON COLUMN rooms.price_double_occupancy IS 'Price per night for 2 guests (double occupancy)';
COMMENT ON COLUMN rooms.price_triple_occupancy IS 'Price per night for 3 guests (triple occupancy)';
COMMENT ON COLUMN rooms.price_four_occupancy IS 'Price per night for 4 guests (four person occupancy)';
COMMENT ON COLUMN rooms.extra_mattress_price IS 'Price per extra mattress per night (default: ₹200)';

