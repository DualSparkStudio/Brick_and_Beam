-- Add new pricing fields to rooms table
-- Remove max_occupancy requirement and add new fields

-- Add child_above_5_price column
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS child_above_5_price DECIMAL(10,2) DEFAULT 0;

-- Add gst_percentage column
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 12;

-- Add check_in_time and check_out_time columns if they don't exist
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS check_in_time TEXT DEFAULT '12:00 PM';

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS check_out_time TEXT DEFAULT '10:00 AM';

-- Make max_occupancy nullable (optional) since we're removing it from the UI
ALTER TABLE rooms 
ALTER COLUMN max_occupancy DROP NOT NULL;

-- Update existing rooms to have default values
UPDATE rooms 
SET child_above_5_price = 0 
WHERE child_above_5_price IS NULL;

UPDATE rooms 
SET gst_percentage = 12 
WHERE gst_percentage IS NULL;

UPDATE rooms 
SET check_in_time = '12:00 PM' 
WHERE check_in_time IS NULL;

UPDATE rooms 
SET check_out_time = '10:00 AM' 
WHERE check_out_time IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN rooms.child_above_5_price IS 'Price per child above 5 years per night';
COMMENT ON COLUMN rooms.gst_percentage IS 'GST percentage to apply (default 12%)';
COMMENT ON COLUMN rooms.check_in_time IS 'Check-in time (hardcoded to 12:00 PM)';
COMMENT ON COLUMN rooms.check_out_time IS 'Check-out time (hardcoded to 10:00 AM)';
