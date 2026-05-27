import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
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
  room_number: string
  name: string
  description: string
  price_per_night: number
  max_occupancy: number
  amenities?: string[]
  image_url: string
  images?: string[] // Array of image URLs
  is_active: boolean
  extra_guest_price?: number
  floor?: number
  is_available: boolean
  check_in_time?: string
  check_out_time?: string
  created_at: string
  room_images?: RoomImage[] // Keep for backward compatibility
}

export interface Booking {
  id: number
  room_id: number
  check_in_date: string
  check_out_date: string
  num_guests: number
  first_name: string
  last_name: string
  email: string
  phone: string
  special_requests?: string
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed'
  payment_gateway: 'direct'
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
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('room_number')

    if (error) throw error
    return data
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

  // Booking Management
  async getBookings(userId?: number) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*),
        user:users(*)
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getBooking(id: number) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*),
        user:users(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
    return data
  },

  async addRoomImages(room_id: number, images: { image_url: string, alt_text?: string, is_primary?: boolean, sort_order?: number }[]) {
    const { data, error } = await supabase
      .from('room_images')
      .insert(images.map(img => ({ ...img, room_id })))
      .select()

    if (error) throw error
    return data
  },

  async updateRoomImage(id: number, updates: { image_url?: string, alt_text?: string, is_primary?: boolean, sort_order?: number }) {
    const { data, error } = await supabase
      .from('room_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRoomImage(id: number) {
    const { error } = await supabase
      .from('room_images')
      .delete()
      .eq('id', id)

    if (error) throw error
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
    const { data, error } = await supabase
      .from('calendar_settings')
      .upsert([{ setting_key: key, setting_value: value }])
      .select()
      .single()

    if (error) throw error
    return data
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
      .order('created_at')

    if (error) throw error
    return data
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

  async createWhatsAppMessage(messageData: Partial<WhatsAppMessage>) {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert([messageData])
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

  // Date Blocking
  async createManualBlock(blockData: {
    room_id: number
    start_date: string
    end_date: string
    reason: string
  }) {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert([blockData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAvailabilityCalendar(roomId?: number, startDate?: string, endDate?: string) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*)
      `)
      .in('booking_status', ['confirmed', 'pending'])

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    if (startDate && endDate) {
      query = query
        .gte('check_in_date', startDate)
        .lte('check_out_date', endDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async blockDates(blockData: {
    room_id: string
    start_date: string
    end_date: string
    reason: string
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert([{
        room_id: parseInt(blockData.room_id),
        start_date: blockData.start_date,
        end_date: blockData.end_date,
        reason: blockData.reason,
        notes: blockData.notes
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getBlockedDates(roomId?: number) {
    let query = supabase
      .from('blocked_dates')
      .select('*')
      .order('start_date')

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async unblockDates(blockedDateId: number) {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', blockedDateId)

    if (error) throw error
  }
} 
