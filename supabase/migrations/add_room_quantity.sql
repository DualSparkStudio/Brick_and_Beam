-- Migration: Add room quantity support for room type system
-- This allows tracking multiple rooms of the same type

-- Add quantity column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN rooms.quantity IS 'Number of rooms available for this room type';

-- Make room_number optional (since we're now tracking room types, not individual rooms)
ALTER TABLE rooms ALTER COLUMN room_number DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_quantity ON rooms(quantity);

-- Update existing rooms to have quantity = 1 (backward compatible)
UPDATE rooms SET quantity = 1 WHERE quantity IS NULL;

-- Add constraint to ensure quantity is positive
ALTER TABLE rooms ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0);
