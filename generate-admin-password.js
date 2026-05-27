// Generate Admin Password Hash
// Run this script to generate the bcrypt hash for admin password
// Usage: node generate-admin-password.js

import bcrypt from 'bcryptjs';

const password = 'Admin@123';
const saltRounds = 10;

// Generate hash
const hash = bcrypt.hashSync(password, saltRounds);

console.log('==========================================');
console.log('Admin Password Hash Generator');
console.log('==========================================');
console.log('');
console.log('Password:', password);
console.log('Bcrypt Hash:', hash);
console.log('');
console.log('Copy this hash and use it in create_admin_account.sql');
console.log('==========================================');
