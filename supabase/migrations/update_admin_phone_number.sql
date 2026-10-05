-- Update default admin phone number and WhatsApp social media link
UPDATE users
SET phone = '+919820466567'
WHERE is_admin = TRUE AND (phone IS NULL OR phone = '' OR phone LIKE '%9876543210%' OR phone LIKE '%1234567890%');

UPDATE admin
SET phone = '+919820466567'
WHERE phone IS NULL OR phone = '' OR phone LIKE '%9876543210%' OR phone LIKE '%1234567890%';

UPDATE social_media_links
SET url = 'https://wa.me/919820466567'
WHERE platform ILIKE 'WhatsApp' AND url LIKE '%9876543210%';
