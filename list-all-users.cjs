require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listUsers() {
  console.log('📋 Listing all users in database...\n')
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  if (!users || users.length === 0) {
    console.log('❌ No users found in database')
    return
  }
  
  console.log(`Found ${users.length} user(s):\n`)
  users.forEach((user, i) => {
    console.log(`--- User ${i + 1} ---`)
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Username:', user.username)
    console.log('is_admin:', user.is_admin)
    console.log('password_hash:', user.password_hash ? 'EXISTS' : 'MISSING')
    console.log('')
  })
}

listUsers()
