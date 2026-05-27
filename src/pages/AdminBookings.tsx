import {
    EyeIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { Booking, Room } from '../lib/supabase'
import { api } from '../lib/supabase'

interface CombinedBooking {
  id: string;
  guestName: string;
  email?: string;
  phone?: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests?: number;
  numExtraAdults?: number;
  numChildrenAbove5?: number;
  status: string;
  paymentStatus: string;
  totalAmount?: number;
  subtotalAmount?: number;
  gstAmount?: number;
  gstPercentage?: number;
  roomName: string;
  source: 'Website';
  special_requests?: string;
  originalBooking?: Booking; // For website bookings
  payment_gateway?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  bookingDate?: string; // When the booking was created
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [combinedBookings, setCombinedBookings] = useState<CombinedBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<CombinedBooking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roomFilter, setRoomFilter] = useState<string>('all')
  const [checkInFilter, setCheckInFilter] = useState<string>('')
  const [checkOutFilter, setCheckOutFilter] = useState<string>('')
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<CombinedBooking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    combineBookings()
  }, [bookings, rooms])

  useEffect(() => {
    filterBookings()
  }, [combinedBookings, searchTerm, roomFilter, checkInFilter, checkOutFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Optimized: Load data with better error handling and caching
      const loadBookings = async () => {
        try {
          const result = await api.getBookings()
          return result || []
        } catch (error) {
          if (error.message?.includes('column "booking_source" does not exist')) {
            toast.error('Database migration needed. Please run the migration first.')
          }
          return []
        }
      }
      
      const loadRooms = async () => {
        try {
          const result = await api.getRooms()
          return result || []
        } catch (error) {
          return []
        }
      }
      
      // Load data in parallel with individual timeouts
      const [bookingsData, roomsData] = await Promise.all([
        Promise.race([
          loadBookings(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Bookings timeout')), 10000))
        ]),
        Promise.race([
          loadRooms(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Rooms timeout')), 10000))
        ])
      ])
      
      if (bookingsData && bookingsData.length > 0) {
      }
      
      setBookings(bookingsData)
      setRooms(roomsData)
      
    } catch (error) {
      toast.error('Failed to load bookings data')
      setBookings([])
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const combineBookings = () => {
    const combined: CombinedBooking[] = []
    
    // Add website bookings
    bookings.forEach(booking => {
      const room = rooms.find(r => r.id === booking.room_id)
      combined.push({
        id: `website-${booking.id}`,
        guestName: `${booking.first_name} ${booking.last_name}`,
        email: booking.email && !booking.email.startsWith('guest-') ? booking.email : null,
        phone: booking.phone,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        numGuests: booking.num_guests,
        numExtraAdults: booking.num_extra_adults,
        numChildrenAbove5: booking.num_children_above_5,
        status: booking.booking_status,
        paymentStatus: booking.payment_status,
        totalAmount: booking.total_amount,
        subtotalAmount: booking.subtotal_amount,
        gstAmount: booking.gst_amount,
        gstPercentage: booking.gst_percentage,
        roomName: room 
          ? (room.is_deleted ? `${room.name} (Deleted)` : room.name) 
          : (booking.room_name ? `${booking.room_name} (Deleted)` : 'Unknown Room'),
        source: 'Website',
        special_requests: booking.special_requests,
        originalBooking: booking,
        payment_gateway: booking.payment_gateway,
        razorpay_order_id: booking.razorpay_order_id,
        razorpay_payment_id: booking.razorpay_payment_id,
        bookingDate: booking.created_at
      })
    })
    
    // Sort by booking date (newest first)
    combined.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    
    setCombinedBookings(combined)
  }

  const filterBookings = () => {
    let filtered = combinedBookings

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by room type
    if (roomFilter !== 'all') {
      filtered = filtered.filter(booking => booking.roomName === roomFilter)
    }

    // Filter by check-in date
    if (checkInFilter) {
      filtered = filtered.filter(booking => booking.checkInDate >= checkInFilter)
    }

    // Filter by check-out date
    if (checkOutFilter) {
      filtered = filtered.filter(booking => booking.checkOutDate <= checkOutFilter)
    }

    setFilteredBookings(filtered)
  }

  const openModal = (booking: CombinedBooking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const handleDelete = async (bookingId: number) => {
    try {
      await api.deleteBooking(bookingId)
      toast.success('Booking deleted successfully')
      setIsModalOpen(false)
      setSelectedBooking(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete booking')
    }
  }

  // Bulk delete functions
  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([])
      setSelectAll(false)
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.id))
      setSelectAll(true)
    }
  }

  const handleBulkDelete = async () => {
    try {
      
      const websiteBookings = selectedBookings.filter(id => id.startsWith('website-'))
      
      
      let deletedCount = 0
      
      // Delete website bookings
      const bookingIds = websiteBookings.map(id => parseInt(id.replace('website-', '')))
      
      for (const id of bookingIds) {
        if (!isNaN(id)) {
          await api.deleteBooking(id)
          deletedCount++
        }
      }
      
      const message = deletedCount > 0 
        ? `Deleted ${deletedCount} website bookings successfully`
        : 'No bookings were processed'
      
      toast.success(message)
      setSelectedBookings([])
      loadData()
    } catch (error) {
      toast.error('Failed to delete bookings')
    }
  }

  // Update select all when filtered bookings change
  useEffect(() => {
    if (filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [filteredBookings, selectedBookings])

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'refunded':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 mt-1">Manage customer bookings and reservations</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedBookings.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedBookings.length})
                  </button>
                </div>
              )}
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="all">All Room Types</option>
              {rooms.map(room => (
                <option key={room.id} value={room.name}>{room.name}</option>
              ))}
            </select>

            <div className="relative">
              <input
                type="date"
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value)}
                placeholder="Check-in From"
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="relative">
              <input
                type="date"
                value={checkOutFilter}
                onChange={(e) => setCheckOutFilter(e.target.value)}
                placeholder="Check-out Until"
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">{filteredBookings.length}</span> 
              <span className="ml-1">of {combinedBookings.length} bookings</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-500">No bookings match your current filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => handleSelectBooking(booking.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.guestName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Room: {booking.roomName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.numGuests} guest{booking.numGuests !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status}
                          </span>
                          <br />
                          <span className={getPaymentStatusBadge(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.totalAmount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(booking)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {booking.source === 'Website' && booking.originalBooking && (
                            <button
                              onClick={() => booking.originalBooking && handleDelete(booking.originalBooking.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                              title="Delete Booking"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">No bookings match your current filters.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</h3>
                        <p className="text-xs text-gray-500 mt-1">{booking.roomName}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => openModal(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {booking.source === 'Website' && booking.originalBooking && (
                        <button
                          onClick={() => booking.originalBooking && handleDelete(booking.originalBooking.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact:</span>
                      <span className="text-gray-900 text-right">{booking.email || booking.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-in:</span>
                      <span className="text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-out:</span>
                      <span className="text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests:</span>
                      <span className="text-gray-900">{booking.numGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Booked:</span>
                      <span className="text-gray-900">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                        <span className={getPaymentStatusBadge(booking.paymentStatus)}>{booking.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-700 font-medium">Amount:</span>
                      <span className="text-lg font-bold text-gray-900">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
                onClick={closeModal}
              />
              
              {/* Modal */}
              <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl transform transition-all">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Booking Details
                        </h2>
                        <p className="text-blue-100 text-sm">
                          {selectedBooking.status?.toUpperCase()} • Website Booking
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Customer Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                        <p className="text-sm font-semibold text-gray-900">{selectedBooking.guestName}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                        <p className="text-sm font-medium text-gray-900 break-all">{selectedBooking.email || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                        <p className="text-sm font-medium text-gray-900">{selectedBooking.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Booking Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Room</label>
                        <p className="text-sm font-semibold text-gray-900">{selectedBooking.roomName}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Check-in</label>
                        <p className="text-sm font-medium text-gray-900">{new Date(selectedBooking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Check-out</label>
                        <p className="text-sm font-medium text-gray-900">{new Date(selectedBooking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Base Adults</label>
                        <p className="text-sm font-semibold text-gray-900">2</p>
                      </div>
                      {selectedBooking.numExtraAdults > 0 && (
                        <div className="bg-white rounded-lg p-3">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Extra Adults</label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBooking.numExtraAdults}</p>
                        </div>
                      )}
                      {selectedBooking.numChildrenAbove5 > 0 && (
                        <div className="bg-white rounded-lg p-3">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Children Above 5</label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBooking.numChildrenAbove5}</p>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Guests</label>
                        <p className="text-sm font-semibold text-gray-900">{2 + (selectedBooking.numExtraAdults || 0) + (selectedBooking.numChildrenAbove5 || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Payment Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status & Payment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Booking Status</label>
                        <span className={getStatusBadge(selectedBooking.status)}>
                          {selectedBooking.status}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Status</label>
                        <span className={getPaymentStatusBadge(selectedBooking.paymentStatus)}>
                          {selectedBooking.paymentStatus}
                        </span>
                      </div>
                      {selectedBooking.subtotalAmount && selectedBooking.gstAmount && (
                        <>
                          <div className="bg-white rounded-lg p-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subtotal</label>
                            <p className="text-lg font-bold text-gray-900">₹{selectedBooking.subtotalAmount?.toLocaleString()}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GST ({selectedBooking.gstPercentage || 12}%)</label>
                            <p className="text-lg font-bold text-gray-900">₹{selectedBooking.gstAmount?.toLocaleString()}</p>
                          </div>
                        </>
                      )}
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3 md:col-span-2">
                        <label className="block text-xs font-semibold text-white/80 uppercase tracking-wide mb-1">Total Amount</label>
                        <p className="text-2xl font-bold text-white">₹{selectedBooking.totalAmount?.toLocaleString() || '0'}</p>
                      </div>
                      {selectedBooking.payment_gateway && (
                        <div className="bg-white rounded-lg p-3">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Gateway</label>
                          <p className="text-sm font-medium text-gray-900 capitalize">{selectedBooking.payment_gateway}</p>
                        </div>
                      )}
                      {selectedBooking.bookingDate && (
                        <div className="bg-white rounded-lg p-3">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Booking Date</label>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedBooking.bookingDate).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      )}
                      {selectedBooking.razorpay_payment_id && (
                        <div className="bg-white rounded-lg p-3 md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment ID</label>
                          <p className="text-xs font-mono text-gray-700 break-all">{selectedBooking.razorpay_payment_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.special_requests && (
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Special Requests
                      </h3>
                      <p className="text-sm text-gray-800 bg-white p-4 rounded-lg leading-relaxed">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookings 
