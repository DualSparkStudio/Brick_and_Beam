import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iwzotxudjklostywactg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3em90eHVkamtsb3N0eXdhY3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEwMjkzNywiZXhwIjoyMDg3Njc4OTM3fQ.1Njnzpk7vie4ijXL_xizjdWtCSSKjF_lp7niAs-P374'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const probe = await supabase
    .from('rooms')
    .select('id, price_per_night, weekday_price_per_night, weekend_price_per_night')
    .limit(1)

  if (probe.error?.message?.includes('weekday_price_per_night')) {
    console.log('Columns missing — run supabase/migrations/add_weekday_weekend_pricing.sql in Supabase SQL editor.')
    process.exit(1)
  }

  if (probe.error) {
    console.error('Probe failed:', probe.error.message)
    process.exit(1)
  }

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, price_per_night, weekday_price_per_night, weekend_price_per_night')

  if (error) {
    console.error('Fetch failed:', error.message)
    process.exit(1)
  }

  for (const room of rooms ?? []) {
    if (room.weekday_price_per_night != null && room.weekend_price_per_night != null) continue
    const base = room.price_per_night ?? 0
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        weekday_price_per_night: room.weekday_price_per_night ?? base,
        weekend_price_per_night: room.weekend_price_per_night ?? base,
      })
      .eq('id', room.id)
    if (updateError) {
      console.error(`Room ${room.id} update failed:`, updateError.message)
    } else {
      console.log(`Backfilled room ${room.id}`)
    }
  }

  console.log('Done.')
}

main()
