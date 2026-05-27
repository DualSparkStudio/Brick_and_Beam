-- Add extra guest and children columns to bookings table

-- Add num_extra_adults column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS num_extra_adults INTEGER DEFAULT 0;

-- Add num_children_above_5 column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS num_children_above_5 INTEGER DEFAULT 0;

-- Add subtotal_amount column (amount before GST)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) DEFAULT 0;

-- Add gst_amount column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0;

-- Add gst_percentage column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 12;

-- Update existing bookings to have default values
UPDATE bookings 
SET num_extra_adults = 0 
WHERE num_extra_adults IS NULL;

UPDATE bookings 
SET num_children_above_5 = 0 
WHERE num_children_above_5 IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN bookings.num_extra_adults IS 'Number of extra adults beyond the base 2';
COMMENT ON COLUMN bookings.num_children_above_5 IS 'Number of children above 5 years';
COMMENT ON COLUMN bookings.subtotal_amount IS 'Total amount before GST';
COMMENT ON COLUMN bookings.gst_amount IS 'GST amount';
COMMENT ON COLUMN bookings.gst_percentage IS 'GST percentage applied';
