-- Replace stock placeholder villa images with Brick & Beam site photos
UPDATE rooms
SET
  image_url = '/images/hero/cover-dusk.png',
  images = ARRAY[
    '/images/hero/cover-dusk.png',
    '/images/hero/pool-facade-day.png',
    '/images/hero/facade-dusk.png',
    '/images/hero/facade-day.png',
    '/images/gallery/pool-area.png'
  ]::TEXT[]
WHERE image_url ILIKE '%images.unsplash.com%'
   OR EXISTS (
     SELECT 1 FROM unnest(COALESCE(images, ARRAY[]::TEXT[])) AS img
     WHERE img ILIKE '%images.unsplash.com%'
   );
