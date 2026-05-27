import {
    ArrowLeftIcon,
    CalendarIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MapPinIcon,
    StarIcon,
    UsersIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import HouseRules from '../components/HouseRules'
import RoomUnavailableModal from '../components/RoomUnavailableModal'
import type { Room } from '../lib/supabase'
import { api } from '../lib/supabase'

const RoomDetail: React.FC = () => {
  
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState({
    checkIn: '',
    checkOut: ''
  })
  const [numGuests, setNumGuests] = useState(1)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [showCalendar, setShowCalendar] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [dateError, setDateError] = useState<string>('')
  const [availabilityMessage, setAvailabilityMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)

  useEffect(() => {
    if (slug) {
      loadRoom()
    }
  }, [slug])

  // Auto-check availability when dates are selected
  useEffect(() => {
    if (selectedDates.checkIn && selectedDates.checkOut && room) {
      checkAvailability()
    }
  }, [selectedDates.checkIn, selectedDates.checkOut, room])

  const loadRoom = async () => {
    try {
      setLoading(true)
      
      if (slug) {
        try {
          // First try to get room with any status to check if it exists
          const foundRoom = await api.getRoomBySlugAnyStatus(slug)
          
          // Room exists, set it (even if inactive - we'll just disable booking)
          setRoom(foundRoom)
        } catch (error) {
          // Room not found or error
          setRoom(null)
        }
      } else {
        setRoom(null)
      }
    } catch (error) {
      setRoom(null)
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut || !room) return

    try {
      setCheckingAvailability(true)
      
      // Use the enhanced availability checking function
      const availability = await api.checkRoomAvailability(
        room.id,
        selectedDates.checkIn,
        selectedDates.checkOut
      )
      
      
      if (availability.available) {
        // Room is available, show how many rooms are available
        const availableRooms = availability.availableRooms || 1
        setAvailableRooms([{ id: room.id, room_number: room?.room_number || '1' }])
        // Show success message in green
        if (availableRooms > 1) {
          setAvailabilityMessage({
            text: `${availableRooms} rooms available for these dates`,
            type: 'success'
          })
        } else {
          setAvailabilityMessage({
            text: 'Room available for selected dates',
            type: 'success'
          })
        }
        setDateError('') // Clear any error
      } else {
        // Room is not available - show error message in red
        setAvailableRooms([])
        
        if (availability.availableRooms === 0) {
          setAvailabilityMessage({
            text: 'All rooms of this type are booked for the selected dates',
            type: 'error'
          })
        } else if (availability.availableRooms && availability.availableRooms > 0) {
          setAvailabilityMessage({
            text: `Only ${availability.availableRooms} room(s) available for these dates`,
            type: 'error'
          })
        } else {
          setAvailabilityMessage({
            text: 'Selected dates are not available. Please choose different dates.',
            type: 'error'
          })
        }
        setDateError('') // Clear old error
      }
    } catch (error) {
      // For demo purposes, set some available rooms if API fails
      setAvailableRooms([{ id: room.id, room_number: room?.room_number || '1' }])
    } finally {
      setCheckingAvailability(false)
    }
  }

  const calculateNights = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 0
    const checkIn = new Date(selectedDates.checkIn)
    const checkOut = new Date(selectedDates.checkOut)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!room) return 0
    const nights = calculateNights()
    
    // Determine base price based on occupancy
    // Convert to number if it's a string (from database)
    const priceTriple = typeof room.price_triple_occupancy === 'string' ? parseFloat(room.price_triple_occupancy) : (room.price_triple_occupancy || 0)
    const priceDouble = typeof room.price_double_occupancy === 'string' ? parseFloat(room.price_double_occupancy) : (room.price_double_occupancy || 0)
    
    let basePricePerNight = 0
    
    if (priceTriple > 0 && numGuests === 3) {
      basePricePerNight = priceTriple
    } else if (priceDouble > 0 && numGuests >= 2) {
      basePricePerNight = priceDouble
    } else {
      basePricePerNight = typeof room.price_per_night === 'string' ? parseFloat(room.price_per_night) : (room.price_per_night || 0)
    }
    
    const baseAmount = basePricePerNight * nights
    
    return baseAmount
  }

  const handleBooking = () => {
    // Check if room is inactive
    if (room && !room.is_active) {
      toast.error('This room is currently unavailable for booking. Please contact us for more information.')
      return
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (availableRooms.length === 0) {
      toast.error('No rooms available for selected dates')
      return
    }

    const bookingState = {
      room,
      selectedDates,
      availableRooms
    }
    
    // Use the current slug from the URL
    navigate(`/book/${slug}`, { state: bookingState })
  }

  const handleDateSelect = (startDate: string, endDate: string) => {
    // Clear any existing errors when new dates are selected
    setDateError('')
    setAvailabilityMessage(null)
    
    // Validate that check-out is not the same as check-in
    if (startDate && endDate && startDate === endDate) {
      setDateError('Check-out date cannot be the same as check-in date. Please select different dates.')
      return // Don't update the dates
    }
    
    setSelectedDates({
      checkIn: startDate,
      checkOut: endDate
    })
    
    // Only close calendar and mark as selected from calendar when both dates are selected
    if (startDate && endDate) {
      setShowCalendar(false) // Close calendar only after both dates are selected
      // Explicitly trigger availability check
      setTimeout(() => checkAvailability(), 100)
    }
  }

  const clearDates = () => {
    setSelectedDates({
      checkIn: '',
      checkOut: ''
    })
    setAvailableRooms([])
    setDateError('') // Clear any error messages
    setAvailabilityMessage(null) // Clear availability message
  }

  // Image gallery functions
  const getRoomImages = () => {
    if (!room) return []
    
    // Get images from room.images array (multiple images)
    if (room.images && room.images.length > 0) {
      return room.images.filter((img: string) => img && img.trim())
    }
    
    // Fallback to main image_url
    return room.image_url ? [room.image_url] : []
  }

  const nextImage = () => {
    const images = getRoomImages()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = getRoomImages()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  // If showing unavailable modal, don't render room content
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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <p className="text-gray-600 mb-6">The room you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/rooms')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/rooms')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Rooms</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-1">
            {/* Room Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
            </div>

            {/* Room Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              {(() => {
                const images = getRoomImages()
                if (images.length === 0) {
                  return (
                    <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No images available</span>
                    </div>
                  )
                }
                
                return (
                  <div className="relative">
                    <img
                      src={images[currentImageIndex]}
                      alt={`${room.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-auto max-h-[600px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(images[currentImageIndex], '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {/* Click to view full size indicator */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Click to view full size
                    </div>
                    
                    {/* Navigation arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                      </>
                    )}
                    
                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                )
              })()}
              
              {/* Thumbnail Gallery */}
              {(() => {
                const images = getRoomImages()
                if (images.length > 1) {
                  return (
                    <div className="mt-4">
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                              index === currentImageIndex 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${room.name} - Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-500">
                        Click thumbnails to view different images • Click main image to view full size
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>

            {/* Room Video Section */}
            {room.video_url && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Room Video Tour</h3>
                </div>
                <div className="relative">
                  <video
                    src={room.video_url}
                    controls
                    className="w-full max-h-[600px] object-contain"
                    poster={getRoomImages()[0] || undefined}
                    onError={(e) => {
                      console.error('Video failed to load');
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Room Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="mb-6">
                <p className="text-gray-600 text-lg">{room.description}</p>
              </div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="text-right ml-auto">
                  <div className="text-3xl font-bold text-blue-800">₹{room.price_per_night.toLocaleString()}</div>
                  <div className="text-gray-500">per night</div>
                </div>
              </div>

              {/* Accommodation Details */}
              {room.accommodation_details && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Accommodation Details</h4>
                  <p className="text-blue-700">
                    {room.accommodation_details}
                  </p>
                </div>
              )}

              {/* Room Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <StarIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="font-semibold text-gray-900">5.0</div>
                </div>
                <div className="text-center">
                  <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Max Capacity</div>
                  <div className="font-semibold text-gray-900">
                    {room.max_capacity ? `${room.max_capacity} Guests` : '4 Guests'}
                  </div>
                </div>
                <div className="text-center">
                  <MapPinIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-semibold text-gray-900">Valley View</div>
                </div>
                <div className="text-center">
                  <CheckCircleIcon className={`h-8 w-8 mx-auto mb-2 ${room.is_active ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`font-semibold ${room.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {room.is_active ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities && room.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                  {!room.amenities || room.amenities.length === 0 && (
                    <div className="col-span-full text-gray-500 text-center py-4">
                      No amenities listed for this room.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <HouseRules />
            </div>

            {/* Room Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About This Room</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {room.description}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Experience the perfect blend of luxury and comfort in this beautifully appointed room. 
                Every detail has been carefully curated to ensure your stay is nothing short of exceptional. 
                From the premium bedding to the state-of-the-art amenities, you'll find everything you need 
                for a memorable vacation.
              </p>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              {/* Room Unavailable Message */}
              {room && !room.is_active && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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

              {/* Availability Message - Green for success, Red for error */}
              {availabilityMessage && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  availabilityMessage.type === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {availabilityMessage.type === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        availabilityMessage.type === 'success' 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {availabilityMessage.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Error Message */}
              {dateError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{dateError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-6">Book This Room</h3>
              
              {/* Calendar Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  disabled={!room?.is_active}
                  className="w-full bg-blue-50 text-blue-700 py-3 px-6 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <CalendarIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {showCalendar ? 'Hide Calendar' : 'Select Dates from Calendar'}
                  </span>
                </button>
              </div>

              {/* Calendar Component - Positioned exactly below the button */}
              {showCalendar && (
                <div className="mb-6">
                  <AvailabilityCalendar
                    roomId={room.id}
                    onDateSelect={handleDateSelect}
                    selectedStartDate={selectedDates.checkIn}
                    selectedEndDate={selectedDates.checkOut}
                    isHover={false}
                  />
                </div>
              )}

              {/* Calendar Selection Status */}
              {showCalendar && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Calendar Selection</h4>
                  <div className="text-xs text-blue-800">
                    {!selectedDates.checkIn ? (
                      <p>Click a date in the calendar to select check-in</p>
                    ) : !selectedDates.checkOut ? (
                      <div>
                        <p className="font-medium">Check-in: {new Date(selectedDates.checkIn).toLocaleDateString()}</p>
                        <p>Click another date to select check-out</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Selected Range:</p>
                        <p>Check-in: {new Date(selectedDates.checkIn).toLocaleDateString()}</p>
                        <p>Check-out: {new Date(selectedDates.checkOut).toLocaleDateString()}</p>
                        <p className="mt-1 font-medium">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Dates Display */}
              {selectedDates.checkIn && selectedDates.checkOut && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Selected Dates</h4>
                    <button
                      onClick={clearDates}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Change
                    </button>
                  </div>
                  <div className="text-sm text-blue-800">
                    <div>Check-in: {new Date(selectedDates.checkIn).toLocaleDateString()}</div>
                    <div>Check-out: {new Date(selectedDates.checkOut).toLocaleDateString()}</div>
                    <div className="mt-1 font-medium">
                      {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Availability Results */}
              {checkingAvailability && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="font-semibold text-blue-800">Checking Availability...</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Please wait while we check availability for your selected dates.
                  </p>
                </div>
              )}

              {!checkingAvailability && availableRooms.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Available!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available for your selected dates.
                  </p>
                </div>
              )}

              {!checkingAvailability && selectedDates.checkIn && selectedDates.checkOut && availableRooms.length === 0 && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-red-800">Not Available</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Sorry, this room is not available for the selected dates. Please try different dates.
                  </p>
                </div>
              )}

              {/* Book Now Button */}
              <button
                onClick={handleBooking}
                disabled={!room?.is_active || !selectedDates.checkIn || !selectedDates.checkOut || checkingAvailability || availableRooms.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!room?.is_active
                  ? 'Room Unavailable'
                  : !selectedDates.checkIn || !selectedDates.checkOut 
                    ? 'Select Dates to Book' 
                    : checkingAvailability
                      ? 'Checking Availability...' 
                      : availableRooms.length === 0 
                        ? 'Not Available' 
                        : 'Select Dates to Book'
                }
              </button>

              {/* Check-in & Check-out Times Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-base font-semibold text-blue-900 mb-3">Check-in & Check-out Times</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-900">Check-in:</span>
                    <span className="text-blue-700 ml-2">12PM onwards</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Check-out:</span>
                    <span className="text-blue-700 ml-2">10AM</span>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-3 italic">
                  * Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail 
