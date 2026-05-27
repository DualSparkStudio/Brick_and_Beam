-- Add max_capacity column to rooms table
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 2;

-- Add a comment to explain the column
COMMENT ON COLUMN rooms.max_capacity IS 'Maximum number of guests allowed in this room type';

-- Update existing rooms to have a default max capacity if not set
UPDATE rooms
SET max_capacity = 4
WHERE max_capacity IS NULL OR max_capacity = 0;
