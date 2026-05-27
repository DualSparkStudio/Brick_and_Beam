require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPassword() {
  try {
    const email = 'admin@grandvalley.com'
    const password = 'Admin@123'
    
    console.log('🔐 Generating bcrypt hash for password: Admin@123')
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('✅ Hash generated:', passwordHash)
    
    console.log('\n📝 Updating password in database...')
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email)
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    console.log('✅ Password updated successfully!')
    console.log('\n🎉 You can now login with:')
    console.log('   Email: admin@grandvalley.com')
    console.log('   Password: Admin@123')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixPassword()
