import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { api } from '../lib/supabase'

const BookingCancel: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handlePaymentCancel = async () => {
      try {
        // Get booking ID from URL params
        const urlParams = new URLSearchParams(location.search)
        const bookingId = urlParams.get('booking_id')

        if (bookingId) {
          // Fetch booking details
          const bookingData = await api.getBooking(bookingId)
          setBooking(bookingData)

          // Update booking status to cancelled
          await api.updateBooking(bookingId, {
            booking_status: 'cancelled',
            payment_status: 'cancelled'
          })
        }

        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    handlePaymentCancel()
  }, [location])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Processing cancellation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        
        {booking && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
            <p className="text-sm text-gray-600">Booking ID: #{booking.id}</p>
            <p className="text-sm text-gray-600">
              Check-in: {new Date(booking.check_in_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Check-out: {new Date(booking.check_out_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Total Amount: ₹{booking.total_amount}
            </p>
            <p className="text-sm text-red-600 font-medium">
              Status: Cancelled
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/rooms')}
            className="btn-primary w-full"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary w-full"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingCancel
