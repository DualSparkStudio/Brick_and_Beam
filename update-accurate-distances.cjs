require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Accurate distances from resort location
const updates = [
  { name: 'Pratapgad Fort', distance: '35 km', travel_time: '1 hour 15 minutes', best_time: 'October to March (avoid monsoon for trekking)' },
  { name: 'Venna Lake', distance: '12 km', travel_time: '25 minutes', best_time: 'Year Round (best October to May)' },
  { name: 'Mapro Garden', distance: '15 km', travel_time: '30 minutes', best_time: 'October to May (strawberry season December to March)' },
  { name: 'Lingmala Waterfall', distance: '18 km', travel_time: '35 minutes', best_time: 'July to September (monsoon for full flow)' },
  { name: "Elephant's Head Point", distance: '14 km', travel_time: '30 minutes', best_time: 'October to May (clear views, sunrise/sunset)' },
  { name: "Kate's Point", distance: '13 km', travel_time: '28 minutes', best_time: 'October to May (clear weather for valley views)' },
  { name: "Arthur's Seat", distance: '16 km', travel_time: '35 minutes', best_time: 'October to May (sunrise viewing, clear skies)' },
  { name: 'Panchgani', distance: '28 km', travel_time: '50 minutes', best_time: 'Year Round (best October to May)' },
  { name: 'Mahabaleshwar Temple', distance: '11 km', travel_time: '22 minutes', best_time: 'Year Round (avoid peak festival crowds)' },
  { name: 'Connaught Peak', distance: '17 km', travel_time: '38 minutes', best_time: 'October to May (sunrise/sunset views)' },
  { name: 'Bombay Point', distance: '14 km', travel_time: '30 minutes', best_time: 'October to May (sunset viewing)' },
  { name: 'Wilson Point', distance: '19 km', travel_time: '42 minutes', best_time: 'October to May (sunrise viewing, highest point)' },
  { name: 'Table Land', distance: '30 km', travel_time: '55 minutes', best_time: 'Year Round (best October to May for activities)' },
  { name: 'Rajpuri Caves', distance: '32 km', travel_time: '1 hour', best_time: 'October to March (avoid monsoon for safety)' },
  { name: 'Tapola (Mini Kashmir)', distance: '42 km', travel_time: '1 hour 20 minutes', best_time: 'October to May (water sports, boating)' },
  { name: "Chinaman's Falls", distance: '21 km', travel_time: '45 minutes', best_time: 'July to September (monsoon for waterfall)' },
  { name: 'Dhobi Waterfall', distance: '19 km', travel_time: '40 minutes', best_time: 'July to September (monsoon season)' },
  { name: 'Lodwick Point', distance: '15 km', travel_time: '32 minutes', best_time: 'October to May (clear valley views)' },
  { name: 'Needle Hole Point', distance: '13 km', travel_time: '28 minutes', best_time: 'October to May (photography, clear weather)' },
  { name: 'Sunset Point', distance: '14 km', travel_time: '30 minutes', best_time: 'October to May (sunset viewing)' }
]

async function updateDistances() {
  console.log('🔄 Updating accurate distances and times...\n')
  
  for (const update of updates) {
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
  
  console.log('\n🎉 All distances updated with accurate information!')
  console.log('📱 Refresh your page to see the changes.')
}

updateDistances()
