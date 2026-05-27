-- ============================================
-- Create Admin Account for Resort Booking System
-- ============================================
-- Run this in Supabase SQL Editor to create the default admin account
-- ============================================

-- Default Admin Credentials:
-- Email: admin@resortbookingsystem.com
-- Password: Admin@123

-- ============================================
-- Step 1: Add password_hash column to users table (if not exists)
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ============================================
-- Step 2: Generate Password Hash
-- ============================================
-- Password: Admin@123
-- 
-- To generate the bcrypt hash, run:
--   node generate-admin-password.js
-- 
-- Or use online tool: https://bcrypt-generator.com/
-- Or use Node.js one-liner:
--   node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123', 10))"
--
-- Then replace the hash below with the generated one.

-- ============================================
-- Step 3: Create Admin User with Hashed Password
-- ============================================
-- Default credentials:
-- Email: admin@resortbookingsystem.com
-- Password: Admin@123

-- Insert or update admin user
-- IMPORTANT: Replace the password_hash below with the hash generated from Step 2
INSERT INTO users (
    username,
    email,
    first_name,
    last_name,
    phone,
    is_admin,
    password_hash,
    created_at
) VALUES (
    'admin',
    'admin@resortbookingsystem.com',
    'Admin',
    'User',
    NULL,
    true,
    '$2b$10$QHDMK6VP0Xqm59.LBW8Uke/55zDHA.Fekz2.mP2AX76S559sB3RKe', -- Bcrypt hash for 'Admin@123'
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
    is_admin = true,
    first_name = 'Admin',
    last_name = 'User',
    password_hash = '$2b$10$QHDMK6VP0Xqm59.LBW8Uke/55zDHA.Fekz2.mP2AX76S559sB3RKe'; -- Bcrypt hash for 'Admin@123'

-- ============================================
-- Step 3: Verify Admin Account Created
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
    END as password_status,
    created_at
FROM users
WHERE email = 'admin@resortbookingsystem.com'
AND is_admin = true;
