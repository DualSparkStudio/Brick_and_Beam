require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testStructure() {
  console.log('🔍 Testing attractions data structure...\n')
  
  const { data, error } = await supabase
    .from('attractions')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  if (data && data.length > 0) {
    const attraction = data[0]
    console.log('✅ Sample attraction:')
    console.log('ID:', attraction.id, typeof attraction.id)
    console.log('Name:', attraction.name)
    console.log('Images:', Array.isArray(attraction.images) ? `Array with ${attraction.images.length} items` : 'Not an array')
    console.log('Highlights:', Array.isArray(attraction.highlights) ? `Array with ${attraction.highlights.length} items` : 'Not an array')
    console.log('Distance:', attraction.distance)
    console.log('Travel time:', attraction.travel_time)
    console.log('Best time:', attraction.best_time)
    console.log('\nFull object:')
    console.log(JSON.stringify(attraction, null, 2))
  }
}

testStructure()
