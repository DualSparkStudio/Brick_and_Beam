import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    booking?: any;
    room?: any;
    platform?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    guestName?: string;
    numGuests?: number;
    phone?: string;
    email?: string;
    roomInfo?: string;
    totalAmount?: number;
  };
}

interface BookingDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  if (!isOpen || !event) return null;

  const isWebsiteBooking = true; // All bookings are from website now
  const booking = event.extendedProps.booking;
  const room = event.extendedProps.room;
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Not specified';
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
          onClick={onClose}
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
                    {event.extendedProps.bookingStatus?.toUpperCase()} • Website Booking
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
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
                  <p className="text-sm font-semibold text-gray-900">
                    {event.extendedProps.guestName || 'Not specified'}
                  </p>
                </div>
                {event.extendedProps.email && (
                  <div className="bg-white rounded-lg p-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                    <p className="text-sm font-medium text-gray-900 break-all">{event.extendedProps.email}</p>
                  </div>
                )}
                {event.extendedProps.phone && (
                  <div className="bg-white rounded-lg p-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                    <p className="text-sm font-medium text-gray-900">{event.extendedProps.phone}</p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Guests</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.extendedProps.numGuests || 'Not specified'}
                  </p>
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
                  <p className="text-sm font-semibold text-gray-900">
                    {event.extendedProps.roomInfo || 'Not specified'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Check-in</label>
                  <p className="text-sm font-medium text-gray-900">{new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Check-out</label>
                  <p className="text-sm font-medium text-gray-900">{new Date(event.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Base Adults</label>
                  <p className="text-sm font-semibold text-gray-900">2</p>
                </div>
                {booking?.num_extra_adults > 0 && (
                  <div className="bg-white rounded-lg p-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Extra Adults</label>
                    <p className="text-sm font-semibold text-gray-900">{booking.num_extra_adults}</p>
                  </div>
                )}
                {booking?.num_children_above_5 > 0 && (
                  <div className="bg-white rounded-lg p-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Children Above 5</label>
                    <p className="text-sm font-semibold text-gray-900">{booking.num_children_above_5}</p>
                  </div>
                )}
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
                  <span className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-full ${
                    getStatusColor(event.extendedProps.bookingStatus || '')
                  }`}>
                    {event.extendedProps.bookingStatus || 'Unknown'}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Status</label>
                  <span className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-full ${
                    getPaymentStatusColor(event.extendedProps.paymentStatus || '')
                  }`}>
                    {event.extendedProps.paymentStatus || 'Unknown'}
                  </span>
                </div>
                {(event.extendedProps.totalAmount || booking?.total_amount) && (
                  <>
                    {booking?.subtotal_amount && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subtotal</label>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{booking.subtotal_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {booking?.gst_amount && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GST ({booking.gst_percentage || 12}%)</label>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{booking.gst_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3 md:col-span-2">
                      <label className="block text-xs font-semibold text-white/80 uppercase tracking-wide mb-1">Total Amount</label>
                      <p className="text-2xl font-bold text-white">
                        ₹{(event.extendedProps.totalAmount || booking?.total_amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                {booking?.payment_gateway && (
                  <div className="bg-white rounded-lg p-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Gateway</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {booking.payment_gateway}
                    </p>
                  </div>
                )}
                {booking?.booking_date && (
                  <div className="bg-white rounded-lg p-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Booking Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.booking_date).toLocaleString('en-US', { 
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
                {booking?.payment_id && (
                  <div className="bg-white rounded-lg p-3 md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment ID</label>
                    <p className="text-xs font-mono text-gray-700 break-all">
                      {booking.payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {booking?.special_requests && (
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Special Requests
                </h3>
                <p className="text-sm text-gray-800 bg-white p-4 rounded-lg leading-relaxed">
                  {booking.special_requests}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 
