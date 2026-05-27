-- Add room_name column to bookings table to preserve room info after deletion
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS room_name TEXT;

-- Update existing bookings with room names
UPDATE bookings b
SET room_name = r.name
FROM rooms r
WHERE b.room_id = r.id AND b.room_name IS NULL;

-- Change foreign key constraint to allow deletion (CASCADE will set room_id to NULL)
-- First, drop the existing constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_room_id_fkey;

-- Add new constraint that allows deletion
ALTER TABLE bookings 
ADD CONSTRAINT bookings_room_id_fkey 
FOREIGN KEY (room_id) 
REFERENCES rooms(id) 
ON DELETE SET NULL;

-- Make room_id nullable since it can be null after room deletion
ALTER TABLE bookings 
ALTER COLUMN room_id DROP NOT NULL;
