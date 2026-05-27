-- Add video_url column to rooms table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN rooms.video_url IS 'Cloudinary video URL for room video';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'video_url';
