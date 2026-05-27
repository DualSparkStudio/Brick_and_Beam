import { CalendarIcon, EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import PaymentCancellationModal from '../components/PaymentCancellationModal'
import PaymentConfirmationModal from '../components/PaymentConfirmationModal'
import RoomUnavailableModal from '../components/RoomUnavailableModal'
import { loadRazorpayScript } from '../lib/razorpay'
import { api } from '../lib/supabase'

interface BookingFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  special_requests: string
}

const BookingForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const [numExtraGuests, setNumExtraGuests] = useState(0)
  const [numChildren, setNumChildren] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [gstAmount, setGstAmount] = useState(0)
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [initialDate, setInitialDate] = useState<string>('')
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [cancellationType, setCancellationType] = useState<'cancelled' | 'failed'>('cancelled')
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false)
  const paymentHandledRef = useRef(false)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const razorpayInstanceRef = useRef<any>(null)

  const [formData, setFormData] = useState<BookingFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    special_requests: ''
  })

  // Helper function to calculate total amount with new pricing structure
  const calculateTotalAmount = (checkInDate: string, checkOutDate: string, extraGuests: number, children: number) => {
    if (!room || !checkInDate || !checkOutDate) return { subtotal: 0, gst: 0, total: 0 }
    
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    // Base price for couple (2 adults)
    const basePricePerNight = typeof room.price_per_night === 'string' ? parseFloat(room.price_per_night) : (room.price_per_night || 0)
    
    // Extra guest price per night
    const extraGuestPrice = typeof room.extra_guest_price === 'string' ? parseFloat(room.extra_guest_price) : (room.extra_guest_price || 0)
    
    // Child above 5 years price per night
    const childPrice = typeof room.child_above_5_price === 'string' ? parseFloat(room.child_above_5_price) : (room.child_above_5_price || 0)
    
    // GST percentage
    const gstPercentage = typeof room.gst_percentage === 'string' ? parseFloat(room.gst_percentage) : (room.gst_percentage || 12)
    
    // Calculate subtotal
    const baseAmount = basePricePerNight * nights
    const extraGuestsAmount = extraGuestPrice * extraGuests * nights
    const childrenAmount = childPrice * children * nights
    
    const subtotal = baseAmount + extraGuestsAmount + childrenAmount
    
    // Calculate GST
    const gst = (subtotal * gstPercentage) / 100
    
    // Total with GST
    const total = subtotal + gst
    
    return { subtotal, gst, total }
  }

  useEffect(() => {
    loadRazorpayScript().catch(() => {})
    
    // Check if we have state passed from RoomDetail (for dates only)
    if (location.state) {
      const { selectedDates: passedDates } = location.state as any
      
      if (passedDates) {
        setSelectedDates(passedDates)
      }
    }
    
    // Always load fresh room data from API to ensure we have the latest values
    loadRoomData()
    
    // Cleanup function to clear timers when component unmounts
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      // Reset payment state
      paymentHandledRef.current = false
      setSubmitting(false)
    }
  }, [slug, location.state])

  // Recalculate total when dates, guests, or room changes
  useEffect(() => {
    if (room && selectedDates?.checkIn && selectedDates?.checkOut) {
      const { subtotal: calcSubtotal, gst: calcGst, total: calcTotal } = calculateTotalAmount(
        selectedDates.checkIn, 
        selectedDates.checkOut, 
        numExtraGuests, 
        numChildren
      )
      setSubtotal(calcSubtotal)
      setGstAmount(calcGst)
      setTotalAmount(calcTotal)
    }
  }, [selectedDates, numExtraGuests, numChildren, room])

  const loadRoomData = async () => {
    try {
      if (!slug) return
      
      // Get room with any status (including inactive)
      const roomData = await api.getRoomBySlugAnyStatus(slug)
      
      // Room exists, set it (even if inactive - we'll disable booking)
      setRoom(roomData)
      
      // If room is inactive, show unavailable modal but still render the form
      if (roomData && !roomData.is_active) {
        setShowUnavailableModal(true)
      }
      
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load room details')
      setLoading(false)
    }
  }

  const handleDateClick = (date: string) => {
    if (!selectedDates) {
      setSelectedDates({ checkIn: date, checkOut: date })
      setInitialDate(date)
    } else if (!selectedDates.checkOut || selectedDates.checkIn === selectedDates.checkOut) {
      if (date < selectedDates.checkIn) {
        setSelectedDates({ checkIn: date, checkOut: selectedDates.checkIn })
      } else {
        setSelectedDates({ checkIn: selectedDates.checkIn, checkOut: date })
      }
    } else {
      setSelectedDates({ checkIn: date, checkOut: date })
      setInitialDate(date)
    }
  }

  const handleCalendarClose = () => {
    setShowCalendar(false)
  }

  const handleCalendarConfirm = () => {
    if (selectedDates?.checkIn && selectedDates?.checkOut) {
      const { subtotal: calcSubtotal, gst: calcGst, total: calcTotal } = calculateTotalAmount(
        selectedDates.checkIn, 
        selectedDates.checkOut, 
        numExtraGuests, 
        numChildren
      )
      setSubtotal(calcSubtotal)
      setGstAmount(calcGst)
      setTotalAmount(calcTotal)
      setShowCalendar(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const checkAvailability = async () => {
    if (!selectedDates?.checkIn || !selectedDates?.checkOut) return true

    // Check if check-in and check-out are the same date
    if (selectedDates.checkIn === selectedDates.checkOut) {
      toast.error('Check-out date cannot be the same as check-in date. Please select different dates.')
      return false
    }

    try {
      // Use the comprehensive availability checking function
      const availability = await api.checkRoomAvailability(
        room.id,
        selectedDates.checkIn,
        selectedDates.checkOut
      )
      
      return availability.available
    } catch (error) {
      return true
    }
  }

  const handleRetryPayment = async () => {
    // Validate form data before retrying
    if (!selectedDates?.checkIn || !selectedDates?.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const isAvailable = await checkAvailability()
    if (!isAvailable) {
      toast.error('Selected dates are not available')
      return
    }

    setSubmitting(true)

    try {
      
      // Show loading message for user
      toast.loading('Preparing payment gateway...', { id: 'payment-prep' })
      
      // Create Razorpay order
      let orderData: any
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          
          // Update loading message
          if (retryCount > 0) {
            toast.loading(`Retrying payment setup... (${retryCount}/${maxRetries})`, { id: 'payment-prep' })
          }
          
          const orderResponse = await fetch('/.netlify/functions/create-razorpay-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              currency: 'INR',
              receipt: `booking_${room.id}`, // Use room ID for receipt
              notes: {
                booking_id: room.id, // Use room ID for notes
                room_name: room.name,
                guest_name: `${formData.first_name} ${formData.last_name}`,
              },
            }),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })

          
          if (!orderResponse.ok) {
            const errorText = await orderResponse.text()
            throw new Error(`Failed to create payment order: ${errorText}`)
          }

          orderData = await orderResponse.json()
          
          if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create payment order')
          }
          
          // If we get here, the request was successful
          toast.success('Payment gateway ready!', { id: 'payment-prep' })
          break
          
        } catch (error) {
          retryCount++
          
          if (retryCount >= maxRetries) {
            toast.error('Failed to create payment order. Please try again.', { id: 'payment-prep' })
            setSubmitting(false)
            return
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }

      // Open Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount,
        currency: 'INR',
        name: 'Resort Booking System',
        description: `Booking for ${room.name}`,
        order_id: orderData.order.id,
        handler: (response: any) => handlePaymentSuccess(response, orderData),
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          booking_id: room.id,
          room_name: room.name,
          guest_name: `${formData.first_name} ${formData.last_name}`,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          guests: 2 + numExtraGuests + numChildren,
          amount: totalAmount
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: () => {
        setSubmitting(false)
        setCancellationType('cancelled')
        setShowCancellationModal(true)
        
            // Show a sweet notification
        toast.dismiss() // Clear any existing toasts
        toast.error(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Payment Cancelled</div>
              <div className="text-sm text-orange-100">Don't worry, you can try again anytime!</div>
            </div>
          </div>,
          { 
            duration: 5000,
            id: 'payment-cancelled-toast',
            style: {
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              borderRadius: '12px',
              padding: '16px'
            }
          }
        )
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      
      // Handle payment failure
      razorpay.on('payment.failed', (response: any) => {
        setSubmitting(false)
        setCancellationType('failed')
        setShowCancellationModal(true)
        
        // Show a sweet notification
        toast.dismiss() // Clear any existing toasts
        toast.error(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Payment Failed</div>
              <div className="text-sm text-red-100">Please check your payment details and try again.</div>
            </div>
          </div>,
          { 
            duration: 5000,
            id: 'payment-failed-toast',
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              padding: '16px'
            }
          }
        )
      })
      
      razorpay.open()
      
    } catch (error) {
      toast.error('Failed to process payment. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if room is inactive
    if (room && !room.is_active) {
      toast.error('This room is currently unavailable for booking. Please contact us for more information.')
      return
    }
    
    if (!selectedDates?.checkIn || !selectedDates?.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const isAvailable = await checkAvailability()
    if (!isAvailable) {
      toast.error('Selected dates are not available')
      return
    }

    // Show payment confirmation modal instead of directly processing payment
    setShowPaymentConfirmationModal(true)
  }

  const processPayment = async () => {
    // Check if room is inactive
    if (room && !room.is_active) {
      toast.error('This room is currently unavailable for booking. Please contact us for more information.')
      return
    }

    if (!selectedDates?.checkIn || !selectedDates?.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    setShowPaymentConfirmationModal(false)
    setSubmitting(true)

    try {
      
      // Check if we're on localhost - bypass Razorpay for testing
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (isLocalhost) {
        // Localhost bypass - create booking directly without payment
        toast.loading('Creating booking (localhost mode)...', { id: 'payment-prep' })
        
        // Simulate payment success with mock data
        const mockPaymentResponse = {
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_order_id: `mock_order_${Date.now()}`,
          razorpay_signature: 'mock_signature'
        }
        
        const mockOrderData = {
          order: {
            id: `mock_order_${Date.now()}`,
            amount: totalAmount,
            currency: 'INR'
          }
        }
        
        // Wait a moment to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Process the booking
        await handlePaymentSuccess(mockPaymentResponse, mockOrderData)
        return
      }
      
      // Production flow - use Razorpay
      // Show loading message for user
      toast.loading('Preparing payment gateway...', { id: 'payment-prep' })
      
      // Create Razorpay order
      let orderData: any
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          
          // Update loading message
          if (retryCount > 0) {
            toast.loading(`Retrying payment setup... (${retryCount}/${maxRetries})`, { id: 'payment-prep' })
          }
          
          const orderResponse = await fetch('/.netlify/functions/create-razorpay-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              currency: 'INR',
              receipt: `booking_${room.id}`, // Use room ID for receipt
              notes: {
                booking_id: room.id, // Use room ID for notes
                room_name: room.name,
                guest_name: `${formData.first_name} ${formData.last_name}`,
              },
            }),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })

          
          if (!orderResponse.ok) {
            const errorText = await orderResponse.text()
            throw new Error(`Failed to create payment order: ${errorText}`)
          }

          orderData = await orderResponse.json()
          
          if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create payment order')
          }
          
          // If we get here, the request was successful
          toast.success('Payment gateway ready!', { id: 'payment-prep' })
          break
          
        } catch (error) {
          retryCount++
          
          if (retryCount >= maxRetries) {
            toast.error('Failed to create payment order. Please try again.', { id: 'payment-prep' })
            setSubmitting(false)
            return
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }

      // Open Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount,
        currency: 'INR',
        name: 'Resort Booking System',
        description: `Booking for ${room.name}`,
        order_id: orderData.order.id,
        handler: (response: any) => handlePaymentSuccess(response, orderData),
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          booking_id: room.id,
          room_name: room.name,
          guest_name: `${formData.first_name} ${formData.last_name}`,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          guests: 2 + numExtraGuests + numChildren,
          amount: totalAmount
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: () => {
             setSubmitting(false)
             setCancellationType('cancelled')
             setShowCancellationModal(true)
             
            // Show a sweet notification
            toast.dismiss() // Clear any existing toasts
             toast.error(
               <div className="flex items-center space-x-3">
                 <div className="flex-shrink-0">
                   <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </div>
                 <div>
                   <div className="font-semibold text-white">Payment Cancelled</div>
                  <div className="text-sm text-orange-100">Don't worry, you can try again anytime!</div>
                 </div>
               </div>,
               { 
                 duration: 5000,
                id: 'payment-cancelled-toast',
                 style: {
                   background: 'linear-gradient(135deg, #f97316, #ea580c)',
                   borderRadius: '12px',
                   padding: '16px'
                 }
               }
             )
           }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpayInstanceRef.current = razorpay
      
      // Reset payment handled flag for new payment attempt
      paymentHandledRef.current = false
      
            // Handle payment failure
      razorpay.on('payment.failed', (response: any) => {
        paymentHandledRef.current = true
        setSubmitting(false)
        
        // Clear fallback timer
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
        
        // Show failure notification
        toast.dismiss() // Clear any existing toasts
        toast.error(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Payment Failed</div>
              <div className="text-sm text-red-100">Please check your payment details and try again.</div>
            </div>
          </div>,
          { 
            duration: 5000,
            id: 'payment-failed-toast',
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              padding: '16px'
            }
          }
        )
      })
      razorpay.open()
       
    } catch (error) {
      toast.error('Failed to process payment. Please try again.')
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (response: any, orderData: any) => {
    
    // Clear fallback timer and mark payment as completed
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    
    // Mark payment as handled to prevent fallback detection
    paymentHandledRef.current = true
    
    // Set submitting to false to ensure button state is correct
    setSubmitting(false)
    try {
      // Calculate total number of guests (2 base adults + extra adults + children)
      const totalGuests = 2 + numExtraGuests + numChildren
      
      // Create booking only after successful payment
      const bookingData = {
        room_id: room.id,
        room_name: room.name, // Store room name for preservation after deletion
        check_in_date: selectedDates.checkIn,
        check_out_date: selectedDates.checkOut,
        num_guests: totalGuests,
        num_extra_adults: numExtraGuests,
        num_children_above_5: numChildren,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.special_requests,
        total_amount: totalAmount,
        subtotal_amount: subtotal,
        gst_amount: gstAmount,
        gst_percentage: room?.gst_percentage || 12,
        booking_status: 'confirmed',
        payment_status: 'paid',
        payment_gateway: 'razorpay',
        razorpay_order_id: orderData?.order?.id,
        razorpay_payment_id: response.razorpay_payment_id
      }

      const booking = await api.createBooking(bookingData)

      // Send confirmation emails
      try {
        const { EmailService } = await import('../lib/email-service')
        const emailResult = await EmailService.sendBookingConfirmation(booking, room)
        
        if (emailResult.success) {
          // Email sent successfully
        } else {
          console.warn('⚠️ Email notification failed:', emailResult.error)
        }
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError)
        // Don't fail the booking if email fails
      }

      // Show success notification
      toast.dismiss() // Clear any existing toasts
      toast.success(
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white">Payment Successful!</div>
            <div className="text-sm text-green-100">Redirecting to booking confirmation...</div>
          </div>
        </div>,
        { 
          duration: 3000,
          id: 'payment-success-toast',
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            padding: '16px'
          }
        }
      )

      // Navigate to booking confirmation page immediately after payment
      navigate(`/booking/confirmation/${booking.id}`, { 
        replace: true
      })

    } catch (error) {
      toast.error('Payment successful but booking creation failed. Please contact support.')
      setSubmitting(false)
    }
  }

  // If showing unavailable modal, don't render booking form
  if (showUnavailableModal) {
    return (
      <RoomUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false)
          navigate('/rooms')
        }}
        roomName={undefined}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600">The requested room could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Book {room.name}</h1>
            
            {/* Room Details - Compact Horizontal Layout */}
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                {/* Room Image */}
                <div className="lg:col-span-4">
                  <img 
                    src={room.image_url} 
                    alt={room.name}
                    className="w-full h-48 lg:h-full object-cover rounded-lg shadow-md"
                  />
                </div>
                
                {/* Room Info - Compact */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h2>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      {/* Price */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Price per night</p>
                        <p className="text-lg font-bold text-blue-600">₹{room.price_per_night}</p>
                        <p className="text-xs text-gray-500">for couple</p>
                      </div>
                      
                      {/* Check-in/Check-out */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Check-in & Check-out</p>
                        <p className="text-xs font-medium text-gray-700">In: {room?.check_in_time || '1:00 PM'}</p>
                        <p className="text-xs font-medium text-gray-700">Out: {room?.check_out_time || '10:00 AM'}</p>
                      </div>
                      
                      {/* Capacity */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Max Capacity</p>
                        <p className="text-lg font-bold text-gray-900">{room.max_capacity || 4}</p>
                        <p className="text-xs text-gray-500">guests</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Amenities - Compact */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 8).map((amenity: string, index: number) => (
                          <span key={index} className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 8 && (
                          <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{room.amenities.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Form - Full Width */}
            <div className="bg-white">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Date Selection and Guest Info */}
                  <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Dates
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(true)}
                      disabled={!room?.is_active}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 text-gray-900"
                    >
                      <span className="text-gray-900">
                        {selectedDates 
                          ? `${new Date(selectedDates.checkIn).toLocaleDateString()} - ${new Date(selectedDates.checkOut).toLocaleDateString()}`
                          : 'Select check-in and check-out dates'
                        }
                      </span>
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Base Adults Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Base Adults (2)</p>
                        <p className="text-xs text-gray-500 mt-1">Base price includes 2 adults (couple)</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{room?.price_per_night?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500">per night</div>
                      </div>
                    </div>
                  </div>

                  {/* Max Capacity Warning */}
                  {room?.max_capacity && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Maximum Capacity:</span> {room.max_capacity} guests
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Total guests (base adults + extra adults + children) cannot exceed {room.max_capacity}
                      </p>
                    </div>
                  )}

                  {/* Total Guests Counter */}
                  {(() => {
                    const totalGuests = 2 + numExtraGuests + numChildren
                    const maxCapacity = room?.max_capacity || 10
                    const isOverCapacity = totalGuests > maxCapacity
                    
                    return (
                      <div className={`border rounded-lg p-3 ${isOverCapacity ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isOverCapacity ? 'text-red-800' : 'text-green-800'}`}>
                            Total Guests: {totalGuests}
                          </span>
                          {isOverCapacity && (
                            <span className="text-xs text-red-600 font-semibold">
                              Exceeds max capacity!
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Extra Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extra Adults
                    </label>
                    <input
                      type="number"
                      value={numExtraGuests}
                      onBeforeInput={(e: any) => {
                        // Intercept before the value changes
                        const input = e.target as HTMLInputElement
                        const currentValue = parseInt(input.value) || 0
                        const newChar = e.data
                        
                        if (newChar && /\d/.test(newChar)) {
                          const potentialValue = parseInt(input.value + newChar) || 0
                          const maxCapacity = room?.max_capacity || 10
                          const totalGuests = 2 + potentialValue + numChildren
                          
                          if (totalGuests > maxCapacity) {
                            e.preventDefault()
                            toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                              duration: 4000,
                              icon: '⚠️'
                            })
                          }
                        }
                      }}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0)
                        const maxCapacity = room?.max_capacity || 10
                        const maxAllowed = Math.max(0, maxCapacity - 2 - numChildren)
                        const totalGuests = 2 + value + numChildren
                        
                        // Check if trying to exceed max capacity
                        if (value > maxAllowed || totalGuests > maxCapacity) {
                          toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                            duration: 4000,
                            icon: '⚠️'
                          })
                          return
                        }
                        
                        setNumExtraGuests(value)
                      }}
                      onKeyDown={(e) => {
                        const currentValue = numExtraGuests
                        const maxCapacity = room?.max_capacity || 10
                        const maxAllowed = Math.max(0, maxCapacity - 2 - numChildren)
                        
                        // Check for arrow up or any number key that would exceed limit
                        if (e.key === 'ArrowUp' && currentValue >= maxAllowed) {
                          e.preventDefault()
                          toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                            duration: 4000,
                            icon: '⚠️'
                          })
                        } else if (/^\d$/.test(e.key)) {
                          // User is typing a number
                          const input = e.target as HTMLInputElement
                          const selectionStart = input.selectionStart || 0
                          const selectionEnd = input.selectionEnd || 0
                          const currentText = input.value
                          const newText = currentText.substring(0, selectionStart) + e.key + currentText.substring(selectionEnd)
                          const potentialValue = parseInt(newText) || 0
                          const totalGuests = 2 + potentialValue + numChildren
                          
                          if (totalGuests > maxCapacity) {
                            e.preventDefault()
                            toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                              duration: 4000,
                              icon: '⚠️'
                            })
                          }
                        }
                      }}
                      onInput={(e) => {
                        // Additional safety check on input event
                        const input = e.target as HTMLInputElement
                        const value = parseInt(input.value) || 0
                        const maxCapacity = room?.max_capacity || 10
                        const maxAllowed = Math.max(0, maxCapacity - 2 - numChildren)
                        
                        if (value > maxAllowed) {
                          input.value = maxAllowed.toString()
                          toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests`, {
                            duration: 4000,
                            icon: '⚠️'
                          })
                        }
                      }}
                      disabled={!room?.is_active || (room?.max_capacity && (2 + numChildren) >= room.max_capacity)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 text-gray-900"
                      placeholder="0"
                    />
                    {room?.extra_guest_price > 0 && (
                      <p className="mt-1 text-xs text-gray-500">₹{room.extra_guest_price.toLocaleString()} per extra adult per night</p>
                    )}
                    {(() => {
                      const maxCapacity = room?.max_capacity || 10
                      const remainingCapacity = maxCapacity - 2 - numChildren
                      if (remainingCapacity <= 0) {
                        return (
                          <p className="mt-1 text-xs text-red-600 font-semibold">
                            ⚠️ Maximum capacity reached. Cannot add more adults.
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>

                  {/* Children Above 5 Years */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Children Above 5 Years
                    </label>
                    <input
                      type="number"
                      value={numChildren}
                      onBeforeInput={(e: any) => {
                        // Intercept before the value changes
                        const input = e.target as HTMLInputElement
                        const currentValue = parseInt(input.value) || 0
                        const newChar = e.data
                        
                        if (newChar && /\d/.test(newChar)) {
                          const potentialValue = parseInt(input.value + newChar) || 0
                          const maxCapacity = room?.max_capacity || 10
                          const totalGuests = 2 + numExtraGuests + potentialValue
                          
                          if (totalGuests > maxCapacity) {
                            e.preventDefault()
                            toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                              duration: 4000,
                              icon: '⚠️'
                            })
                          }
                        }
                      }}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0)
                        const maxCapacity = room?.max_capacity || 10
                        const maxAllowed = Math.max(0, maxCapacity - 2 - numExtraGuests)
                        const totalGuests = 2 + numExtraGuests + value
                        
                        // Check if trying to exceed max capacity
                        if (value > maxAllowed || totalGuests > maxCapacity) {
                          toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                            duration: 4000,
                            icon: '⚠️'
                          })
                          return
                        }
                        
                        setNumChildren(value)
                      }}
                      onKeyDown={(e) => {
                        const currentValue = numChildren
                        const maxCapacity = room?.max_capacity || 10
                        const maxAllowed = Math.max(0, maxCapacity - 2 - numExtraGuests)
                        
                        // Check for arrow up or any number key that would exceed limit
                        if (e.key === 'ArrowUp' && currentValue >= maxAllowed) {
                          e.preventDefault()
                          toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                            duration: 4000,
                            icon: '⚠️'
                          })
                        } else if (/^\d$/.test(e.key)) {
                          // User is typing a number
                          const input = e.target as HTMLInputElement
                          const selectionStart = input.selectionStart || 0
                          const selectionEnd = input.selectionEnd || 0
                          const currentText = input.value
                          const newText = currentText.substring(0, selectionStart) + e.key + currentText.substring(selectionEnd)
                          const potentialValue = parseInt(newText) || 0
                          const totalGuests = 2 + numExtraGuests + potentialValue
                          
                          if (totalGuests > maxCapacity) {
                            e.preventDefault()
                            toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests (currently ${2 + numExtraGuests + numChildren} guests)`, {
                              duration: 4000,
                              icon: '⚠️'
                            })
                          }
                        }
                      }}
                      onInput={(e) => {
                        // Additional safety check on input event
                        const input = e.target as HTMLInputElement
                        const value = parseInt(input.value) || 0
                        const maxCapacity = room?.max_capacity || 10
                        const maxAllowed = Math.max(0, maxCapacity - 2 - numExtraGuests)
                        
                        if (value > maxAllowed) {
                          input.value = maxAllowed.toString()
                          toast.error(`Cannot add more guests! Maximum capacity is ${maxCapacity} guests`, {
                            duration: 4000,
                            icon: '⚠️'
                          })
                        }
                      }}
                      disabled={!room?.is_active || (room?.max_capacity && (2 + numExtraGuests) >= room.max_capacity)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 text-gray-900"
                      placeholder="0"
                    />
                    {room?.child_above_5_price > 0 && (
                      <p className="mt-1 text-xs text-gray-500">₹{room.child_above_5_price.toLocaleString()} per child per night</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Children below 5 years are free</p>
                    {(() => {
                      const maxCapacity = room?.max_capacity || 10
                      const remainingCapacity = maxCapacity - 2 - numExtraGuests
                      if (remainingCapacity <= 0) {
                        return (
                          <p className="mt-1 text-xs text-red-600 font-semibold">
                            ⚠️ Maximum capacity reached. Cannot add more children.
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>

                  {/* Booking Terms */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Booking Terms</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>• If the guest agrees with the house rules can book the stay by paying full amount at the time of booking.</p>
                      <p>• Any change, modification can be allowed if feasible and possible.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Info and Price */}
                <div className="space-y-6">

              {/* Guest Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                          name="first_name"
                          value={formData.first_name}
                    onChange={handleInputChange}
                    required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="First Name"
                  />
                      </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                        name="last_name"
                        value={formData.last_name}
                    onChange={handleInputChange}
                    required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Last Name"
                  />
                </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                  </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="your.email@example.com"
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}"
                        title="Please enter a valid email address"
                  />
                </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                  </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        maxLength={10}
                  />
                </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Any special requests or requirements..."
                    />
                  </div>

                  {/* Price Breakdown */}
                  {totalAmount > 0 && selectedDates?.checkIn && selectedDates?.checkOut && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const nights = Math.ceil((new Date(selectedDates.checkOut).getTime() - new Date(selectedDates.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                          
                          // Calculate breakdown - ensure numbers are valid
                          const basePricePerNight = parseFloat(room?.price_per_night) || 0
                          const baseAmount = basePricePerNight * nights
                          
                          const extraGuestPrice = parseFloat(room?.extra_guest_price) || 0
                          const extraGuestsAmount = extraGuestPrice * numExtraGuests * nights
                          
                          const childPrice = parseFloat(room?.child_above_5_price) || 0
                          const childrenAmount = childPrice * numChildren * nights
                          
                          const gstPercentage = parseFloat(room?.gst_percentage) || 12
                          
                          return (
                            <>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Base Price (2 Adults, {nights} night{nights !== 1 ? 's' : ''}):
                                  </span>
                                  <span className="font-medium text-gray-900">₹{baseAmount.toFixed(0)}</span>
                                </div>
                                
                                {numExtraGuests > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Extra Adults ({numExtraGuests} × ₹{extraGuestPrice.toFixed(0)} × {nights} night{nights !== 1 ? 's' : ''}):
                                    </span>
                                    <span className="font-medium text-gray-900">₹{extraGuestsAmount.toFixed(0)}</span>
                                  </div>
                                )}
                                
                                {numChildren > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Children Above 5 ({numChildren} × ₹{childPrice.toFixed(0)} × {nights} night{nights !== 1 ? 's' : ''}):
                                    </span>
                                    <span className="font-medium text-gray-900">₹{childrenAmount.toFixed(0)}</span>
                                  </div>
                                )}
                                
                                <div className="border-t border-blue-200 pt-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Subtotal:</span>
                                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(0)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    GST ({gstPercentage}%):
                                  </span>
                                  <span className="font-medium text-gray-900">₹{gstAmount.toFixed(0)}</span>
                                </div>
                              </div>
                              
                              <div className="border-t-2 border-blue-300 pt-3 mt-3">
                                <div className="flex justify-between">
                                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                  <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(0)}</span>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Width Bottom Section */}
              <div className="space-y-6">
                {/* Room Unavailable Message */}
                {room && !room.is_active && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold text-red-900 mb-1">Room Currently Unavailable</h4>
                        <p className="text-sm text-red-800">This room is temporarily unavailable for booking. Please contact us for more information or check back later.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !room?.is_active || !selectedDates || totalAmount === 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {!room?.is_active ? (
                    'Room Unavailable'
                  ) : submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
                
                {/* Help Text */}
                {(!selectedDates || totalAmount === 0) && room?.is_active && (
                  <p className="text-sm text-gray-600 text-center">
                    {!selectedDates 
                      ? 'Please select check-in and check-out dates above'
                      : 'Please confirm your dates in the calendar to calculate the total amount'}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Dates</h3>
              <button
                onClick={handleCalendarClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <AvailabilityCalendar
              roomId={room.id}
              onDateClick={handleDateClick}
              selectedDates={selectedDates}
              initialDate={initialDate}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleCalendarClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            <button
                onClick={handleCalendarConfirm}
                disabled={!selectedDates?.checkIn || !selectedDates?.checkOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Confirm Dates
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmationModal && room && selectedDates && (
        <PaymentConfirmationModal
          isOpen={showPaymentConfirmationModal}
          onClose={() => setShowPaymentConfirmationModal(false)}
          onProceed={processPayment}
          roomName={room.name}
          guestName={`${formData.first_name} ${formData.last_name}`}
          guestCount={2 + numExtraGuests + numChildren}
          checkIn={selectedDates.checkIn}
          checkOut={selectedDates.checkOut}
          totalAmount={totalAmount}
        />
      )}

      {/* Payment Cancellation Modal */}
      <PaymentCancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onRetry={() => {
          setShowCancellationModal(false)
          // Retry payment by showing confirmation modal again
          setShowPaymentConfirmationModal(true)
        }}
        onGoHome={() => {
          setShowCancellationModal(false)
          navigate('/')
        }}
        onContactSupport={() => {
          setShowCancellationModal(false)
          navigate('/contact')
        }}
        cancellationType={cancellationType}
      />
    </div>
  )
}

export default BookingForm 
