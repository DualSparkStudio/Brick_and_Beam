import { CheckCircleIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import type { Booking, Room } from '../lib/supabase'
import { api } from '../lib/supabase'

const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadBooking()
    }
  }, [id])

  const loadBooking = async () => {
    try {
      setLoading(true)
      const bookingData = await api.getBooking(parseInt(id!))
      setBooking(bookingData)
      
      if (bookingData.room_id) {
        const roomData = await api.getRoom(bookingData.room_id)
        setRoom(roomData)
      }
    } catch (error) {
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium mb-2">Loading booking confirmation...</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4">
            <p className="text-sm text-yellow-800 text-left">
              <strong>Please wait:</strong> The booking confirmation page might take a few seconds to display. 
              Please do not take any action (refresh, close tab, or click back) until the confirmation page appears.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/rooms')}
            className="btn-primary"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  const nights = calculateNights(booking.check_in_date, booking.check_out_date)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 sm:px-8 py-8 sm:py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-green-50 text-lg">Your reservation has been successfully created</p>
            <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
              <p className="text-white font-semibold">Booking ID: #{booking.id}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8">
            {/* Guest & Booking Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Guest Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Guest Information</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Name:</span>
                    <span className="font-semibold text-gray-900">{booking.first_name} {booking.last_name}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Email:</span>
                    <span className="font-medium text-gray-900 break-all">{booking.email}</span>
                  </div>
                  {booking.phone && (
                    <div className="flex items-start">
                      <span className="text-gray-600 w-24 flex-shrink-0">Phone:</span>
                      <span className="font-medium text-gray-900">{booking.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.booking_status === 'confirmed' ? 'bg-green-500 text-white' :
                      booking.booking_status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold text-gray-900">{new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold text-gray-900">{new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-semibold text-gray-900">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Guests:</span>
                    <span className="font-semibold text-gray-900">{2 + (booking.num_extra_adults || 0) + (booking.num_children_above_5 || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details Card */}
            {room && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Room Details
                </h2>
                <div className="flex items-center space-x-4">
                  <img
                    src={room.image_url}
                    alt={room.name}
                    className="w-24 h-24 object-cover rounded-xl shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                    <p className="text-gray-600 uppercase text-sm tracking-wide">{room.room_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payment Summary
              </h2>
              <div className="space-y-3">
                {booking.subtotal_amount && booking.gst_amount ? (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">₹{booking.subtotal_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>GST ({booking.gst_percentage || 12}%):</span>
                      <span className="font-semibold">₹{booking.gst_amount.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span>Room Rate (per night):</span>
                      <span className="font-semibold">₹{room?.price_per_night.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Number of Nights:</span>
                      <span className="font-semibold">{nights}</span>
                    </div>
                  </>
                )}
                <div className="border-t-2 border-green-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">₹{booking.total_amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-lg font-semibold ${
                  booking.payment_status === 'paid' ? 'bg-green-500 text-white' :
                  booking.payment_status === 'pending' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {booking.payment_status === 'paid' ? '✓ Payment Completed' :
                   booking.payment_status === 'pending' ? '⏳ Payment Pending' :
                   '✗ Payment Failed'}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Special Requests</h2>
                <p className="text-gray-700 leading-relaxed">{booking.special_requests}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => navigate('/rooms')}
                className="flex-1 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Book Another Room
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Back to Home
              </button>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Important Information
              </h3>
              <ul className="space-y-2 text-blue-50">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check-in time: 12:00 PM onwards</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check-out time: 10:00 AM</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check-in and check-out times are flexible depending on other bookings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Please bring a valid ID for check-in</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contact us if you need to modify your booking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation 
