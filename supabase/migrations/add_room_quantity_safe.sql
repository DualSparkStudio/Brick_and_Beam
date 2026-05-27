-- Migration: Add room quantity support for room type system (Safe Version)
-- This allows tracking multiple rooms of the same type
-- Safe to run multiple times - won't fail if columns/constraints already exist

-- 1. Add quantity column to rooms table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE rooms ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- 2. Add comment for documentation
COMMENT ON COLUMN rooms.quantity IS 'Number of rooms available for this room type';

-- 3. Make room_number optional (if not already optional)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' 
        AND column_name = 'room_number' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE rooms ALTER COLUMN room_number DROP NOT NULL;
    END IF;
END $$;

-- 4. Add index for better query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_rooms_quantity ON rooms(quantity);

-- 5. Update existing rooms to have quantity = 1 (backward compatible)
UPDATE rooms SET quantity = 1 WHERE quantity IS NULL;

-- 6. Add constraint to ensure quantity is positive (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'rooms'::regclass 
        AND conname = 'check_quantity_positive'
    ) THEN
        ALTER TABLE rooms ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0);
    END IF;
END $$;

-- 7. Verify the migration
SELECT 
    'Migration complete' as status,
    (SELECT COUNT(*) FROM rooms WHERE quantity IS NOT NULL) as rooms_with_quantity,
    (SELECT COUNT(*) FROM rooms) as total_rooms;