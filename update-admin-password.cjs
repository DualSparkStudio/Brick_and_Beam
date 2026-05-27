require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateAdminPassword() {
  try {
    const email = 'admin@resortbookingsystem.com'
    const password = 'Admin@123'
    
    console.log('🔐 Generating password hash...')
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('✅ Hash generated:', passwordHash)
    
    // Check if admin exists in admin table
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .single()
    
    if (adminData) {
      console.log('📝 Updating admin table...')
      const { error: updateError } = await supabase
        .from('admin')
        .update({ password_hash: passwordHash })
        .eq('email', email)
      
      if (updateError) {
        console.error('❌ Error updating admin table:', updateError.message)
      } else {
        console.log('✅ Admin password updated in admin table')
      }
    }
    
    // Also check users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (userData) {
      console.log('📝 Updating users table...')
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('email', email)
      
      if (updateError) {
        console.error('❌ Error updating users table:', updateError.message)
      } else {
        console.log('✅ Admin password updated in users table')
      }
    }
    
    if (!adminData && !userData) {
      console.log('❌ Admin user not found in either table')
      console.log('Creating admin in users table...')
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          email: email,
          username: 'admin',
          password_hash: passwordHash,
          first_name: 'Admin',
          last_name: 'User',
          is_admin: true
        }])
      
      if (insertError) {
        console.error('❌ Error creating admin:', insertError.message)
      } else {
        console.log('✅ Admin user created successfully')
      }
    }
    
    console.log('\n✅ Done! You can now login with:')
    console.log('   Email: admin@resortbookingsystem.com')
    console.log('   Password: Admin@123')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

updateAdminPassword()
