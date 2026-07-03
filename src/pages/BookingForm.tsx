import { CalendarIcon, EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import PaymentCancellationModal from '../components/PaymentCancellationModal'
import PaymentConfirmationModal from '../components/PaymentConfirmationModal'
import RoomUnavailableModal from '../components/RoomUnavailableModal'
import { useVilla } from '../contexts/VillaContext'
import { snapshotFromPriceBreakdown } from '../lib/booking-pricing'
import { calculateVillaBookingPrice, formatRupee, hasConfiguredVillaRates, resolveVillaNightlyRates } from '../lib/villa-pricing'
import { normalizeVillaSettings, resolveVillaGuestLimits } from '../lib/villa-settings'
import { loadRazorpayScript } from '../lib/razorpay'
import { netlifyFunctionUrl } from '../lib/netlify-functions'
import { resolveRoomImages, getDefaultVillaImages } from '../lib/room-images'
import { api } from '../lib/supabase'
interface BookingFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  special_requests: string
}

const BookingForm: React.FC = () => {
  const {
    settings: villaSettings,
    checkTimes: villaCheckTimes,
    displayName,
    loading: villaLoading,
    refreshVillaSettings,
  } = useVilla()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [room, setRoom] = useState<any>(null)
  const [villaHeroImage, setVillaHeroImage] = useState('')

  const effectiveVillaSettings = useMemo(() => {
    const normalized = normalizeVillaSettings(villaSettings)
    const roomRates = resolveVillaNightlyRates(room)
    return normalizeVillaSettings({
      ...normalized,
      price:
        normalized.price ||
        (roomRates.weekdayPrice > 0 ? String(roomRates.weekdayPrice) : ''),
    })
  }, [villaSettings, room])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' })
  const [dateError, setDateError] = useState('')
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

  const priceBreakdown = useMemo(() => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return null
    if (selectedDates.checkIn === selectedDates.checkOut) return null
    return calculateVillaBookingPrice({
      checkIn: selectedDates.checkIn,
      checkOut: selectedDates.checkOut,
      villaSettings: effectiveVillaSettings,
      roomFallback: room
        ? {
            weekday_price_per_night: room.weekday_price_per_night,
            weekend_price_per_night: room.weekend_price_per_night,
            price_per_night: room.price_per_night,
          }
        : undefined,
    })
  }, [
    selectedDates.checkIn,
    selectedDates.checkOut,
    effectiveVillaSettings,
    room,
  ])

  const hasConfiguredRates = hasConfiguredVillaRates(effectiveVillaSettings, room)
  const roomRates = resolveVillaNightlyRates(room)

  useEffect(() => {
    void refreshVillaSettings()
  }, [refreshVillaSettings])

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

  const subtotal = priceBreakdown?.subtotal ?? 0
  const totalAmount = priceBreakdown?.total ?? 0

  const { maxCapacity } = resolveVillaGuestLimits(effectiveVillaSettings, {
    roomMaxCapacity: room?.max_capacity,
  })
  const displayMaxGuests =
    room?.max_capacity && room.max_capacity > 0
      ? room.max_capacity
      : maxCapacity > 0
        ? maxCapacity
        : 0

  useEffect(() => {
    if (!room) {
      setVillaHeroImage('')
      return
    }

    let cancelled = false

    const loadVillaImage = async () => {
      let roomImageRecords = null
      try {
        roomImageRecords = await api.getRoomImages(room.id)
      } catch {
        roomImageRecords = null
      }

      if (!cancelled) {
        const images = resolveRoomImages(room, roomImageRecords)
        setVillaHeroImage(images[0] ?? getDefaultVillaImages()[0])
      }
    }

    void loadVillaImage()
    return () => {
      cancelled = true
    }
  }, [room])

  const paymentBlockReason = useMemo(() => {
    if (submitting) return null
    if (!room?.is_active) return 'This villa is not available for booking right now.'
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      return 'Select check-in and check-out dates to continue.'
    }
    if (selectedDates.checkIn === selectedDates.checkOut) {
      return 'Check-out must be at least one day after check-in.'
    }
    if (villaLoading && !hasConfiguredRates) return 'Loading villa rates…'
    if (!hasConfiguredRates) {
      return 'Villa nightly rate is not set up yet. Contact us to book.'
    }
    if (!priceBreakdown || totalAmount <= 0) {
      return 'Price could not be calculated for these dates. Try re-selecting dates or contact us.'
    }
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      return 'Enter your name, email, and phone number to proceed.'
    }
    return null
  }, [
    submitting,
    room?.is_active,
    selectedDates.checkIn,
    selectedDates.checkOut,
    villaLoading,
    hasConfiguredRates,
    priceBreakdown,
    totalAmount,
    formData.first_name,
    formData.last_name,
    formData.email,
    formData.phone,
  ])

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
      toast.error('Failed to load villa details')
      setLoading(false)
    }
  }

  const handleDateSelect = (startDate: string, endDate: string) => {
    setDateError('')

    if (startDate && endDate && startDate === endDate) {
      setDateError('Check-out date cannot be the same as check-in date. Please select different dates.')
      return
    }

    setSelectedDates({ checkIn: startDate, checkOut: endDate })

    if (startDate && endDate) {
      setShowCalendar(false)
      setTimeout(() => {
        void checkAvailability()
      }, 100)
    }
  }

  const clearDates = () => {
    setSelectedDates({ checkIn: '', checkOut: '' })
    setDateError('')
    setShowCalendar(true)
  }

  const calculateNights = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 0
    const checkIn = new Date(selectedDates.checkIn)
    const checkOut = new Date(selectedDates.checkOut)
    return Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const checkAvailability = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return true

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
          
          const orderResponse = await fetch(netlifyFunctionUrl('create-razorpay-order'), {
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
        name: displayName || 'Brick and Beam',
        description: `Booking for ${displayName || room.name}`,
        order_id: orderData.order.id,
        handler: (response: any) => handlePaymentSuccess(response, orderData),
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          booking_id: room.id,
          room_name: displayName,
          guest_name: `${formData.first_name} ${formData.last_name}`,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          booking_type: 'entire_villa',
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

    if (room && !room.is_active) {
      toast.error('This villa is currently unavailable for booking. Please contact us for more information.')
      return
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!priceBreakdown || totalAmount <= 0) {
      toast.error('Unable to calculate price. Check villa rates in admin settings or contact us.')
      return
    }

    const isAvailable = await checkAvailability()
    if (!isAvailable) {
      toast.error('Selected dates are not available')
      return
    }

    setShowPaymentConfirmationModal(true)
  }

  const processPayment = async () => {
    // Check if room is inactive
    if (room && !room.is_active) {
      toast.error('This villa is currently unavailable for booking. Please contact us for more information.')
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
          
          const orderResponse = await fetch(netlifyFunctionUrl('create-razorpay-order'), {
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
        name: displayName || 'Brick and Beam',
        description: `Booking for ${displayName || room.name}`,
        order_id: orderData.order.id,
        handler: (response: any) => handlePaymentSuccess(response, orderData),
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          booking_id: room.id,
          room_name: displayName,
          guest_name: `${formData.first_name} ${formData.last_name}`,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          booking_type: 'entire_villa',
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
      const bookingData = {
        room_id: room.id,
        room_name: displayName || room.name,
        check_in_date: selectedDates.checkIn,
        check_out_date: selectedDates.checkOut,
        num_guests: 1,
        num_extra_adults: 0,
        num_children_above_5: 0,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.special_requests,
        ...snapshotFromPriceBreakdown(priceBreakdown!, totalAmount, subtotal),
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Villa Not Found</h2>
          <p className="text-gray-600">The requested villa could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Book Entire Villa</h1>
            {/* Villa Details - Compact Horizontal Layout */}
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                {/* Room Image */}
                <div className="lg:col-span-4">
                  <img 
                    src={villaHeroImage || getDefaultVillaImages()[0]}
                    alt={displayName || room.name}
                    className="w-full h-48 lg:h-full min-h-[12rem] object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const fallback = getDefaultVillaImages()[0]
                      if (target.src !== fallback) {
                        target.src = fallback
                      }
                    }}
                  />
                </div>
                
                {/* Room Info - Compact */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h2>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Check-in & Check-out</p>
                        <p className="text-xs font-medium text-gray-700">In: {villaCheckTimes.check_in_time}</p>
                        <p className="text-xs font-medium text-gray-700">Out: {villaCheckTimes.check_out_time}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Booking type</p>
                        <p className="text-sm font-bold text-gray-900">Entire villa</p>
                        <p className="text-xs text-gray-500 mt-0.5">Flat rate for the full property</p>
                      </div>

                      {displayMaxGuests > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Guest capacity</p>
                          <p className="text-sm font-bold text-gray-900">Up to {displayMaxGuests} guests</p>
                          <p className="text-xs text-gray-500 mt-0.5">Maximum for this villa</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Booking Form - Full Width */}
            <div className="bg-white">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
                  {/* Left Column - Dates, guests, price */}
                  <div className="flex flex-col gap-6">
                  {/* Date Selection — same inline calendar as room detail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Check-in & Check-out Dates
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      disabled={!room?.is_active}
                      className="w-full bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <CalendarIcon className="h-5 w-5" />
                      <span className="font-medium">
                        {showCalendar ? 'Hide Calendar' : 'Select Dates from Calendar'}
                      </span>
                    </button>

                    {showCalendar && room && (
                      <div className="mt-4">
                        <AvailabilityCalendar
                          roomId={room.id}
                          onDateSelect={handleDateSelect}
                          selectedStartDate={selectedDates.checkIn}
                          selectedEndDate={selectedDates.checkOut}
                        />
                      </div>
                    )}

                    {showCalendar && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                        {!selectedDates.checkIn ? (
                          <p>Click a date in the calendar to select check-in</p>
                        ) : !selectedDates.checkOut ? (
                          <div>
                            <p className="font-medium">Check-in: {new Date(selectedDates.checkIn).toLocaleDateString()}</p>
                            <p>Click another date to select check-out</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">Selected range</p>
                            <p>Check-in: {new Date(selectedDates.checkIn).toLocaleDateString()}</p>
                            <p>Check-out: {new Date(selectedDates.checkOut).toLocaleDateString()}</p>
                            <p className="mt-1 font-medium">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {dateError && (
                      <p className="mt-2 text-sm text-red-600">{dateError}</p>
                    )}

                    {selectedDates.checkIn && selectedDates.checkOut && !showCalendar && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900 text-sm">Selected Dates</h4>
                          <button
                            type="button"
                            onClick={clearDates}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Change
                          </button>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p>Check-in: {new Date(selectedDates.checkIn).toLocaleDateString()}</p>
                          <p>Check-out: {new Date(selectedDates.checkOut).toLocaleDateString()}</p>
                          <p className="mt-1 font-medium">
                            {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:mt-auto flex flex-col gap-4">
                    {priceBreakdown ? (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Price Estimate</h3>
                        <dl className="space-y-2 text-sm">
                          {priceBreakdown.weekdayNights > 0 && (
                            <div className="flex justify-between gap-3">
                              <dt className="text-gray-600">
                                Weekday nights ({priceBreakdown.weekdayNights} ×{' '}
                                {formatRupee(priceBreakdown.weekdayPrice)})
                              </dt>
                              <dd className="font-medium text-gray-900 tabular-nums">
                                {formatRupee(priceBreakdown.weekdayNights * priceBreakdown.weekdayPrice)}
                              </dd>
                            </div>
                          )}
                          {priceBreakdown.weekendNights > 0 && (
                            <div className="flex justify-between gap-3">
                              <dt className="text-gray-600">
                                Saturday nights ({priceBreakdown.weekendNights} ×{' '}
                                {formatRupee(priceBreakdown.weekendPrice)})
                              </dt>
                              <dd className="font-medium text-gray-900 tabular-nums">
                                {formatRupee(priceBreakdown.weekendNights * priceBreakdown.weekendPrice)}
                              </dd>
                            </div>
                          )}
                          {priceBreakdown.weekdayNights === 0 && priceBreakdown.weekendNights === 0 && (
                            <div className="flex justify-between gap-3">
                              <dt className="text-gray-600">
                                Entire villa · {priceBreakdown.nights} night{priceBreakdown.nights !== 1 ? 's' : ''}
                              </dt>
                              <dd className="font-medium text-gray-900 tabular-nums">
                                {formatRupee(priceBreakdown.baseAmount)}
                              </dd>
                            </div>
                          )}
                          <div className="border-t-2 border-blue-300 pt-2 flex justify-between items-center gap-3">
                            <dt className="text-base font-semibold text-gray-900">Total</dt>
                            <dd className="text-xl font-bold text-blue-600 tabular-nums">
                              {formatRupee(priceBreakdown.total)}
                            </dd>
                          </div>
                        </dl>
                        <p className="text-xs text-blue-700 mt-3">
                          Flat rate for the entire villa on your selected dates.
                        </p>
                      </div>
                    ) : villaLoading ? (
                      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        Loading villa rates…
                      </p>
                    ) : (
                      selectedDates.checkIn &&
                      selectedDates.checkOut &&
                      room?.is_active &&
                      !hasConfiguredRates && (
                        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          Villa nightly rate is not configured yet. Contact us for a quote.
                        </p>
                      )
                    )}

                  </div>
                </div>

                {/* Right Column - Contact info */}
                <div className="flex flex-col gap-6">

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
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-y min-h-[4.5rem]"
                      placeholder="Any special requests or requirements..."
                    />
                  </div>

                  {(!selectedDates.checkIn || !selectedDates.checkOut) &&
                    !priceBreakdown &&
                    hasConfiguredRates && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Villa rates</h3>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        <li className="flex justify-between gap-2">
                          <span>Weekday (Mon–Fri, Sun)</span>
                          <span className="font-medium text-gray-900">
                            {formatRupee(roomRates.weekdayPrice)}/night
                          </span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span>Weekend (Saturday)</span>
                          <span className="font-medium text-gray-900">
                            {formatRupee(roomRates.weekendPrice)}/night
                          </span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span>Booking</span>
                          <span className="font-medium text-gray-900">Entire villa</span>
                        </li>
                        {displayMaxGuests > 0 && (
                          <li className="flex justify-between gap-2">
                            <span>Max guests</span>
                            <span className="font-medium text-gray-900">{displayMaxGuests} guests</span>
                          </li>
                        )}
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Select dates to see your total.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100">
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
                        <h4 className="text-sm font-semibold text-red-900 mb-1">Villa Currently Unavailable</h4>
                        <p className="text-sm text-red-800">This villa is temporarily unavailable for booking. Please contact us for more information or check back later.</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || paymentBlockReason !== null}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Processing...'
                    : priceBreakdown && totalAmount > 0
                      ? `Proceed to Pay ${formatRupee(totalAmount)}`
                      : 'Proceed to Payment'}
                </button>

                {paymentBlockReason && (
                  <p className="text-sm text-gray-600 text-center">{paymentBlockReason}</p>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Secure payment via Razorpay. You will review details before paying.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmationModal && room && selectedDates.checkIn && selectedDates.checkOut && (
        <PaymentConfirmationModal
          isOpen={showPaymentConfirmationModal}
          onClose={() => setShowPaymentConfirmationModal(false)}
          onProceed={processPayment}
          roomName={displayName}
          guestName={`${formData.first_name} ${formData.last_name}`}
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
