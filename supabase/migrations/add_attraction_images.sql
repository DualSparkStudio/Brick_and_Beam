-- Add images array column to tourist_attractions table
-- This allows storing multiple images per attraction

-- Add images column if it doesn't exist
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Also add to attractions table if it exists (for backward compatibility)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attractions') THEN
        ALTER TABLE attractions 
        ADD COLUMN IF NOT EXISTS images TEXT[];
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN tourist_attractions.images IS 'Array of image URLs for the attraction';
