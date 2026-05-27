-- ============================================
-- Create Missing Tables for Resort Booking System
-- ============================================
-- Run this in Supabase SQL Editor to create missing tables
-- ============================================

-- ============================================
-- HOUSE RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS house_rules (
    id SERIAL PRIMARY KEY,
    rule_text TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for house_rules
CREATE INDEX IF NOT EXISTS idx_house_rules_is_active ON house_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_house_rules_order_num ON house_rules(order_num);

-- Add comments
COMMENT ON TABLE house_rules IS 'House rules displayed to guests';
COMMENT ON COLUMN house_rules.rule_text IS 'The text of the house rule';
COMMENT ON COLUMN house_rules.order_num IS 'Display order (lower numbers appear first)';

-- ============================================
-- FAQ TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faqs
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_order_num ON faqs(order_num);

-- Add comments
COMMENT ON TABLE faqs IS 'Frequently asked questions';
COMMENT ON COLUMN faqs.category IS 'Category for grouping FAQs (e.g., Booking, Amenities, Policies)';

-- ============================================
-- FEATURES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_class VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for features
CREATE INDEX IF NOT EXISTS idx_features_is_active ON features(is_active);
CREATE INDEX IF NOT EXISTS idx_features_display_order ON features(display_order);

-- Add comments
COMMENT ON TABLE features IS 'Resort features and highlights';

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create or replace the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for house_rules
DROP TRIGGER IF EXISTS update_house_rules_updated_at ON house_rules;
CREATE TRIGGER update_house_rules_updated_at
    BEFORE UPDATE ON house_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for faqs
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample house rules
INSERT INTO house_rules (rule_text, order_num, is_active) VALUES
('Check-in time is 2:00 PM and check-out time is 10:00 AM', 1, true),
('Smoking is strictly prohibited inside the rooms', 2, true),
('Pets are not allowed on the premises', 3, true),
('Please maintain silence after 10:00 PM', 4, true),
('Guests are responsible for any damage to property', 5, true)
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, order_num, is_active) VALUES
('What are the check-in and check-out times?', 'Check-in is at 2:00 PM and check-out is at 10:00 AM. Early check-in or late check-out may be available upon request, subject to availability.', 'Booking', 1, true),
('Is parking available?', 'Yes, we provide complimentary parking for all our guests.', 'Amenities', 2, true),
('Do you allow pets?', 'Unfortunately, we do not allow pets on the premises to ensure the comfort of all our guests.', 'Policies', 3, true),
('What is your cancellation policy?', 'Cancellations made 7 days or more before check-in receive a full refund. Cancellations within 7 days are subject to a cancellation fee.', 'Policies', 4, true),
('Is WiFi available?', 'Yes, complimentary high-speed WiFi is available throughout the property.', 'Amenities', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY TABLES CREATED
-- ============================================
SELECT 'house_rules table created' as status, COUNT(*) as row_count FROM house_rules
UNION ALL
SELECT 'faqs table created' as status, COUNT(*) as row_count FROM faqs
UNION ALL
SELECT 'features table exists' as status, COUNT(*) as row_count FROM features;
