-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_features_is_active ON public.features(is_active);
CREATE INDEX IF NOT EXISTS idx_features_display_order ON public.features(display_order);

-- Enable Row Level Security
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.features
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON public.features
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON public.features
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON public.features
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert sample features data
INSERT INTO public.features (title, description, icon, is_active, display_order) VALUES
('Free Wi-Fi', 'High-speed internet access throughout the property', 'wifi', true, 1),
('Swimming Pool', 'Outdoor swimming pool with mountain views', 'swimming', true, 2),
('Restaurant', 'Multi-cuisine restaurant serving delicious local and international dishes', 'restaurant', true, 3),
('Room Service', '24/7 room service for your convenience', 'room-service', true, 4),
('Parking', 'Free parking space for all guests', 'parking', true, 5),
('Garden', 'Beautiful landscaped gardens perfect for relaxation', 'garden', true, 6),
('Kids Play Area', 'Safe and fun play area for children', 'playground', true, 7),
('Bonfire', 'Evening bonfire arrangements on request', 'fire', true, 8),
('Indoor Games', 'Carrom, chess, and other indoor games available', 'games', true, 9),
('Conference Hall', 'Well-equipped conference hall for meetings and events', 'conference', true, 10),
('Laundry Service', 'Professional laundry and dry cleaning services', 'laundry', true, 11),
('Doctor on Call', 'Medical assistance available 24/7', 'medical', true, 12);

COMMENT ON TABLE public.features IS 'Resort features and amenities';
