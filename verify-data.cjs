require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('🔍 Verifying data in Supabase...\n')
  
  const { data, error } = await supabase
    .from('attractions')
    .select('id, name, distance, travel_time, images')
    .order('id')
    .limit(5)
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log('📊 First 5 attractions in database:\n')
  data.forEach(attr => {
    console.log(`${attr.name}`)
    console.log(`  Distance: ${attr.distance}`)
    console.log(`  Travel time: ${attr.travel_time}`)
    console.log(`  Images: ${attr.images ? attr.images.length : 0} images`)
    console.log('')
  })
}

verify()
