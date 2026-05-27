require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFeatures() {
  console.log('🔍 Checking features table...\n')
  
  const { data, error } = await supabase
    .from('features')
    .select('*')
  
  if (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📝 Features table does not exist or has issues.')
    return
  }
  
  if (!data || data.length === 0) {
    console.log('❌ Features table is empty')
    console.log('📝 Need to add features data')
    return
  }
  
  console.log(`✅ Found ${data.length} features:\n`)
  data.forEach((feature, i) => {
    console.log(`${i + 1}. ${feature.title}`)
    console.log(`   Icon: ${feature.icon || 'N/A'}`)
    console.log(`   Active: ${feature.is_active}`)
    console.log('')
  })
}

checkFeatures()
