#!/usr/bin/env node
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyTables() {
  console.log('🔍 Verifying database tables...\n')

  const tables = ['house_rules', 'faqs', 'features', 'rooms', 'bookings', 'blocked_dates']
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`)
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)`)
      }
    } catch (err) {
      console.log(`❌ ${table}: EXCEPTION - ${err.message}`)
    }
  }

  console.log('\n🔍 Testing room slug query...\n')
  
  try {
    // Get first room
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, slug')
      .limit(1)

    if (roomsError) {
      console.log('❌ Cannot fetch rooms:', roomsError.message)
    } else if (rooms && rooms.length > 0) {
      const room = rooms[0]
      console.log(`Found room: ${room.name} (slug: ${room.slug})`)
      
      // Test slug query
      const { data: roomBySlug, error: slugError } = await supabase
        .from('rooms')
        .select('*')
        .eq('slug', room.slug)
        .single()

      if (slugError) {
        console.log(`❌ Slug query failed: ${slugError.message}`)
      } else {
        console.log(`✅ Slug query successful: Found "${roomBySlug.name}"`)
      }
    } else {
      console.log('⚠️  No rooms found in database')
    }
  } catch (err) {
    console.log('❌ Exception during slug test:', err.message)
  }

  console.log('\n✨ Verification complete!')
}

verifyTables()
