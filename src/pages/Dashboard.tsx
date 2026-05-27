import {
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    MapPinIcon,
    UsersIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Booking } from '../lib/supabase'
import { api } from '../lib/supabase'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await api.getBookings(user?.id)
      
      // Generate slugs for rooms that don't have them
      const bookingsWithSlugs = await Promise.all(
        data.map(async (booking) => {
          if (booking.room && !booking.room.slug) {
            try {
              const slug = await api.generateCrypticSlug(booking.room.name, booking.room.id)
              return {
                ...booking,
                room: {
                  ...booking.room,
                  slug
                }
              }
            } catch (error) {
              // Fallback to simple slug
              return {
                ...booking,
                room: {
                  ...booking.room,
                  slug: api.generateSlug(booking.room.name)
                }
              }
            }
          }
          return booking
        })
      )
      
      setBookings(bookingsWithSlugs)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'refunded':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCancelBooking = async (bookingId: number) => {
    // Show confirmation toast with action buttons
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to cancel this booking?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                // Get the booking details before cancelling
                const booking = bookings.find(b => b.id === bookingId)
                if (!booking) {
                  toast.error('Booking not found')
                  return
                }

                // Cancel the booking
                const cancelledBooking = await api.cancelBooking(bookingId)
                
                // Send cancellation email notification
                try {
                  // Get room details
                  const room = await api.getRoom(booking.room_id)
                  
                  // Send cancellation email
                  const { EmailService } = await import('../lib/email-service')
                  const emailResult = await EmailService.sendBookingCancellation(cancelledBooking, room)
                  
                  if (emailResult.success) {
                    toast.success('Booking cancelled and notification emails sent!')
                  } else {
                    toast.error('Booking cancelled but email notification failed.')
                  }
                } catch (emailError) {
                  toast.error('Booking cancelled but email notification failed.')
                }
                
                loadBookings() // Reload bookings
              } catch (error) {
                toast.error('Failed to cancel booking. Please try again.')
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            No, Keep It
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      icon: '⚠️'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.first_name}!</p>
            </div>
            <Link
              to="/rooms"
              className="btn-primary"
            >
              Book New Room
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.booking_status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.booking_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-purple-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{bookings.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start your journey by booking your first room.</p>
              <Link
                to="/rooms"
                className="btn-primary"
              >
                Browse Rooms
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={booking.room?.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                            alt={booking.room?.name || booking.room_name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.room?.name || (booking.room_name ? `${booking.room_name} (Deleted)` : 'Unknown Room')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.room?.room_number ? `Room ${booking.room.room_number}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.check_in_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(booking.check_out_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{booking.num_guests}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{booking.total_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={booking.room?.slug ? `/room/${booking.room.slug}` : '#'}
                            className="text-blue-800 hover:text-blue-900"
                          >
                            View
                          </Link>
                          {booking.booking_status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-800 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/rooms"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="h-5 w-5 text-blue-800 mr-3" />
                <span className="text-gray-700">Book New Room</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UsersIcon className="h-5 w-5 text-green-800 mr-3" />
                <span className="text-gray-700">Update Profile</span>
              </Link>
              <Link
                to="/contact"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPinIcon className="h-5 w-5 text-purple-800 mr-3" />
                <span className="text-gray-700">Contact Support</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Stay</h3>
            {bookings.filter(b => b.booking_status === 'confirmed' && new Date(b.check_in_date) > new Date()).length > 0 ? (
              <div>
                {bookings
                  .filter(b => b.booking_status === 'confirmed' && new Date(b.check_in_date) > new Date())
                  .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())
                  .slice(0, 1)
                  .map(booking => (
                    <div key={booking.id} className="space-y-3">
                      <div className="flex items-center">
                        <img
                          src={booking.room?.image_url}
                          alt={booking.room?.name}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {booking.room?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(booking.check_in_date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Check-in: {booking.check_in_time} | Check-out: {booking.check_out_time}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No upcoming stays</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Our support team is available 24/7 to assist you with any questions or concerns.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-gray-700">Free cancellation up to 24h</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-gray-700">Secure payment processing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-gray-700">Instant booking confirmation</span>
                </div>
              </div>
              <Link
                to="/contact"
                className="btn-secondary w-full text-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 
