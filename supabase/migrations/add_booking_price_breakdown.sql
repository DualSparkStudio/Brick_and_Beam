-- Store price breakdown snapshot on bookings (for confirmation, admin, emails)

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS base_amount NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extra_guests INTEGER DEFAULT 0;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extra_guests_amount NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extra_guest_price_per_night NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS included_capacity INTEGER DEFAULT 0;

COMMENT ON COLUMN bookings.base_amount IS 'Villa base amount at booking time (nights × base rate)';
COMMENT ON COLUMN bookings.extra_guests IS 'Number of extra guests charged above included capacity';
COMMENT ON COLUMN bookings.extra_guests_amount IS 'Total extra guest charges at booking time';
COMMENT ON COLUMN bookings.extra_guest_price_per_night IS 'Per-night extra guest rate at booking time';
COMMENT ON COLUMN bookings.included_capacity IS 'Guests included in base price at booking time';
