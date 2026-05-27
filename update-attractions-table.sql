-- Add missing columns to attractions table
ALTER TABLE public.attractions 
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS travel_time VARCHAR(100),
ADD COLUMN IF NOT EXISTS highlights TEXT[],
ADD COLUMN IF NOT EXISTS best_time VARCHAR(100);

-- Update existing records to use images array instead of single image_url
UPDATE public.attractions 
SET images = ARRAY[image_url]::TEXT[]
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

COMMENT ON COLUMN public.attractions.images IS 'Array of image URLs for the attraction';
COMMENT ON COLUMN public.attractions.travel_time IS 'Estimated travel time from resort';
COMMENT ON COLUMN public.attractions.highlights IS 'Array of highlight features';
COMMENT ON COLUMN public.attractions.best_time IS 'Best time to visit';
