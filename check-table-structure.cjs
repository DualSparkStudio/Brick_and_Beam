require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStructure() {
  console.log('🔍 Checking attractions table structure...\n')
  
  const { data, error } = await supabase
    .from('attractions')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  if (data && data.length > 0) {
    console.log('📋 Table columns:')
    console.log(Object.keys(data[0]))
    console.log('\n📄 Sample record:')
    console.log(JSON.stringify(data[0], null, 2))
  }
}

checkStructure()
