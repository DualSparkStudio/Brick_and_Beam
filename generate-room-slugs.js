// Script to generate slugs for existing rooms
// Run this script to update your database with slugs for all existing rooms

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Function to generate slug from room name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

async function generateRoomSlugs() {
  try {
    
    // Get all rooms
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, name, slug')
      .order('id')

    if (error) {
      return
    }


    // Generate slugs for rooms that don't have them
    const roomsToUpdate = rooms.filter(room => !room.slug)
    
    if (roomsToUpdate.length === 0) {
      return
    }


    // Update each room with a slug
    for (const room of roomsToUpdate) {
      const slug = generateSlug(room.name)
      
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ slug })
        .eq('id', room.id)

      if (updateError) {
      } else {
      }
    }


  } catch (error) {
  }
}

// Run the script
generateRoomSlugs()
