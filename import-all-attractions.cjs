require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function importAttractions() {
  console.log('🚀 Importing 20 attractions to database...\n')
  
  // Delete existing data
  console.log('🗑️  Clearing existing data...')
  await supabase.from('attractions').delete().neq('id', 0)
  console.log('✅ Cleared\n')
  
  console.log('📝 Inserting attractions...')
  
  // Import in batches to avoid issues
  const batch1 = [
    { name: 'Pratapgad Fort', description: 'Historic fort built by Chhatrapati Shivaji Maharaj, offering panoramic views of the Sahyadri mountains.', distance: '24 km', category: 'fort', is_active: true },
    { name: 'Venna Lake', description: 'Beautiful man-made lake perfect for boating and enjoying scenic views.', distance: '12 km', category: 'viewpoint', is_active: true },
    { name: 'Mapro Garden', description: 'Famous strawberry garden and food park offering delicious local treats.', distance: '8 km', category: 'park', is_active: true },
    { name: 'Lingmala Waterfall', description: 'Stunning waterfall cascading down from a height of 600 feet.', distance: '18 km', category: 'viewpoint', is_active: true },
    { name: "Elephant's Head Point", description: "Famous viewpoint shaped like an elephant's head and trunk.", distance: '10 km', category: 'viewpoint', is_active: true }
  ]
  
  const { error: e1 } = await supabase.from('attractions').insert(batch1)
  if (e1) console.error('Error batch 1:', e1.message)
  else console.log('✅ Batch 1 done (5 attractions)')
  
  const batch2 = [
    { name: "Kate's Point", description: 'Scenic viewpoint offering spectacular views of the Krishna Valley and Dhom Dam.', distance: '11 km', category: 'viewpoint', is_active: true },
    { name: "Arthur's Seat", description: 'One of the highest points in Mahabaleshwar, offering stunning views.', distance: '13 km', category: 'viewpoint', is_active: true },
    { name: 'Panchgani', description: 'Beautiful hill station famous for its strawberry farms and scenic viewpoints.', distance: '20 km', category: 'viewpoint', is_active: true },
    { name: 'Mahabaleshwar Temple', description: 'Ancient temple dedicated to Lord Shiva, one of the most sacred places.', distance: '14 km', category: 'temple', is_active: true },
    { name: 'Connaught Peak', description: 'Second highest point in Mahabaleshwar offering panoramic views.', distance: '15 km', category: 'viewpoint', is_active: true }
  ]
  
  const { error: e2 } = await supabase.from('attractions').insert(batch2)
  if (e2) console.error('Error batch 2:', e2.message)
  else console.log('✅ Batch 2 done (10 attractions total)')
  
  const batch3 = [
    { name: 'Bombay Point', description: 'Popular sunset point offering spectacular views of the surrounding valleys.', distance: '12 km', category: 'viewpoint', is_active: true },
    { name: 'Wilson Point', description: 'Highest point in Mahabaleshwar, also known as Sunrise Point.', distance: '16 km', category: 'viewpoint', is_active: true },
    { name: 'Table Land', description: 'Largest volcanic plateau in Asia, located in Panchgani.', distance: '22 km', category: 'viewpoint', is_active: true },
    { name: 'Rajpuri Caves', description: 'Ancient caves with natural water pools believed to have religious significance.', distance: '26 km', category: 'viewpoint', is_active: true },
    { name: 'Tapola (Mini Kashmir)', description: 'Beautiful village located near the Koyna Dam, often called Mini Kashmir.', distance: '30 km', category: 'viewpoint', is_active: true }
  ]
  
  const { error: e3 } = await supabase.from('attractions').insert(batch3)
  if (e3) console.error('Error batch 3:', e3.message)
  else console.log('✅ Batch 3 done (15 attractions total)')
  
  const batch4 = [
    { name: "Chinaman's Falls", description: 'Beautiful waterfall cascading through dense forests.', distance: '19 km', category: 'viewpoint', is_active: true },
    { name: 'Dhobi Waterfall', description: 'Picturesque waterfall surrounded by lush greenery.', distance: '17 km', category: 'viewpoint', is_active: true },
    { name: 'Lodwick Point', description: 'Scenic viewpoint named after General Lodwick.', distance: '13 km', category: 'viewpoint', is_active: true },
    { name: 'Needle Hole Point', description: 'Unique viewpoint featuring a natural rock formation with a hole.', distance: '11 km', category: 'viewpoint', is_active: true },
    { name: 'Sunset Point', description: 'Popular sunset viewing spot offering breathtaking views.', distance: '12 km', category: 'viewpoint', is_active: true }
  ]
  
  const { error: e4 } = await supabase.from('attractions').insert(batch4)
  if (e4) console.error('Error batch 4:', e4.message)
  else console.log('✅ Batch 4 done (20 attractions total)')
  
  console.log('\n🎉 Migration complete! All 20 attractions imported.')
  console.log('📱 Refresh your admin panel to see them.')
}

importAttractions()
