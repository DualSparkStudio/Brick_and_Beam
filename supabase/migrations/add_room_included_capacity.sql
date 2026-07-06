-- Guests included in base price (separate from max_capacity)

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS included_capacity INTEGER DEFAULT 0;

COMMENT ON COLUMN rooms.included_capacity IS 'Guests included in the base nightly price';

UPDATE rooms
SET included_capacity = max_capacity
WHERE (included_capacity IS NULL OR included_capacity = 0) AND max_capacity > 0;
