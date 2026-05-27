import { createClient } from '@supabase/supabase-js';

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'text/calendar; charset=utf-8',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all confirmed and pending bookings from database
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in_date,
        check_out_date,
        booking_status,
        first_name,
        last_name,
        room_id,
        booking_source,
        rooms!inner(name)
      `)
      .in('booking_status', ['confirmed', 'pending'])
      .eq('booking_source', 'website') // Only website bookings
      .order('check_in_date', { ascending: true });

    if (bookingsError) {
      throw new Error(`Database error: ${bookingsError.message}`);
    }

    // Get blocked dates
    const { data: blockedDates, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('id, start_date, end_date, reason, notes, room_id, rooms!inner(name)')
      .eq('source', 'manual') // Only manual blocked dates
      .order('start_date', { ascending: true });

    if (blockedError) {
    }

    // Generate iCal content
    const icalContent = generateICalContent(bookings || [], blockedDates || []);

    return {
      statusCode: 200,
      headers,
      body: icalContent
    };

  } catch (error) {
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate calendar feed',
        details: error.message 
      })
    };
  }
};

function generateICalContent(bookings, blockedDates) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Resort Booking System//Website Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Resort Booking System - Availability',
    'X-WR-CALDESC:Website bookings and blocked dates for Resort Booking System',
    'X-WR-TIMEZONE:Asia/Kolkata',
    'X-PUBLISHED-TTL:PT5M', // Refresh every 5 minutes
    ''
  ];

  // Add bookings as events
  bookings.forEach(booking => {
    const startDate = formatDateForICal(booking.check_in_date);
    const endDate = formatDateForICal(booking.check_out_date);
    const summary = `BOOKED - ${booking.rooms.name} - ${booking.first_name} ${booking.last_name}`;
    const uid = `booking-${booking.id}@resortbookingsystem.com`;
    
    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `DTSTAMP:${timestamp}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:Website booking for ${booking.rooms.name}. Guest: ${booking.first_name} ${booking.last_name}. Status: ${booking.booking_status.toUpperCase()}`,
      `STATUS:${booking.booking_status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      `LOCATION:Resort Booking System, Ratnagiri`,
      `CATEGORIES:BOOKING`,
      'END:VEVENT',
      ''
    );
  });

  // Add blocked dates as events
  blockedDates.forEach(blocked => {
    const startDate = formatDateForICal(blocked.start_date);
    const endDate = formatDateForICal(blocked.end_date);
    const summary = `BLOCKED - ${blocked.rooms.name}`;
    const uid = `blocked-${blocked.id}@resortbookingsystem.com`;
    
    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `DTSTAMP:${timestamp}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:Manually blocked dates for ${blocked.rooms.name}. Reason: ${blocked.reason || 'Not available'}`,
      'STATUS:CONFIRMED',
      `LOCATION:Resort Booking System, Ratnagiri`,
      'CATEGORIES:BLOCKED',
      'END:VEVENT',
      ''
    );
  });

  ical.push('END:VCALENDAR');
  
  return ical.join('\r\n');
}

function formatDateForICal(dateString) {
  // Convert YYYY-MM-DD to YYYYMMDD format for iCal
  return dateString.replace(/-/g, '');
}
