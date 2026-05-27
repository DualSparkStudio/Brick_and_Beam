import { CalendarIcon, CheckCircleIcon, PhoneIcon, XCircleIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/supabase'

interface BookingSuccessProps {
  bookingId?: string
  paymentId?: string
}

const BookingSuccess: React.FC<BookingSuccessProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [adminContactInfo, setAdminContactInfo] = useState<{ email: string; phone?: string; address?: string; name?: string }>({ email: '' })
  const [globalTimes, setGlobalTimes] = useState({ check_in_time: '', check_out_time: '' })

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get booking ID from URL params or state
        const urlParams = new URLSearchParams(location.search)
        const bookingId = urlParams.get('booking_id') || location.state?.bookingId
        const paymentId = location.state?.paymentId
        const bookingDataFromState = location.state?.bookingData

        if (!bookingId && !bookingDataFromState) {
          setError('Booking information not found')
          setLoading(false)
          return
        }

        // If we have booking data from state, use it directly
        if (bookingDataFromState) {
          setBooking(bookingDataFromState)
          setPaymentId(paymentId)
          
          // Fetch room details
          if (bookingDataFromState.room_id) {
            const roomData = await api.getRoom(bookingDataFromState.room_id)
            setRoom(roomData)
          }
          
          setLoading(false)
          return
        }

        // Otherwise, fetch booking data from API
        if (bookingId) {
          const bookingData = await api.getBooking(parseInt(bookingId))
          
          if (!bookingData) {
            setError('Booking not found')
            setLoading(false)
            return
          }

          setBooking(bookingData)
          setPaymentId(paymentId)
          
          // Fetch room details
          if (bookingData.room_id) {
            const roomData = await api.getRoom(bookingData.room_id)
            setRoom(roomData)
          }
        }

        setLoading(false)
      } catch (error) {
        setError('Failed to load booking details')
        setLoading(false)
      }
    }

    handlePaymentSuccess()
    ;(async () => {
      try {
        const info = await api.getAdminInfo()
        setAdminContactInfo({
          email: info.email,
          phone: info.phone,
          address: info.address,
          name: `${info.first_name || ''} ${info.last_name || ''}`.trim()
        })
      } catch (e) {
        // ignore, fall back to defaults below
      }
    })()

    // Load room-specific times from room data (not booking data)
    if (room) {
      setGlobalTimes({
        check_in_time: room.check_in_time || '1:00 PM',
        check_out_time: room.check_out_time || '10:00 AM'
      })
    } else {
      // Fallback to defaults if room data not available
      setGlobalTimes({
        check_in_time: '1:00 PM',
        check_out_time: '10:00 AM'
      })
    }
  }, [location.search, location.state, room])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your booking details.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const nights = calculateNights(booking.check_in_date, booking.check_out_date)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 print:bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center mb-8 shadow-lg print:bg-white print:text-black print:border print:border-green-600 print:shadow-none">
          <div className="flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-12 w-12 mr-3 print:hidden" />
            <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          </div>
          <p className="text-xl opacity-90 print:opacity-100">Thank you for choosing Resort Booking System</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border print:border-gray-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white print:bg-white print:text-black">
            <h2 className="text-2xl font-bold mb-2">Dear {booking.first_name} {booking.last_name},</h2>
            <p className="text-blue-100 print:text-gray-800">Your booking has been successfully confirmed! We're excited to welcome you to Resort Booking System.</p>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Booking Details */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 print:bg-white print:border print:border-gray-300">
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">#{booking.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Confirmed
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-semibold">{room?.name ? (room.is_deleted ? `${room.name} (Deleted)` : room.name) : 'Unknown Room'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-semibold">
                        {formatDate(booking.check_in_date)} • {globalTimes.check_in_time || '1:00 PM'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-semibold">
                        {formatDate(booking.check_out_date)} • {globalTimes.check_out_time || '11:00'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Nights:</span>
                      <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Guests:</span>
                      <span className="font-semibold">{booking.num_guests} guest{booking.num_guests !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-green-600">₹{booking.total_amount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Important Information */}
              <div className="space-y-6">
                <div className="bg-yellow-50 rounded-xl p-6 print:bg-white print:border print:border-gray-300">
                  <div className="flex items-center mb-4">
                    <PhoneIcon className="h-6 w-6 text-yellow-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Important Information</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Time:</span>
                      <span className="font-semibold">{globalTimes.check_in_time || '1:00 PM'} onwards</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out Time:</span>
                      <span className="font-semibold">{globalTimes.check_out_time || '10:00 AM'}</span>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-yellow-200">
                      <p className="text-xs text-yellow-800 italic">
                        * Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-semibold text-right">{adminContactInfo.address || 'Address will be shared by host'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 print:bg-white print:border print:border-gray-300">
                  <div className="flex items-center mb-4">
                    <PhoneIcon className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold">{adminContactInfo.phone || '—'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">{adminContactInfo.email || '—'}</span>
                    </div>
                    
                    {adminContactInfo.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">WhatsApp:</span>
                        <span className="font-semibold">{adminContactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                This is an automated notification from Resort Booking System. 
                If you have any questions, please contact us directly.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Contact Support
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Save/Print
          </button>
        </div>

        {/* Quick actions removed as requested */}
      </div>
    </div>
  )
}

export default BookingSuccess 
