// Script to update Room 1 and Room 2 with occupancy-based pricing
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

async function updateRoomPricing() {
  try {
    console.log('🚀 Starting Room Pricing Update...\n');
    
    // First, find Room 1 and Room 2 by name
    const { data: rooms, error: fetchError } = await supabase
      .from('rooms')
      .select('id, name')
      .in('name', ['Room 1', 'Room 2'])
      .order('id');

    if (fetchError) {
      console.error('❌ Error fetching rooms:', fetchError.message);
      return;
    }

    if (!rooms || rooms.length === 0) {
      console.log('⚠️  No rooms found with names "Room 1" or "Room 2"');
      return;
    }

    console.log(`✅ Found ${rooms.length} room(s) to update\n`);

    // Update Room 1
    const room1 = rooms.find(r => r.name === 'Room 1');
    if (room1) {
      console.log(`📝 Updating Room 1 (ID: ${room1.id})...`);
      const { data, error } = await supabase
        .from('rooms')
        .update({
          price_double_occupancy: 2500,
          price_triple_occupancy: 2800,
          price_four_occupancy: null, // Remove 4-person pricing
          max_occupancy: 3, // Cap at 3 guests
          extra_mattress_price: 200,
          price_per_night: 2500, // Keep base price for backward compatibility
          accommodation_details: 'Extra Mattress for ₹200'
        })
        .eq('id', room1.id)
        .select();

      if (error) {
        console.error(`❌ Error updating Room 1:`, error.message);
      } else {
        console.log(`✅ Room 1 updated successfully!`);
        console.log(`   - Double occupancy (2 guests): ₹2,500/night`);
        console.log(`   - Triple occupancy (3 guests): ₹2,800/night`);
        console.log(`   - Max capacity: 3 persons`);
        console.log(`   - Extra mattress: ₹200/night\n`);
      }
    } else {
      console.log('⚠️  Room 1 not found\n');
    }

    // Update Room 2
    const room2 = rooms.find(r => r.name === 'Room 2');
    if (room2) {
      console.log(`📝 Updating Room 2 (ID: ${room2.id})...`);
      const { data, error } = await supabase
        .from('rooms')
        .update({
          price_double_occupancy: 2500,
          price_triple_occupancy: 2700,
          price_four_occupancy: null, // Remove 4-person pricing
          max_occupancy: 3, // Cap at 3 guests
          extra_mattress_price: 200,
          price_per_night: 2500, // Keep base price for backward compatibility
          accommodation_details: 'Extra Mattress for ₹200'
        })
        .eq('id', room2.id)
        .select();

      if (error) {
        console.error(`❌ Error updating Room 2:`, error.message);
      } else {
        console.log(`✅ Room 2 updated successfully!`);
        console.log(`   - Double occupancy (2 guests): ₹2,500/night`);
        console.log(`   - Triple occupancy (3 guests): ₹2,700/night`);
        console.log(`   - Max capacity: 3 persons`);
        console.log(`   - Extra mattress: ₹200/night\n`);
      }
    } else {
      console.log('⚠️  Room 2 not found\n');
    }

    console.log('✅ Pricing update completed!\n');
    console.log('📋 Summary:');
    console.log('   Room 1: Double ₹2,500 | Triple ₹2,800 | Max 3 | Extra Mattress ₹200');
    console.log('   Room 2: Double ₹2,500 | Triple ₹2,700 | Max 3 | Extra Mattress ₹200\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

updateRoomPricing().catch(console.error);

