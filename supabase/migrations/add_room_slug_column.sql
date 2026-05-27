-- Add slug column to rooms table
-- Run this in your Supabase SQL editor

-- Add slug column
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for better performance (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rooms_slug') THEN
    CREATE INDEX idx_rooms_slug ON rooms(slug);
  END IF;
END$$;

-- Add unique constraint (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_room_slug' 
    AND table_name = 'rooms'
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT unique_room_slug UNIQUE (slug);
  END IF;
END$$;

-- Update existing rooms with slugs based on their names
UPDATE rooms
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug column NOT NULL after populating (only if not already set)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' 
    AND column_name = 'slug' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE rooms ALTER COLUMN slug SET NOT NULL;
  END IF;
END$$;
