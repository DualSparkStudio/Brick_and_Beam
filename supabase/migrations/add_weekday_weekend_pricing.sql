-- Weekday vs weekend (Saturday) nightly rates for whole-villa pricing
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS weekday_price_per_night NUMERIC(10, 2);

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS weekend_price_per_night NUMERIC(10, 2);

-- Backfill from legacy couple/base price
UPDATE rooms
SET weekday_price_per_night = price_per_night
WHERE weekday_price_per_night IS NULL AND price_per_night IS NOT NULL;

UPDATE rooms
SET weekend_price_per_night = price_per_night
WHERE weekend_price_per_night IS NULL AND price_per_night IS NOT NULL;

COMMENT ON COLUMN rooms.weekday_price_per_night IS 'Nightly rate Mon–Fri and Sun (whole villa)';
COMMENT ON COLUMN rooms.weekend_price_per_night IS 'Nightly rate for Saturday (whole villa)';
