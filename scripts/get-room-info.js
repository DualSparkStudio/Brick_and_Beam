// Script to fetch information about room 1 and room 2
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAllRooms() {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, name, room_number, is_active')
      .order('id');

    if (error) {
      console.error('❌ Error fetching rooms:', error.message);
      return [];
    }

    return rooms || [];
  } catch (error) {
    console.error('❌ Unexpected error fetching rooms:', error.message);
    return [];
  }
}

async function getRoomInfo(roomId) {
  try {
    console.log(`\n🔍 Fetching information for Room ${roomId}...`);
    
    // Get room details - use maybeSingle() instead of single() to handle no results
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError) {
      console.error(`❌ Error fetching room ${roomId}:`, roomError.message);
      return null;
    }

    if (!room) {
      console.log(`⚠️  Room ${roomId} not found in database`);
      return null;
    }

    // Get bookings for this room
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('room_id', roomId)
      .order('check_in_date', { ascending: false })
      .limit(10);

    // Get blocked dates for this room
    const { data: blockedDates, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('room_id', roomId)
      .order('start_date', { ascending: false })
      .limit(10);

    // Get calendar settings for Airbnb integration
    const { data: calendarSettings, error: calendarError } = await supabase
      .from('calendar_settings')
      .select('*')
      .or(`setting_key.eq.airbnb_room_${roomId},setting_key.eq.airbnb_room_${roomId}_last_sync`);

    return {
      room,
      bookings: bookings || [],
      blockedDates: blockedDates || [],
      calendarSettings: calendarSettings || [],
      bookingsError: bookingsError?.message,
      blockedError: blockedError?.message,
      calendarError: calendarError?.message
    };
  } catch (error) {
    console.error(`❌ Unexpected error fetching room ${roomId}:`, error.message);
    return null;
  }
}

function formatRoomInfo(info) {
  if (!info || !info.room) {
    return;
  }

  const room = info.room;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📋 ROOM ${room.id} INFORMATION`);
  console.log('='.repeat(60));
  
  console.log('\n📝 Basic Information:');
  console.log(`   ID: ${room.id}`);
  console.log(`   Room Number: ${room.room_number || 'N/A'}`);
  console.log(`   Name: ${room.name || 'N/A'}`);
  console.log(`   Slug: ${room.slug || 'N/A'}`);
  console.log(`   Description: ${room.description ? room.description.substring(0, 100) + '...' : 'N/A'}`);
  
  console.log('\n💰 Pricing:');
  console.log(`   Price per Night: ₹${room.price_per_night?.toLocaleString() || '0'}`);
  console.log(`   Extra Guest Price: ₹${room.extra_guest_price?.toLocaleString() || '0'}`);
  console.log(`   Max Occupancy: ${room.max_occupancy || 'N/A'} guests`);
  
  console.log('\n🏠 Room Details:');
  console.log(`   Floor: ${room.floor || 'N/A'}`);
  console.log(`   Check-in Time: ${room.check_in_time || 'N/A'}`);
  console.log(`   Check-out Time: ${room.check_out_time || 'N/A'}`);
  console.log(`   Accommodation Details: ${room.accommodation_details || 'N/A'}`);
  
  console.log('\n✅ Status:');
  console.log(`   Active: ${room.is_active ? '✅ Yes' : '❌ No'}`);
  console.log(`   Available: ${room.is_available ? '✅ Yes' : '❌ No'}`);
  
  console.log('\n🖼️  Images:');
  if (room.images && Array.isArray(room.images) && room.images.length > 0) {
    console.log(`   Total Images: ${room.images.length}`);
    room.images.forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img}`);
    });
  } else if (room.image_url) {
    console.log(`   Primary Image: ${room.image_url}`);
  } else {
    console.log('   No images configured');
  }
  
  console.log('\n🎯 Amenities:');
  if (room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0) {
    room.amenities.forEach((amenity, idx) => {
      console.log(`   ${idx + 1}. ${amenity}`);
    });
  } else {
    console.log('   No amenities listed');
  }
  
  console.log('\n📅 Bookings:');
  if (info.bookingsError) {
    console.log(`   ⚠️  Error fetching bookings: ${info.bookingsError}`);
  } else {
    console.log(`   Total Recent Bookings: ${info.bookings.length}`);
    if (info.bookings.length > 0) {
      info.bookings.forEach((booking, idx) => {
        console.log(`   ${idx + 1}. ${booking.first_name} ${booking.last_name} - ${booking.check_in_date} to ${booking.check_out_date} (${booking.booking_status})`);
      });
    }
  }
  
  console.log('\n🚫 Blocked Dates:');
  if (info.blockedError) {
    console.log(`   ⚠️  Error fetching blocked dates: ${info.blockedError}`);
  } else {
    console.log(`   Total Recent Blocked Dates: ${info.blockedDates.length}`);
    if (info.blockedDates.length > 0) {
      info.blockedDates.forEach((blocked, idx) => {
        console.log(`   ${idx + 1}. ${blocked.start_date} to ${blocked.end_date} (Source: ${blocked.source || 'manual'})`);
      });
    }
  }
  
  console.log('\n🔗 Airbnb Integration:');
  if (info.calendarError) {
    console.log(`   ⚠️  Error fetching calendar settings: ${info.calendarError}`);
  } else if (info.calendarSettings.length > 0) {
    info.calendarSettings.forEach(setting => {
      if (setting.setting_key.includes('_last_sync')) {
        console.log(`   Last Sync: ${setting.setting_value || 'Never'}`);
      } else {
        console.log(`   iCal URL: ${setting.setting_value ? '✅ Configured' : '❌ Not configured'}`);
        if (setting.setting_value) {
          console.log(`   URL: ${setting.setting_value.substring(0, 80)}...`);
        }
      }
    });
  } else {
    console.log('   ❌ No Airbnb integration configured');
  }
  
  console.log(`\n📅 Created: ${room.created_at ? new Date(room.created_at).toLocaleString() : 'N/A'}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Starting Room Information Fetch...\n');
  
  // First, list all available rooms
  console.log('📋 Checking available rooms in database...\n');
  const allRooms = await getAllRooms();
  
  if (allRooms.length > 0) {
    console.log(`✅ Found ${allRooms.length} room(s) in database:\n`);
    allRooms.forEach(room => {
      console.log(`   Room ID ${room.id}: ${room.name} (${room.room_number || 'N/A'}) - ${room.is_active ? 'Active' : 'Inactive'}`);
    });
    console.log('');
  } else {
    console.log('⚠️  No rooms found in database.\n');
  }
  
  // Now fetch detailed info for room 1 and 2
  // First try by ID 1 and 2, then by name "Room 1" and "Room 2"
  let room1Info = await getRoomInfo(1);
  let room2Info = await getRoomInfo(2);
  
  // If not found by ID, try to find by name
  if (!room1Info) {
    const room1 = allRooms.find(r => r.name === 'Room 1' || r.name?.includes('Room 1'));
    if (room1) {
      console.log(`\n🔍 Found "Room 1" with ID ${room1.id}, fetching details...`);
      room1Info = await getRoomInfo(room1.id);
    }
  }
  
  if (!room2Info) {
    const room2 = allRooms.find(r => r.name === 'Room 2' || r.name?.includes('Room 2'));
    if (room2) {
      console.log(`\n🔍 Found "Room 2" with ID ${room2.id}, fetching details...`);
      room2Info = await getRoomInfo(room2.id);
    }
  }
  
  if (room1Info) {
    formatRoomInfo(room1Info);
  }
  
  if (room2Info) {
    formatRoomInfo(room2Info);
  }
  
  if (!room1Info && !room2Info) {
    console.log('\n⚠️  No detailed information found for Room 1 or Room 2.');
    if (allRooms.length > 0) {
      console.log('   Available room IDs:', allRooms.map(r => r.id).join(', '));
    }
  }
  
  console.log('\n✅ Done!\n');
}

main().catch(console.error);

