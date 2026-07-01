-- ============================================
-- Brick & Beam — Fresh Supabase Project Setup
-- ============================================
-- Run this entire script in Supabase → SQL Editor on a new project.
--
-- After running:
--   1. Update .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
--   2. Add SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to Netlify
--   3. Log in to /admin with the default credentials below and change the password
--
-- Default admin login:
--   Email:    admin@brickandbeam.com
--   Password: Admin@123
-- ============================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Shared trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. USERS (admin login fallback)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- ---------------------------------------------------------------------------
-- 2. ADMIN (primary admin login table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);
CREATE INDEX IF NOT EXISTS idx_admin_is_active ON admin(is_active);

DROP TRIGGER IF EXISTS update_admin_updated_at ON admin;
CREATE TRIGGER update_admin_updated_at
  BEFORE UPDATE ON admin
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 3. ROOMS (villa / room types)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL,
  price_per_night NUMERIC(10, 2) NOT NULL,
  max_occupancy INTEGER DEFAULT 2,
  max_capacity INTEGER DEFAULT 4,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  amenities TEXT[],
  image_url TEXT,
  images TEXT[],
  video_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  extra_guest_price NUMERIC(10, 2),
  child_above_5_price NUMERIC(10, 2) DEFAULT 0,
  accommodation_details TEXT,
  floor INTEGER,
  check_in_time TEXT DEFAULT '12:00 PM',
  check_out_time TEXT DEFAULT '10:00 AM',
  price_double_occupancy NUMERIC(10, 2),
  price_triple_occupancy NUMERIC(10, 2),
  price_four_occupancy NUMERIC(10, 2),
  extra_mattress_price NUMERIC(10, 2) DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_rooms_quantity ON rooms(quantity);
CREATE INDEX IF NOT EXISTS idx_rooms_deleted ON rooms(is_deleted, deleted_at);

-- ---------------------------------------------------------------------------
-- 4. ROOM IMAGES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_images (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);

-- ---------------------------------------------------------------------------
-- 5. BOOKINGS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  room_name TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  num_extra_adults INTEGER DEFAULT 0,
  num_children_above_5 INTEGER DEFAULT 0,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  special_requests TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  subtotal_amount NUMERIC(10, 2) DEFAULT 0,
  base_amount NUMERIC(10, 2) DEFAULT 0,
  extra_guests INTEGER DEFAULT 0,
  extra_guests_amount NUMERIC(10, 2) DEFAULT 0,
  extra_guest_price_per_night NUMERIC(10, 2) DEFAULT 0,
  included_capacity INTEGER DEFAULT 0,
  booking_status VARCHAR(20) DEFAULT 'pending'
    CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_gateway VARCHAR(20) DEFAULT 'direct'
    CHECK (payment_gateway IN ('direct', 'razorpay')),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  booking_source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates_valid CHECK (check_out_date > check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 6. BLOCKED DATES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual',
  external_id VARCHAR(255),
  platform_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_blocked_dates_valid CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_room_id ON blocked_dates(room_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_start_date ON blocked_dates(start_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_end_date ON blocked_dates(end_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_source ON blocked_dates(source);

-- ---------------------------------------------------------------------------
-- 7. FACILITIES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_is_active ON facilities(is_active);

-- ---------------------------------------------------------------------------
-- 8. FEATURES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS features (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  icon_class VARCHAR(255),
  image_url TEXT,
  category VARCHAR(100) DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_is_active ON features(is_active);
CREATE INDEX IF NOT EXISTS idx_features_display_order ON features(display_order);

DROP TRIGGER IF EXISTS update_features_updated_at ON features;
CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 9. TESTIMONIALS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'google')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);

-- ---------------------------------------------------------------------------
-- 10. CONTACT MESSAGES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);

-- ---------------------------------------------------------------------------
-- 11. RESORT CLOSURES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resort_closures (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_closure_dates_valid CHECK (end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- 12. CALENDAR / APP SETTINGS (villa details, SMTP, maintenance, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_settings_key ON calendar_settings(setting_key);

DROP TRIGGER IF EXISTS update_calendar_settings_updated_at ON calendar_settings;
CREATE TRIGGER update_calendar_settings_updated_at
  BEFORE UPDATE ON calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 13. SOCIAL MEDIA LINKS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_media_links (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon_class VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 14. ATTRACTIONS (used by the app — not tourist_attractions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attractions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[],
  image_url TEXT,
  distance VARCHAR(100),
  travel_time VARCHAR(100),
  type VARCHAR(100),
  highlights TEXT[],
  best_time VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attractions_is_active ON attractions(is_active);
CREATE INDEX IF NOT EXISTS idx_attractions_display_order ON attractions(display_order);

-- ---------------------------------------------------------------------------
-- 15. HOUSE RULES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS house_rules (
  id SERIAL PRIMARY KEY,
  rule_text TEXT NOT NULL,
  order_num INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_house_rules_is_active ON house_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_house_rules_order_num ON house_rules(order_num);

DROP TRIGGER IF EXISTS update_house_rules_updated_at ON house_rules;
CREATE TRIGGER update_house_rules_updated_at
  BEFORE UPDATE ON house_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 16. FAQS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  order_num INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_order_num ON faqs(order_num);

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 17. WHATSAPP (optional)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20) NOT NULL,
  session_status VARCHAR(20) DEFAULT 'active'
    CHECK (session_status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'file', 'location')),
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('guest', 'admin')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Permissions (required for Supabase anon/authenticated clients)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Disable RLS so the app can read/write via the anon key (matches current app design)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE features DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE resort_closures DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE attractions DISABLE ROW LEVEL SECURITY;
ALTER TABLE house_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED DATA
-- ============================================

-- Admin account (bcrypt hash for password: Admin@123)
INSERT INTO admin (email, password_hash, first_name, last_name, phone, is_active)
VALUES (
  'admin@brickandbeam.com',
  '$2b$10$QHDMK6VP0Xqm59.LBW8Uke/55zDHA.Fekz2.mP2AX76S559sB3RKe',
  'Admin',
  'User',
  '+919876543210',
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_active = TRUE;

INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_admin)
VALUES (
  'admin',
  'admin@brickandbeam.com',
  '$2b$10$QHDMK6VP0Xqm59.LBW8Uke/55zDHA.Fekz2.mP2AX76S559sB3RKe',
  'Admin',
  'User',
  '+919876543210',
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_admin = TRUE,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Villa / room type used for bookings and calendar
INSERT INTO rooms (
  room_number,
  name,
  slug,
  description,
  price_per_night,
  max_occupancy,
  max_capacity,
  quantity,
  amenities,
  image_url,
  images,
  is_active,
  is_available,
  check_in_time,
  check_out_time,
  child_above_5_price,
  extra_guest_price,
  extra_mattress_price
) VALUES (
  'VILLA-01',
  'Brick & Beam Villa',
  'brick-and-beam-villa',
  'A private hill-station villa with valley views, spacious living areas, and modern amenities. Perfect for families and group getaways.',
  15000.00,
  4,
  12,
  1,
  ARRAY['Wi-Fi', 'Air Conditioning', 'Valley View', 'Parking', 'Bonfire Area', 'Indoor Games'],
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  ],
  TRUE,
  TRUE,
  '12:00 PM',
  '10:00 AM',
  1500.00,
  2000.00,
  200.00
)
ON CONFLICT (slug) DO NOTHING;

-- Villa settings (Admin → Profile → Villa Details)
INSERT INTO calendar_settings (setting_key, setting_value, description) VALUES
  ('villa_name', 'Brick & Beam', 'Display name for the villa'),
  ('villa_price', '15000', 'Base nightly price (INR)'),
  ('villa_capacity', '4', 'Guests included in base price'),
  ('villa_max_capacity', '12', 'Maximum guests allowed'),
  ('villa_amenities', E'Private villa with valley views\nWi-Fi and air conditioning\nBonfire and outdoor seating\nIndoor games and recreation area', 'Amenities (one per line)'),
  ('villa_games', E'Carrom\nChess\nBadminton\nBoard games', 'Games (one per line)'),
  ('villa_extra_guest_price', '2000', 'Per-night rate for extra guests above capacity (adults and children)'),
  ('admin_email', 'admin@brickandbeam.com', 'Admin notification email'),
  ('maintenance_mode', 'false', 'When true, homepage shows maintenance page')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- House rules (skip if already seeded)
INSERT INTO house_rules (rule_text, order_num, is_active)
SELECT v.rule_text, v.order_num, v.is_active
FROM (VALUES
  ('Check-in time is 12:00 PM and check-out time is 10:00 AM', 1, TRUE),
  ('Smoking is strictly prohibited inside the villa', 2, TRUE),
  ('Pets are not allowed on the premises', 3, TRUE),
  ('Please maintain silence after 10:00 PM', 4, TRUE),
  ('Guests are responsible for any damage to property', 5, TRUE)
) AS v(rule_text, order_num, is_active)
WHERE NOT EXISTS (SELECT 1 FROM house_rules LIMIT 1);

-- FAQs (skip if already seeded)
INSERT INTO faqs (question, answer, category, order_num, is_active)
SELECT v.question, v.answer, v.category, v.order_num, v.is_active
FROM (VALUES
  ('What are the check-in and check-out times?', 'Check-in is at 12:00 PM and check-out is at 10:00 AM. Early check-in or late check-out may be available on request, subject to availability.', 'Booking', 1, TRUE),
  ('Is parking available?', 'Yes, complimentary parking is available for all guests.', 'Amenities', 2, TRUE),
  ('Do you allow pets?', 'Pets are not allowed to ensure comfort for all guests.', 'Policies', 3, TRUE),
  ('What is your cancellation policy?', 'Cancellations made 7 days or more before check-in receive a full refund. Cancellations within 7 days may be subject to a fee.', 'Policies', 4, TRUE),
  ('Is WiFi available?', 'Yes, complimentary high-speed WiFi is available throughout the property.', 'Amenities', 5, TRUE)
) AS v(question, answer, category, order_num, is_active)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);

-- Features (skip if already seeded)
INSERT INTO features (title, description, icon, category, display_order, is_active)
SELECT v.title, v.description, v.icon, v.category, v.display_order, v.is_active
FROM (VALUES
  ('Valley View', 'Panoramic views of the surrounding hills and valleys', 'MapPinIcon', 'location', 1, TRUE),
  ('Private Villa', 'Exclusive use of the entire villa for your group', 'HomeIcon', 'general', 2, TRUE),
  ('Bonfire Area', 'Evening bonfire arrangements on request', 'SparklesIcon', 'Recreation', 3, TRUE),
  ('Indoor Games', 'Carrom, chess, and board games for all ages', 'UserGroupIcon', 'Activities', 4, TRUE),
  ('Free Parking', 'Secure on-site parking for guests', 'TruckIcon', 'Convenience', 5, TRUE),
  ('High-Speed WiFi', 'Reliable internet throughout the property', 'WifiIcon', 'Connectivity', 6, TRUE)
) AS v(title, description, icon, category, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM features LIMIT 1);

-- Testimonials (skip if already seeded)
INSERT INTO testimonials (guest_name, rating, comment, is_featured, is_active, source)
SELECT v.guest_name, v.rating, v.comment, v.is_featured, v.is_active, v.source
FROM (VALUES
  ('Priya Sharma', 5, 'A beautiful villa with stunning views. Our family had an amazing weekend getaway!', TRUE, TRUE, 'website'),
  ('Rahul Mehta', 5, 'Clean, spacious, and well maintained. The bonfire evening was the highlight of our trip.', TRUE, TRUE, 'website'),
  ('Anita Desai', 4, 'Great location and friendly staff. Would definitely recommend Brick & Beam.', FALSE, TRUE, 'website')
) AS v(guest_name, rating, comment, is_featured, is_active, source)
WHERE NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1);

-- Facilities (skip if already seeded)
INSERT INTO facilities (name, description, is_active)
SELECT v.name, v.description, v.is_active
FROM (VALUES
  ('Swimming Pool', 'Scenic pool with valley views', TRUE),
  ('Restaurant', 'Pure vegetarian meals available on request', TRUE),
  ('Garden & Lawn', 'Outdoor spaces for relaxation and events', TRUE)
) AS v(name, description, is_active)
WHERE NOT EXISTS (SELECT 1 FROM facilities LIMIT 1);

-- Social media (skip if already seeded — update URLs in admin panel)
INSERT INTO social_media_links (platform, url, icon_class, is_active, display_order)
SELECT v.platform, v.url, v.icon_class, v.is_active, v.display_order
FROM (VALUES
  ('Instagram', 'https://instagram.com/', 'instagram', TRUE, 1),
  ('Facebook', 'https://facebook.com/', 'facebook', TRUE, 2),
  ('WhatsApp', 'https://wa.me/919876543210', 'whatsapp', TRUE, 3)
) AS v(platform, url, icon_class, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM social_media_links LIMIT 1);

-- Nearby attractions (skip if already seeded)
INSERT INTO attractions (
  name, description, images, distance, travel_time, type, highlights, best_time, category, is_active, is_featured, display_order
)
SELECT
  v.name, v.description, v.images, v.distance, v.travel_time, v.type,
  v.highlights, v.best_time, v.category, v.is_active, v.is_featured, v.display_order
FROM (VALUES
  (
    'Mapro Garden',
    'Famous strawberry garden with a food court, chocolate factory, and play area for children.',
    ARRAY['https://images.unsplash.com/photo-1464226184884-fa280b87f399?auto=format&fit=crop&w=800&q=80']::TEXT[],
    '8 km',
    '20 minutes',
    'Garden',
    ARRAY['Strawberry products', 'Food court', 'Kids play area']::TEXT[],
    'October to March',
    'Nature',
    TRUE,
    TRUE,
    1
  ),
  (
    'Venna Lake',
    'A scenic lake perfect for boating, horse riding, and evening walks.',
    ARRAY['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80']::TEXT[],
    '12 km',
    '30 minutes',
    'Lake',
    ARRAY['Boating', 'Horse riding', 'Sunset views']::TEXT[],
    'Year round',
    'Nature',
    TRUE,
    TRUE,
    2
  ),
  (
    'Pratapgad Fort',
    'Historic hill fort associated with Chhatrapati Shivaji Maharaj, offering panoramic views.',
    ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80']::TEXT[],
    '24 km',
    '50 minutes',
    'Fort',
    ARRAY['History', 'Trekking', 'Mountain views']::TEXT[],
    'Winter months',
    'Heritage',
    TRUE,
    FALSE,
    3
  )
) AS v(
  name, description, images, distance, travel_time, type,
  highlights, best_time, category, is_active, is_featured, display_order
)
WHERE NOT EXISTS (SELECT 1 FROM attractions LIMIT 1);

COMMIT;

-- ---------------------------------------------------------------------------
-- Verification queries (run after COMMIT)
-- ---------------------------------------------------------------------------
SELECT 'admin' AS table_name, COUNT(*) AS rows FROM admin
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'calendar_settings', COUNT(*) FROM calendar_settings
UNION ALL SELECT 'house_rules', COUNT(*) FROM house_rules
UNION ALL SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL SELECT 'features', COUNT(*) FROM features
UNION ALL SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL SELECT 'attractions', COUNT(*) FROM attractions
ORDER BY table_name;
