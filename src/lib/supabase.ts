import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
})

// Database Types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  is_admin: boolean
  created_at: string
}

export interface RoomImage {
  id: number;
  room_id: number;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface Room {
  id: number
  room_number?: string // Optional - for backward compatibility
  name: string
  slug?: string // Add slug field for SEO-friendly URLs
  description: string
  price_per_night: number // Base price for couple (2 adults)
  max_occupancy?: number // Optional - kept for backward compatibility
  max_capacity: number // Maximum number of guests allowed in this room type
  quantity: number // Number of rooms available for this room type
  amenities?: string[]
  image_url: string
  images?: string[] // Array of image URLs
  video_url?: string // Cloudinary video URL
  is_active: boolean
  is_deleted?: boolean // Soft delete flag
  deleted_at?: string // Soft delete timestamp
  extra_guest_price?: number // Price per extra adult per night
  child_above_5_price?: number // Price per child above 5 years per night
  gst_percentage?: number // GST percentage (default: 12%)
  accommodation_details?: string
  floor?: number
  check_in_time?: string // Hardcoded to 12:00 PM
  check_out_time?: string // Hardcoded to 10:00 AM
  is_available: boolean
  created_at: string
  room_images?: RoomImage[] // Keep for backward compatibility
  extra_mattress_price?: number // Price per extra mattress (default: ₹200)
}

export interface Booking {
  id: number
  room_id: number | null // Can be null if room is deleted
  room_name?: string // Preserved room name even after deletion
  check_in_date: string
  check_out_date: string
  num_guests: number
  num_extra_adults?: number
  num_children_above_5?: number
  first_name: string
  last_name: string
  email: string
  phone: string
  special_requests?: string
  total_amount: number
  subtotal_amount?: number
  gst_amount?: number
  gst_percentage?: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed'
  payment_gateway: 'direct' | 'razorpay'
  razorpay_order_id?: string
  razorpay_payment_id?: string
  created_at: string
  updated_at: string
}

export interface Facility {
  id: number
  name: string
  description: string
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface Testimonial {
  id: number
  guest_name: string
  rating: number
  comment: string
  is_featured: boolean
  is_active: boolean
  source?: 'website' | 'google'
  created_at: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface ResortClosure {
  id: number
  start_date: string
  end_date: string
  reason: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface CalendarSetting {
  id: number
  setting_key: string
  setting_value: string
  description?: string
  updated_at: string
}

export interface SocialMediaLink {
  id: number
  platform: string
  url: string
  icon_class?: string
  is_active: boolean
  display_order: number
  created_at: string
}

export interface TouristAttraction {
  id: number
  name: string
  description: string
  image_url?: string
  images?: string[] // Array of image URLs
  location: string
  distance_from_resort: number
  estimated_time: string
  category: string
  rating: number
  google_maps_url?: string
  is_featured: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

export interface WhatsAppSession {
  id: number
  user_id?: number
  guest_name?: string
  guest_phone: string
  session_status: 'active' | 'closed' | 'archived'
  last_message_at: string
  created_at: string
  user?: User
}

export interface WhatsAppMessage {
  id: number
  session_id: number
  message_text: string
  message_type: 'text' | 'image' | 'file' | 'location'
  sender_type: 'guest' | 'admin'
  is_read: boolean
  created_at: string
  session?: WhatsAppSession
}

// API Functions
export const api = {
  // User Management
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateUser(id: number, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Room Management
  async getRooms() {
    try {
      // Get only non-deleted rooms for public display
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_deleted', false);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getAllRooms() {
    try {
      // Get ALL rooms including soft-deleted ones (for admin panel)
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  },

  // Debug function to test database connection
  async testDatabaseConnection() {
    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('rooms')
        .select('count')
        .limit(1)
      
      if (connectionError) {
        return {
          success: false,
          message: `Database connection failed: ${connectionError.message}`,
          details: connectionError
        };
      }

      // Test rooms table
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, is_active')
        .limit(5);

      if (roomsError) {
        return {
          success: false,
          message: `Rooms table access failed: ${roomsError.message}`,
          details: roomsError
        };
      }

      return {
        success: true,
        message: `Database connection successful. Found ${roomsData?.length || 0} rooms.`,
        details: {
          connectionTest,
          roomsCount: roomsData?.length || 0,
          sampleRooms: roomsData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Unexpected error: ${error}`,
        details: error
      };
    }
  },

  async getRoom(id: number) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createRoom(roomData: Partial<Room>) {
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateRoom(id: number, updates: Partial<Room>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRoom(id: number) {
    // Hard delete: actually remove from database
    // Room name is preserved in bookings table, so old bookings will show "Room Name (deleted)"
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async permanentlyDeleteRoom(id: number) {
    // Hard delete: actually remove from database (use with caution!)
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number')

    if (error) throw error
    return data
  },

  async getAvailableRooms(roomId: number, checkIn: string, checkOut: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .eq('is_active', true)
      .not('id', 'in', `(
        SELECT DISTINCT room_id 
        FROM bookings 
        WHERE booking_status IN ('confirmed', 'pending')
        AND (
          (check_in_date <= '${checkIn}' AND check_out_date > '${checkIn}')
          OR (check_in_date < '${checkOut}' AND check_out_date >= '${checkOut}')
          OR (check_in_date >= '${checkIn}' AND check_out_date <= '${checkOut}')
        )
      )`)

    if (error) throw error
    return data
  },

  async checkRoomAvailability(roomId: number, checkIn: string, checkOut: string) {
    
    // Check if check-in and check-out are the same date
    if (checkIn === checkOut) {
      return {
        available: false,
        reason: 'same_day_checkin_checkout',
        conflicts: []
      }
    }
    
    // Normalize dates to avoid timezone issues
    const normalizeDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T00:00:00')
      return date
    }
    
    const checkInDate = normalizeDate(checkIn)
    const checkOutDate = normalizeDate(checkOut)
    
    // First check website bookings with more precise conflict detection
    const { data: websiteBookings, error: websiteError } = await supabase
      .from('bookings')
      .select('id, check_in_date, check_out_date, booking_status, first_name, last_name')
      .eq('room_id', roomId)
      .in('booking_status', ['confirmed', 'pending'])

    if (websiteError) {
      throw websiteError
    }


    // Manually check for conflicts with more precise logic
    const conflictingBookings = websiteBookings?.filter(booking => {
      const bookingStart = normalizeDate(booking.check_in_date)
      const bookingEnd = normalizeDate(booking.check_out_date)

      // Check for overlap: if the booking overlaps with the requested dates
      const hasOverlap = (
        (bookingStart <= checkInDate && bookingEnd > checkInDate) || // Booking starts before check-in and ends after check-in
        (bookingStart < checkOutDate && bookingEnd >= checkOutDate) || // Booking starts before check-out and ends after check-out
        (bookingStart >= checkInDate && bookingEnd <= checkOutDate) || // Booking is completely within requested dates
        (checkInDate >= bookingStart && checkOutDate <= bookingEnd)   // Requested dates are completely within booking
      )

      return hasOverlap
    }) || []


    // Check if there are any conflicting website bookings
    if (conflictingBookings.length > 0) {
      return {
        available: false,
        reason: 'website_booking_conflict',
        conflicts: conflictingBookings
      }
    }

    // Check for blocked dates that would conflict with the requested dates
    const { data: blockedDates, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('id, start_date, end_date, reason, source')
      .eq('room_id', roomId)

    if (blockedError) {
      throw blockedError
    }

    // Check if any blocked date overlaps with the requested dates
    // IMPORTANT: We need to check if ANY day in the check-in to check-out range is blocked
    const conflictingBlockedDates = blockedDates?.filter(blocked => {
      const blockedStart = normalizeDate(blocked.start_date)
      const blockedEnd = normalizeDate(blocked.end_date)

      // Check for overlap: if ANY day in the requested range falls within a blocked period
      // A date is blocked if: checkInDate <= blockedDate < blockedEnd
      const hasOverlap = (
        (blockedStart <= checkInDate && blockedEnd > checkInDate) || // Blocked period includes check-in date
        (blockedStart < checkOutDate && blockedEnd >= checkOutDate) || // Blocked period includes check-out date
        (blockedStart >= checkInDate && blockedStart < checkOutDate) || // Blocked period starts within requested dates
        (checkInDate >= blockedStart && checkInDate < blockedEnd)   // Check-in date falls within blocked period
      )

      return hasOverlap
    }) || []

    // If there are conflicting blocked dates, return unavailable
    if (conflictingBlockedDates.length > 0) {
      return {
        available: false,
        reason: 'blocked_date_conflict',
        conflicts: conflictingBlockedDates
      }
    }

    
    return {
      available: true,
      reason: 'available',
      conflicts: []
    }
  },

    // Get admin information for footer
    async getAdminInfo(): Promise<{
      first_name: string
      last_name: string
      email: string
      phone?: string
      address?: string
    }> {
      try {
        const { data: adminUser, error } = await supabase
          .from('users')
          .select('first_name, last_name, email, phone, address')
          .eq('is_admin', true)
          .single()

        if (error) {
          return {
            first_name: 'Admin',
            last_name: '',
            email: '',
            phone: '',
            address: ''
          }
        }

        return adminUser || {
          first_name: 'Admin',
          last_name: '',
          email: '',
          phone: '',
          address: ''
        }
      } catch (error) {
        return {
          first_name: 'Admin',
          last_name: '',
          email: '',
          phone: '',
          address: ''
        }
    }
  },

  async getAvailabilityForMonth(roomId: number, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date, booking_status')
      .eq('room_id', roomId)
      .gte('check_in_date', startDate)
      .lte('check_out_date', endDate)
      .in('booking_status', ['confirmed', 'pending'])

    if (error) throw error
    return data
  },

  async getCalendarEvents(roomId: number) {
    try {
      
      // Get all bookings from database
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, check_in_date, check_out_date, booking_status, first_name, last_name, room_id, booking_source')
        .eq('room_id', roomId)
        .in('booking_status', ['confirmed', 'pending'])

      if (bookingsError) {
        throw bookingsError
      }


      // Get blocked dates from database (handle gracefully if table doesn't exist)
      let blockedDates = []
      try {
        const { data: blockedData, error: blockedError } = await supabase
          .from('blocked_dates')
          .select('id, start_date, end_date, reason, notes')
          .eq('room_id', roomId)

        if (blockedError) {
          // Continue without blocked dates
        } else {
          blockedDates = blockedData || []
        }
      } catch (error) {
      }

      // Combine all events
      const events = [
        // All bookings
        ...(bookings || []).map(booking => ({
          ...booking,
          type: 'booking',
          source: 'website',
          title: 'Booked',
          backgroundColor: booking.booking_status === 'confirmed' ? '#ef4444' : '#f59e0b',
          borderColor: booking.booking_status === 'confirmed' ? '#dc2626' : '#d97706',
          textColor: '#ffffff'
        })),
        // Blocked dates (only if they exist)
        ...(blockedDates || []).map(blocked => ({
          id: `blocked-${blocked.id}`,
          check_in_date: blocked.start_date,
          check_out_date: blocked.end_date,
          booking_status: 'blocked',
          first_name: 'Blocked',
          last_name: blocked.reason,
          room_id: roomId,
          type: 'blocked',
          source: 'manual',
          title: 'Blocked',
          backgroundColor: '#6b7280',
          borderColor: '#4b5563',
          textColor: '#ffffff',
          reason: blocked.reason,
          notes: blocked.notes
        }))
      ]

      return events
    } catch (error) {
      throw error
    }
  },

  // Blocked Dates Management
  async getBlockedDates(roomId?: number) {
    let query = supabase
      .from('blocked_dates')
      .select('*')
      .order('start_date', { ascending: true })

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data, error } = await query
    if (error) {
      return [];
    }
    return data || []
  },

  async blockDates(blockData: {
    room_id: string
    start_date: string
    end_date: string
    reason: string
    notes?: string
    source?: string // Source of the blocked date (e.g., 'manual')
  }) {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert([{
        room_id: parseInt(blockData.room_id),
        start_date: blockData.start_date,
        end_date: blockData.end_date,
        reason: blockData.reason,
        notes: blockData.notes,
        source: blockData.source || 'manual' // Default to manual for admin-created blocked dates
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createBlockedDate(blockedDateData: {
    room_id: number
    start_date: string
    end_date: string
    reason: string
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert([blockedDateData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBlockedDate(id: number, updates: {
    start_date?: string
    end_date?: string
    reason?: string
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('blocked_dates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteBlockedDate(id: number) {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id)

    if (error) throw error
  },


  // Temporary function to add a test blocked date
  async addTestBlockedDate(roomId: number) {
    try {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      const testBlockedDate = {
        room_id: roomId,
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
        reason: 'Test Blocked Date',
        notes: 'Manually blocked'
      }
      
      const result = await this.createBlockedDate(testBlockedDate)
      return result
    } catch (error) {
      throw error
    }
  },

  async checkRoomAvailability(roomId: number, checkIn: string, checkOut: string) {
    try {
      // First get the room to check its quantity
      const room = await this.getRoom(roomId)
      if (!room) {
        return {
          available: false,
          conflictingEvents: [],
          totalEvents: 0,
          error: 'Room not found',
          availableRooms: 0
        }
      }

      // Get all bookings for this room type on the requested dates
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .in('booking_status', ['confirmed', 'pending'])
        .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`)

      if (bookingsError) {
        throw bookingsError
      }

      // Count how many bookings overlap with the requested dates
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      const overlappingBookings = bookings?.filter(booking => {
        const bookingStart = new Date(booking.check_in_date)
        const bookingEnd = new Date(booking.check_out_date)
        
        // Check for overlap
        return (
          (bookingStart <= checkInDate && bookingEnd > checkInDate) ||
          (bookingStart < checkOutDate && bookingEnd >= checkOutDate) ||
          (bookingStart >= checkInDate && bookingEnd <= checkOutDate)
        )
      }) || []

      // Get blocked dates
      const { data: blockedDates, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('room_id', roomId)

      if (blockedError) {
        // Continue without blocked dates
      }

      const overlappingBlockedDates = blockedDates?.filter(blocked => {
        const blockedStart = new Date(blocked.start_date)
        const blockedEnd = new Date(blocked.end_date)
        
        return (
          (blockedStart <= checkInDate && blockedEnd > checkInDate) ||
          (blockedStart < checkOutDate && blockedEnd >= checkOutDate) ||
          (blockedStart >= checkInDate && blockedEnd <= checkOutDate)
        )
      }) || []

      // Calculate available rooms
      const bookedCount = overlappingBookings.length
      const roomQuantity = room.quantity || 1
      const availableRooms = roomQuantity - bookedCount
      
      // Room is available if there are still rooms left AND no blocked dates
      const isAvailable = availableRooms > 0 && overlappingBlockedDates.length === 0
      
      return {
        available: isAvailable,
        availableRooms: availableRooms,
        bookedCount: bookedCount,
        roomQuantity: roomQuantity,
        conflictingEvents: [...overlappingBookings, ...overlappingBlockedDates],
        totalEvents: (bookings?.length || 0) + (blockedDates?.length || 0)
      }
    } catch (error) {
      return {
        available: false,
        availableRooms: 0,
        bookedCount: 0,
        roomQuantity: 0,
        conflictingEvents: [],
        totalEvents: 0,
        error: error
      }
    }
  },

  // Booking Management
  async getBookings(userId?: number) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*)
      `)
      .order('created_at', { ascending: false })

    // Note: user_id column was removed from bookings table
    // So we don't filter by userId anymore
    // if (userId) {
    //   query = query.eq('user_id', userId)
    // }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getBooking(id: number) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }
    
    return data
  },

  async createBooking(bookingData: Partial<Booking>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        *,
        room:rooms(*)
      `)
      .single()

    if (error) {
      throw error
    }
    
    return data
  },

  async updateBooking(id: number, updates: Partial<Booking>) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancelBooking(id: number) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteBooking(id: number) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) throw error
  },


  // Facility Management
  async getFacilities() {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  },

  async getFeatures() {
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data
  },

  async getAllFacilities() {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async createFacility(facilityData: Partial<Facility>) {
    const { data, error } = await supabase
      .from('facilities')
      .insert([facilityData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateFacility(id: number, updates: Partial<Facility>) {
    const { data, error } = await supabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteFacility(id: number) {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Testimonial Management
  async getTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }
    
    return data
  },

  async getFeaturedTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createTestimonial(testimonialData: {
    guest_name: string
    rating: number
    comment: string
    is_featured?: boolean
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonialData])
      .select()
      .single()

    if (error) {
      throw error
    }
    
    return data
  },

  async getAllTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async updateTestimonial(id: number, updates: Partial<Testimonial>) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTestimonial(id: number) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Contact Message Management
  async createContactMessage(messageData: Partial<ContactMessage>) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getContactMessages() {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Dashboard Stats
  async getDashboardStats() {
    const [
      { count: totalBookings },
      { count: confirmedBookings },
      { count: pendingBookings },
      { count: totalRooms },
      { count: totalUsers }
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'confirmed'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'pending'),
      supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('*', { count: 'exact', head: true })
    ])

    return {
      totalBookings: totalBookings || 0,
      confirmedBookings: confirmedBookings || 0,
      pendingBookings: pendingBookings || 0,
      totalRooms: totalRooms || 0,
      totalUsers: totalUsers || 0
    }
  },

  // User Management (Admin)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async updateUserRole(userId: number, isAdmin: boolean) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error
    return data
  },

  // Room Images
  async getRoomImages(room_id: number) {
    const { data, error } = await supabase
      .from('room_images')
      .select('*')
      .eq('room_id', room_id)
      .order('sort_order')

    if (error) {
      throw error;
    }
    
    return data
  },

  async addRoomImages(room_id: number, images: { image_url: string, alt_text?: string, is_primary?: boolean, sort_order?: number }[]) {
    const { data, error } = await supabase
      .from('room_images')
      .insert(images.map(img => ({ ...img, room_id })))
      .select()

    if (error) {
      throw error;
    }
    
    return data
  },

  async updateRoomImage(id: number, updates: { image_url?: string, alt_text?: string, is_primary?: boolean, sort_order?: number }) {
    const { data, error } = await supabase
      .from('room_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error;
    }
    
    return data
  },

  async deleteRoomImage(id: number) {
    const { error } = await supabase
      .from('room_images')
      .delete()
      .eq('id', id)

    if (error) {
      throw error;
    }
    
  },

  // Resort Closures
  async getResortClosures() {
    const { data, error } = await supabase
      .from('resort_closures')
      .select('*')
      .eq('is_active', true)
      .order('start_date')

    if (error) throw error
    return data
  },

  async createResortClosure(closureData: Partial<ResortClosure>) {
    const { data, error } = await supabase
      .from('resort_closures')
      .insert([closureData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateResortClosure(id: number, updates: Partial<ResortClosure>) {
    const { data, error } = await supabase
      .from('resort_closures')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteResortClosure(id: number) {
    const { error } = await supabase
      .from('resort_closures')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Calendar Settings
  async getCalendarSettings() {
    const { data, error } = await supabase
      .from('calendar_settings')
      .select('*')

    if (error) throw error
    return data
  },

  async updateCalendarSetting(key: string, value: string) {
    // First check if the setting exists
    const { data: existingSetting } = await supabase
      .from('calendar_settings')
      .select('id')
      .eq('setting_key', key)
      .single()

    if (existingSetting) {
      // Update existing setting
      const { data, error } = await supabase
        .from('calendar_settings')
        .update({ setting_value: value })
        .eq('setting_key', key)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Insert new setting
      const { data, error } = await supabase
        .from('calendar_settings')
        .insert([{ setting_key: key, setting_value: value }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async deleteCalendarSetting(key: string) {
    const { error } = await supabase
      .from('calendar_settings')
      .delete()
      .eq('setting_key', key)

    if (error) throw error
  },

  // Maintenance Mode Management
  async getMaintenanceMode(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('calendar_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        // Only log non-network errors
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          console.error('Error fetching maintenance mode:', error)
        }
        return false
      }

      if (data && data.setting_value) {
        return data.setting_value === 'true' || data.setting_value === '1'
      }

      return false
    } catch (error: any) {
      // Only log non-network errors
      if (!error?.message?.includes('Failed to fetch') && !error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        console.error('Error in getMaintenanceMode:', error)
      }
      return false
    }
  },

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    try {
      // First check if the setting exists
      const { data: existingSetting } = await supabase
        .from('calendar_settings')
        .select('id')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle()

      const value = enabled ? 'true' : 'false'

      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('calendar_settings')
          .update({ 
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'maintenance_mode')

        if (error) throw error
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('calendar_settings')
          .insert([{ 
            setting_key: 'maintenance_mode', 
            setting_value: value,
            description: 'Site maintenance mode - when enabled, shows maintenance page on homepage'
          }])

        if (error) throw error
      }
    } catch (error) {
      console.error('Error setting maintenance mode:', error)
      throw error
    }
  },

  // Social Media Links
  async getSocialMediaLinks() {
    const { data, error } = await supabase
      .from('social_media_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data
  },

  async getAllSocialMediaLinks() {
    const { data, error } = await supabase
      .from('social_media_links')
      .select('*')
      .order('display_order')

    if (error) throw error
    return data
  },

  async createSocialMediaLink(linkData: Partial<SocialMediaLink>) {
    const { data, error } = await supabase
      .from('social_media_links')
      .insert([linkData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSocialMediaLink(id: number, updates: Partial<SocialMediaLink>) {
    const { data, error } = await supabase
      .from('social_media_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSocialMediaLink(id: number) {
    const { error } = await supabase
      .from('social_media_links')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Tourist Attractions
  async getTouristAttractions() {
    const { data, error } = await supabase
      .from('attractions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAllTouristAttractions() {
    const { data, error } = await supabase
      .from('attractions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createTouristAttraction(attractionData: Partial<TouristAttraction>) {
    const { data, error } = await supabase
      .from('attractions')
      .insert([attractionData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTouristAttraction(id: number, updates: Partial<TouristAttraction>) {
    const { data, error } = await supabase
      .from('attractions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTouristAttraction(id: number) {
    const { error } = await supabase
      .from('attractions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // WhatsApp Sessions
  async getWhatsAppSessions() {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select(`
        *,
        user:users(*)
      `)
      .eq('session_status', 'active')
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getWhatsAppMessages(sessionId: number) {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select(`
        *,
        session:whatsapp_sessions(*)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async createWhatsAppMessage(messageData: Partial<WhatsAppMessage>) {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert([messageData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateWhatsAppMessage(id: number, updates: Partial<WhatsAppMessage>) {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteWhatsAppMessage(id: number) {
    const { error } = await supabase
      .from('whatsapp_messages')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async createWhatsAppSession(sessionData: Partial<WhatsAppSession>) {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateWhatsAppSession(id: number, updates: Partial<WhatsAppSession>) {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteWhatsAppSession(id: number) {
    const { error } = await supabase
      .from('whatsapp_sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get admin email from settings
  async getAdminEmail(): Promise<string> {
    try {
      // First try to get from calendar settings (where admin email might be stored)
      const { data: emailSetting, error } = await supabase
        .from('calendar_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_email')
        .single()

      if (error) {
        return process.env.ADMIN_EMAIL || ''
      }

      if (emailSetting?.setting_value) {
        return emailSetting.setting_value
      }

      // Fallback to environment variable
      return process.env.ADMIN_EMAIL || ''
    } catch (error) {
      return process.env.ADMIN_EMAIL || ''
    }
  },

  // Update admin email in settings
  async updateAdminEmail(email: string): Promise<void> {
    try {
      // Check if admin_email setting exists
      const { data: existingSetting, error: checkError } = await supabase
        .from('calendar_settings')
        .select('id')
        .eq('setting_key', 'admin_email')
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new settings
        // Try to create the setting anyway
      }

      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('calendar_settings')
          .update({ setting_value: email })
          .eq('setting_key', 'admin_email')

        if (error) throw error
      } else {
        // Create new setting
        const { error } = await supabase
          .from('calendar_settings')
          .insert({
            setting_key: 'admin_email',
            setting_value: email,
            description: 'Admin email for notifications'
          })

        if (error) {
          // Don't throw error, just log it
        }
      }
    } catch (error) {
      // Don't throw error, just log it
    }
  },



  // Get SMTP configuration from settings
  async getSmtpConfig(): Promise<{
    mail_username: string
    mail_password: string
    mail_server: string
    mail_port: string
  }> {
    try {
      const { data: settings, error } = await supabase
        .from('calendar_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['mail_username', 'mail_password', 'mail_server', 'mail_port'])

      if (error) {
        console.error('Error fetching SMTP config from database:', error)
        return {
          mail_username: '',
          mail_password: '',
          mail_server: 'smtp.gmail.com',
          mail_port: '587'
        }
      }


      const config: any = {}
      settings?.forEach(setting => {
        config[setting.setting_key] = setting.setting_value
      })

      const result = {
        mail_username: config.mail_username || '',
        mail_password: config.mail_password || '',
        mail_server: config.mail_server || 'smtp.gmail.com',
        mail_port: config.mail_port || '587'
      }

      return result
    } catch (error) {
      console.error('Error in getSmtpConfig:', error)
      return {
        mail_username: '',
        mail_password: '',
        mail_server: 'smtp.gmail.com',
        mail_port: '587'
      }
    }
  },

  // Update SMTP configuration in settings
  async updateSmtpConfig(config: {
    mail_username: string
    mail_password: string
    mail_server: string
    mail_port: string
  }): Promise<void> {
    try {
      const settings = [
        { setting_key: 'mail_username', setting_value: config.mail_username, description: 'SMTP username/email' },
        { setting_key: 'mail_password', setting_value: config.mail_password, description: 'SMTP password/app password' },
        { setting_key: 'mail_server', setting_value: config.mail_server, description: 'SMTP server address' },
        { setting_key: 'mail_port', setting_value: config.mail_port, description: 'SMTP port number' }
      ]

      let successCount = 0
      let errorCount = 0

      for (const setting of settings) {
        try {
          const { data: existingSetting, error: checkError } = await supabase
            .from('calendar_settings')
            .select('id')
            .eq('setting_key', setting.setting_key)
            .single()

          if (checkError && checkError.code !== 'PGRST116') {
            console.error(`Error checking ${setting.setting_key}:`, checkError)
            errorCount++
            continue
          }

          if (existingSetting) {
            // Update existing setting
            const { error } = await supabase
              .from('calendar_settings')
              .update({ setting_value: setting.setting_value })
              .eq('setting_key', setting.setting_key)

            if (error) {
              console.error(`Error updating ${setting.setting_key}:`, error)
              errorCount++
            } else {
              successCount++
            }
          } else {
            // Insert new setting
            const { error } = await supabase
              .from('calendar_settings')
              .insert(setting)

            if (error) {
              console.error(`Error inserting ${setting.setting_key}:`, error)
              errorCount++
            } else {
              successCount++
            }
          }
        } catch (settingError) {
          console.error(`Exception for ${setting.setting_key}:`, settingError)
          errorCount++
        }
      }

      if (errorCount > 0) {
        throw new Error(`Failed to update ${errorCount} SMTP setting(s). Check console for details.`)
      }
    } catch (error) {
      console.error('Error in updateSmtpConfig:', error)
      throw error
    }
  },




  // Utility function to generate slug from room name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  },

  // Generate a cryptic, Instagram-style slug that's impossible to guess
  async generateCrypticSlug(name: string, id: number): Promise<string> {
    try {
      // Generate a 38-character cryptic string using browser crypto
      const randomString = crypto.randomUUID().replace(/-/g, '').substring(0, 22)
      
      // Create a hash for additional security
      const secret = 'riverbreeze-secret-key-2024'
      const data = `${name}-${id}-${secret}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
      
      // Combine for exactly 38 characters
      return `${randomString}${hash}`
    } catch (error) {
      // Fallback to a random string if crypto fails
      return Math.random().toString(36).substring(2, 20) + Math.random().toString(36).substring(2, 20)
    }
  },

  // Utility function to get room by slug
  async getRoomBySlug(slug: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Room not found')
    return data
  },

  // Get room by slug without filtering by is_active (for checking room status)
  async getRoomBySlugAnyStatus(slug: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Room not found')
    return data
  },

  // Update room with automatic slug generation
  async updateRoomWithSlug(id: number, updates: Partial<Room>) {
    // If the name is being updated, generate a new slug
    if (updates.name) {
      try {
        const newSlug = await this.generateCrypticSlug(updates.name, id)
        updates.slug = newSlug
      } catch (error) {
        // Fallback to simple slug
        updates.slug = this.generateSlug(updates.name)
      }
    }
    
    return this.updateRoom(id, updates)
  },

  // Admin function to update all room slugs with cryptic slugs
  async updateAllRoomSlugs() {
    try {
      
      const rooms = await this.getRooms()
      
      const updatePromises = rooms.map(async (room) => {
        try {
          const crypticSlug = await this.generateCrypticSlug(room.name, room.id)
          
          await this.updateRoom(room.id, { slug: crypticSlug })
          return { success: true, roomId: room.id, newSlug: crypticSlug }
        } catch (error) {
          return { success: false, roomId: room.id, error }
        }
      })
      
      const results = await Promise.all(updatePromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      
      if (failed > 0) {
      }
      
      return results
    } catch (error) {
      throw error
    }
  },


}
