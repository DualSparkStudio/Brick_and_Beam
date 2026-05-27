require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAttractions() {
  console.log('🔍 Fetching all attractions from database...\n')
  
  const { data, error } = await supabase
    .from('attractions')
    .select('*')
    .order('id')
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('❌ No attractions found')
    return
  }
  
  console.log(`✅ Found ${data.length} attractions:\n`)
  data.forEach((attr, i) => {
    console.log(`${i + 1}. ${attr.name}`)
    console.log(`   Distance: ${attr.distance || 'N/A'}`)
    console.log(`   Category: ${attr.category || 'N/A'}`)
    console.log(`   Active: ${attr.is_active}`)
    console.log(`   Image: ${attr.image_url ? 'Yes' : 'No'}`)
    console.log('')
  })
}

listAttractions()
