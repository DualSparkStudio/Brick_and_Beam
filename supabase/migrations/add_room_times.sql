-- Add check-in and check-out time columns to rooms table
-- Uses TEXT type to be flexible with formats like '14:00' or '2:00 PM'

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS check_in_time TEXT;

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS check_out_time TEXT;


