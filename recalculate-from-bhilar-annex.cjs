require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Recalculated from Bhilar Annex (21 km from Mahabaleshwar center)
const accurateUpdates = [
  { name: 'Pratapgad Fort', distance: '45 km', travel_time: '1 hour 30 minutes', best_time: 'October to March (avoid monsoon)' },
  { name: 'Venna Lake', distance: '23 km', travel_time: '40 minutes', best_time: 'Year Round (best October to May)' },
  { name: 'Mapro Garden', distance: '26 km', travel_time: '45 minutes', best_time: 'October to May (strawberry season Dec-Mar)' },
  { name: 'Lingmala Waterfall', distance: '29 km', travel_time: '50 minutes', best_time: 'July to September (monsoon)' },
  { name: "Elephant's Head Point", distance: '25 km', travel_time: '45 minutes', best_time: 'October to May (sunrise/sunset)' },
  { name: "Kate's Point", distance: '24 km', travel_time: '42 minutes', best_time: 'October to May (valley views)' },
  { name: "Arthur's Seat", distance: '27 km', travel_time: '48 minutes', best_time: 'October to May (sunrise)' },
  { name: 'Panchgani', distance: '18 km', travel_time: '30 minutes', best_time: 'Year Round (best Oct-May)' },
  { name: 'Mahabaleshwar Temple', distance: '22 km', travel_time: '38 minutes', best_time: 'Year Round' },
  { name: 'Connaught Peak', distance: '28 km', travel_time: '50 minutes', best_time: 'October to May (sunrise/sunset)' },
  { name: 'Bombay Point', distance: '25 km', travel_time: '45 minutes', best_time: 'October to May (sunset)' },
  { name: 'Wilson Point', distance: '30 km', travel_time: '55 minutes', best_time: 'October to May (sunrise, highest point)' },
  { name: 'Table Land', distance: '20 km', travel_time: '35 minutes', best_time: 'Year Round (best Oct-May)' },
  { name: 'Rajpuri Caves', distance: '43 km', travel_time: '1 hour 15 minutes', best_time: 'October to March' },
  { name: 'Tapola (Mini Kashmir)', distance: '53 km', travel_time: '1 hour 35 minutes', best_time: 'October to May (water sports)' },
  { name: "Chinaman's Falls", distance: '32 km', travel_time: '55 minutes', best_time: 'July to September (monsoon)' },
  { name: 'Dhobi Waterfall', distance: '30 km', travel_time: '52 minutes', best_time: 'July to September (monsoon)' },
  { name: 'Lodwick Point', distance: '26 km', travel_time: '46 minutes', best_time: 'October to May (valley views)' },
  { name: 'Needle Hole Point', distance: '24 km', travel_time: '42 minutes', best_time: 'October to May (photography)' },
  { name: 'Sunset Point', distance: '25 km', travel_time: '45 minutes', best_time: 'October to May (sunset)' }
]

async function recalculate() {
  console.log('🔄 Recalculating from Bhilar Annex location...\n')
  
  for (const update of accurateUpdates) {
    const { error } = await supabase
      .from('attractions')
      .update({
        distance: update.distance,
        travel_time: update.travel_time,
        best_time: update.best_time
      })
      .eq('name', update.name)
    
    if (error) {
      console.error(`❌ ${update.name}:`, error.message)
    } else {
      console.log(`✅ ${update.name} - ${update.distance} (${update.travel_time})`)
    }
  }
  
  console.log('\n🎉 All distances recalculated from Bhilar Annex!')
  console.log('📱 Refresh to see accurate distances.')
}

recalculate()
