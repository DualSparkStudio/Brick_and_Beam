-- ============================================
-- Reset password for dualsparkstudio@gmail.com
-- ============================================
-- Run this in Supabase → SQL Editor
--
-- New password (plaintext): BrickBeam@2026
-- Change it after first login.
--
-- To use a different password, generate a bcrypt hash:
--   node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_PASSWORD', 10))"
-- Then replace NEW_PASSWORD_HASH below.
-- ============================================

-- Ensure password_hash exists on users (admin login fallback)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Bcrypt hash for: BrickBeam@2026
-- Generated with: bcrypt.hashSync('BrickBeam@2026', 10)

-- ============================================
-- Update users table
-- ============================================
UPDATE users
SET
  password_hash = '$2b$10$E8OLJty9QMMPzZaordFNZO3JsJa5D1RmPh3vhHUlK.ci13bhQO0uK',
  is_admin = true
WHERE email = 'dualsparkstudio@gmail.com';

-- ============================================
-- Update admin table (if your project uses it for login)
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'admin'
  ) THEN
    UPDATE admin
    SET
      password_hash = '$2b$10$E8OLJty9QMMPzZaordFNZO3JsJa5D1RmPh3vhHUlK.ci13bhQO0uK',
      is_active = true
    WHERE email = 'dualsparkstudio@gmail.com';
  END IF;
END $$;

-- ============================================
-- Verify
-- ============================================
SELECT
  id,
  username,
  email,
  first_name,
  last_name,
  is_admin,
  CASE
    WHEN password_hash IS NOT NULL THEN 'Password set ✓'
    ELSE 'Password not set ✗'
  END AS password_status,
  created_at
FROM users
WHERE email = 'dualsparkstudio@gmail.com';

-- If admin table exists, show that row too
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'admin'
  ) THEN
    RAISE NOTICE 'Check admin table in a separate query: SELECT id, email, is_active FROM admin WHERE email = ''dualsparkstudio@gmail.com'';';
  END IF;
END $$;
