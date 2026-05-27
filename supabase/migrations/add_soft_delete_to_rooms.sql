-- Add soft delete functionality to rooms table

-- Add deleted_at column for soft delete
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add is_deleted boolean for easier querying
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_deleted ON rooms(is_deleted, deleted_at);

-- Add comments for documentation
COMMENT ON COLUMN rooms.deleted_at IS 'Timestamp when room was soft deleted (NULL = not deleted)';
COMMENT ON COLUMN rooms.is_deleted IS 'Boolean flag for soft delete (TRUE = deleted, FALSE = active)';

-- Update existing rooms to have is_deleted = false
UPDATE rooms 
SET is_deleted = FALSE 
WHERE is_deleted IS NULL;
