-- ============================================
-- Complete Database Schema for Resort Booking System
-- ============================================
-- This file contains the complete database schema
-- Run this in Supabase SQL Editor to create all tables
-- ============================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- ============================================
-- 2. ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug TEXT UNIQUE,
    description TEXT NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    max_occupancy INTEGER NOT NULL DEFAULT 2,
    amenities TEXT[], -- Array of amenities
    image_url TEXT,
    images TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    extra_guest_price NUMERIC(10, 2), -- Deprecated, kept for backward compatibility
    accommodation_details TEXT,
    floor INTEGER,
    check_in_time TEXT, -- e.g., '14:00' or '2:00 PM'
    check_out_time TEXT, -- e.g., '10:00 AM'
    -- Occupancy-based pricing
    price_double_occupancy NUMERIC(10, 2), -- Price for 2 guests
    price_triple_occupancy NUMERIC(10, 2), -- Price for 3 guests
    price_four_occupancy NUMERIC(10, 2), -- Price for 4 guests
    extra_mattress_price NUMERIC(10, 2) DEFAULT 200, -- Price per extra mattress
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rooms
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON rooms(room_number);

-- Add comments for documentation
COMMENT ON COLUMN rooms.price_double_occupancy IS 'Price per night for 2 guests (double occupancy)';
COMMENT ON COLUMN rooms.price_triple_occupancy IS 'Price per night for 3 guests (triple occupancy)';
COMMENT ON COLUMN rooms.price_four_occupancy IS 'Price per night for 4 guests (four person occupancy)';
COMMENT ON COLUMN rooms.extra_mattress_price IS 'Price per extra mattress per night (default: ₹200)';

-- ============================================
-- 3. ROOM IMAGES TABLE (Optional - for separate image management)
-- ============================================
CREATE TABLE IF NOT EXISTS room_images (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for room_images
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);
CREATE INDEX IF NOT EXISTS idx_room_images_is_primary ON room_images(is_primary);

-- ============================================
-- 4. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INTEGER NOT NULL DEFAULT 1,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_gateway VARCHAR(20) DEFAULT 'direct' CHECK (payment_gateway IN ('direct', 'razorpay')),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    booking_source VARCHAR(50) DEFAULT 'website', -- 'website', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure check-out is after check-in
    CONSTRAINT check_dates_valid CHECK (check_out_date > check_in_date)
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_source ON bookings(booking_source);
CREATE INDEX IF NOT EXISTS idx_bookings_razorpay_order_id ON bookings(razorpay_order_id);

-- ============================================
-- 5. BLOCKED DATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', etc.
    external_id VARCHAR(255), -- External reference ID
    platform_data JSONB, -- Additional metadata from source platform
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure end_date is after start_date
    CONSTRAINT check_blocked_dates_valid CHECK (end_date >= start_date)
);

-- Indexes for blocked_dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_room_id ON blocked_dates(room_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_start_date ON blocked_dates(start_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_end_date ON blocked_dates(end_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_source ON blocked_dates(source);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_external_id ON blocked_dates(external_id);

-- Add comments
COMMENT ON COLUMN blocked_dates.source IS 'Source of the blocked date: manual (admin panel), etc.';
COMMENT ON COLUMN blocked_dates.external_id IS 'External reference ID from the source platform';
COMMENT ON COLUMN blocked_dates.platform_data IS 'Additional metadata from the source platform (JSON format)';

-- ============================================
-- 6. FACILITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for facilities
CREATE INDEX IF NOT EXISTS idx_facilities_is_active ON facilities(is_active);

-- ============================================
-- 7. TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'google')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

-- ============================================
-- 8. CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- ============================================
-- 9. RESORT CLOSURES TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS resort_closures (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_closure_dates_valid CHECK (end_date >= start_date)
);

-- Indexes for resort_closures
CREATE INDEX IF NOT EXISTS idx_resort_closures_start_date ON resort_closures(start_date);
CREATE INDEX IF NOT EXISTS idx_resort_closures_end_date ON resort_closures(end_date);
CREATE INDEX IF NOT EXISTS idx_resort_closures_is_active ON resort_closures(is_active);

-- ============================================
-- 10. CALENDAR SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for calendar_settings
CREATE INDEX IF NOT EXISTS idx_calendar_settings_key ON calendar_settings(setting_key);

-- ============================================
-- 11. SOCIAL MEDIA LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_media_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icon_class VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for social_media_links
CREATE INDEX IF NOT EXISTS idx_social_media_links_is_active ON social_media_links(is_active);
CREATE INDEX IF NOT EXISTS idx_social_media_links_display_order ON social_media_links(display_order);

-- ============================================
-- 12. TOURIST ATTRACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tourist_attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    location VARCHAR(255) NOT NULL,
    distance_from_resort NUMERIC(5, 2), -- Distance in km
    estimated_time VARCHAR(50), -- e.g., '30 minutes', '1 hour'
    category VARCHAR(100),
    rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5),
    google_maps_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tourist_attractions
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_is_featured ON tourist_attractions(is_featured);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_is_active ON tourist_attractions(is_active);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_category ON tourist_attractions(category);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_display_order ON tourist_attractions(display_order);

-- ============================================
-- 13. WHATSAPP SESSIONS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20) NOT NULL,
    session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for whatsapp_sessions
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_guest_phone ON whatsapp_sessions(guest_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_status ON whatsapp_sessions(session_status);

-- ============================================
-- 14. WHATSAPP MESSAGES TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location')),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('guest', 'admin')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for whatsapp_messages
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_id ON whatsapp_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_is_read ON whatsapp_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp for bookings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp for calendar_settings
CREATE TRIGGER update_calendar_settings_updated_at
    BEFORE UPDATE ON calendar_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on tables (optional - uncomment if you want to use RLS)

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed):
-- CREATE POLICY "Users can view their own data" ON users
--     FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Public can view active rooms" ON rooms
--     FOR SELECT USING (is_active = true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a default admin user (change password after first login)
-- Note: This is just an example. In production, use proper password hashing
-- INSERT INTO users (username, email, first_name, last_name, is_admin)
-- VALUES ('admin', 'admin@resort.com', 'Admin', 'User', true)
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================
