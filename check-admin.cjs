require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdmin() {
  try {
    const email = 'admin@resortbookingsystem.com'
    
    console.log('🔍 Checking admin user in users table...')
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log(`\n✅ Found ${users.length} user(s) with email ${email}:`)
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      console.log(`\n--- User ${i + 1} ---`)
      console.log('   ID:', user.id)
      console.log('   Email:', user.email)
      console.log('   Username:', user.username)
      console.log('   is_admin:', user.is_admin)
      console.log('   password_hash:', user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'MISSING')
      
      if (!user.is_admin) {
        console.log('   ⚠️  WARNING: is_admin is FALSE! Fixing...')
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('   ❌ Failed to update:', updateError.message)
        } else {
          console.log('   ✅ is_admin set to TRUE')
        }
      }
      
      if (!user.password_hash) {
        console.log('   ⚠️  WARNING: password_hash is MISSING!')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkAdmin()
