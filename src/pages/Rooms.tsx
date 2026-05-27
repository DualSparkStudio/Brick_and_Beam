import {
    CheckCircleIcon,
    MapPinIcon,
    StarIcon,
    UsersIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HouseRules from '../components/HouseRules'
import RoomUnavailableModal from '../components/RoomUnavailableModal'
import LogoLoader from '../components/LogoLoader'
import SEO from '../components/SEO'
import type { Room } from '../lib/supabase'
import { api } from '../lib/supabase'

const Rooms: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [roomTypes, setRoomTypes] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAmenities, setExpandedAmenities] = useState<{ [key: string]: boolean }>({})
  const [roomSlugs, setRoomSlugs] = useState<{ [key: number]: string }>({})
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [unavailableRoomName, setUnavailableRoomName] = useState<string | undefined>(undefined)
  
  // Get filter parameters from URL
  const numGuests = searchParams.get('guests')
  const checkInDate = searchParams.get('checkIn')
  const checkOutDate = searchParams.get('checkOut')

  useEffect(() => {
    loadRoomTypes()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [roomTypes, numGuests, checkInDate, checkOutDate])

  const filterRooms = async () => {
    let filtered = [...roomTypes]
    
    // Filter by guest capacity
    if (numGuests) {
      const guestCount = parseInt(numGuests)
      filtered = filtered.filter(room => room.max_capacity >= guestCount)
    }
    
    // Filter by availability (check if room is booked for selected dates)
    if (checkInDate && checkOutDate) {
      const availableRooms = await Promise.all(
        filtered.map(async (room) => {
          try {
            const result = await api.checkRoomAvailability(
              room.id,
              checkInDate,
              checkOutDate
            )
            // Check if the result has the 'available' property
            const isAvailable = typeof result === 'object' && result !== null && 'available' in result
              ? result.available
              : false
            return isAvailable ? room : null
          } catch (error) {
            console.error(`Error checking availability for room ${room.id}:`, error)
            return null
          }
        })
      )
      filtered = availableRooms.filter((room): room is Room => room !== null)
    }
    
    setFilteredRooms(filtered)
  }

  const loadRoomTypes = async () => {
    try {
      setLoading(true)
      const data = await api.getRooms()
      setRoomTypes(data || [])
      
      // Use existing slugs from the database
      const slugMap = (data || []).reduce((acc, room) => {
        if (room.slug) {
          acc[room.id] = room.slug
        }
        return acc
      }, {} as { [key: number]: string })
      
      setRoomSlugs(slugMap)
    } catch (error) {
      setRoomTypes([])
    } finally {
      setLoading(false)
    }
  }


  const toggleAmenities = (roomId: string) => {
    setExpandedAmenities(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }))
  }

  const handleRoomClick = (e: React.MouseEvent<HTMLAnchorElement>, room: Room) => {
    // Allow navigation to all rooms (both active and inactive)
    // Booking will be disabled on the RoomDetail page for inactive rooms
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LogoLoader size="lg" text="Loading Rooms..." />
      </div>
    )
  }

  return (
    <>
      <RoomUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false)
          setUnavailableRoomName(undefined)
        }}
        roomName={unavailableRoomName}
      />
      <SEO 
        title="Luxury Rooms & Accommodations - Resort Booking System"
        description="Explore our luxury rooms and accommodations at Resort Booking System. From deluxe suites to premium rooms, find your perfect stay."
        keywords="luxury rooms, Resort Booking System rooms, accommodation, premium rooms, resort rooms, booking system"
        url="https://riverbreezehomestay.com/rooms"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-dark-blue-800 to-golden-500">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Our Luxury Rooms</h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto">
                Discover comfort and elegance in our carefully designed accommodations
              </p>
            </div>
          </div>
        </section>

        {/* Rooms Grid */}
        <section className="py-8 sm:py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Info Banner */}
            {(numGuests || checkInDate || checkOutDate) && (
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Search Results</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      {numGuests && <p>• Guests: {numGuests}</p>}
                      {checkInDate && <p>• Check-in: {new Date(checkInDate).toLocaleDateString()}</p>}
                      {checkOutDate && <p>• Check-out: {new Date(checkOutDate).toLocaleDateString()}</p>}
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Showing {filteredRooms.length} available room{filteredRooms.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link
                    to="/rooms"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear filters
                  </Link>
                </div>
              </div>
            )}

            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms available</h3>
                <p className="text-gray-600 mb-4">
                  {(numGuests || checkInDate || checkOutDate)
                    ? 'No rooms match your search criteria. Try adjusting your dates or guest count.'
                    : 'No rooms are currently available.'}
                </p>
                {(numGuests || checkInDate || checkOutDate) && (
                  <Link
                    to="/rooms"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View all rooms
                  </Link>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 sm:gap-8 auto-rows-fr ${
                filteredRooms.length === 1 
                  ? 'grid-cols-1 max-w-4xl mx-auto' 
                  : filteredRooms.length === 2
                  ? 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
              }`}>
                {filteredRooms.map((room) => {
                  // Get the primary image or first image from room.images array
                  const getMainImage = () => {
                    if (room.images && room.images.length > 0) {
                      // Use the first valid image from the images array
                      const firstValidImage = room.images.find((img: string) => img && img.trim())
                      if (firstValidImage) return firstValidImage
                    }
                    
                    // Fallback to main image_url
                    return room.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  }
                  
                  const mainImage = getMainImage()
                  
                  return (
                    <div key={room.id} className={`room-card group ${!room.is_active ? 'opacity-75' : ''}`}>
                      <div className="relative overflow-hidden">
                        <img
                          src={mainImage}
                          alt={room.name}
                          className={`room-image group-hover:scale-105 transition-transform duration-500 ${!room.is_active ? 'grayscale' : ''}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {!room.is_active && (
                          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold z-10">
                            Currently Unavailable
                          </div>
                        )}
                        <div className="price-badge text-sm sm:text-base">
                          ₹{room.price_per_night.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{room.name}</h3>
                          {!room.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{room.description}</p>
                        
                        {/* Room Stats */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="text-center">
                            <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mx-auto mb-1" />
                            <div className="text-xs sm:text-sm text-gray-600">Rating</div>
                            <div className="font-semibold text-sm sm:text-base text-gray-900">5.0</div>
                          </div>
                          <div className="text-center">
                            <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
                            <div className="text-xs sm:text-sm text-gray-600">Max Capacity</div>
                            <div className="font-semibold text-xs sm:text-sm text-gray-900">
                              {room.max_capacity ? `${room.max_capacity} Guests` : '4 Guests'}
                            </div>
                          </div>
                          <div className="text-center">
                            <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
                            <div className="text-xs sm:text-sm text-gray-600">Location</div>
                            <div className="font-semibold text-xs sm:text-sm text-gray-900">Valley View</div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="mb-4 sm:mb-6">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {room.amenities && room.amenities.slice(0, 3).map((amenity: string, index: number) => (
                              <span key={index} className="amenity-badge text-xs">
                                {amenity}
                              </span>
                            ))}
                            {room.amenities && room.amenities.length > 3 && !expandedAmenities[room.id] && (
                              <button 
                                onClick={() => toggleAmenities(room.id)}
                                className="amenity-badge text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                              >
                                +{room.amenities.length - 3} more
                              </button>
                            )}
                            {room.amenities && room.amenities.length > 3 && expandedAmenities[room.id] && (
                              <>
                                {room.amenities.slice(3).map((amenity: string, index: number) => (
                                  <span key={index + 3} className="amenity-badge text-xs">
                                    {amenity}
                                  </span>
                                ))}
                                <button 
                                  onClick={() => toggleAmenities(room.id)}
                                  className="amenity-badge text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                                >
                                  Show less
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <Link
                            to={roomSlugs[room.id] ? `/room/${roomSlugs[room.id]}` : '#'}
                            onClick={(e) => handleRoomClick(e, room)}
                            className="flex-1 btn-primary text-center text-sm sm:text-base"
                          >
                            View Details
                          </Link>
                          <Link
                            to={roomSlugs[room.id] ? `/room/${roomSlugs[room.id]}` : '#'}
                            onClick={(e) => handleRoomClick(e, room)}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2.5 px-4 sm:py-3 sm:px-6 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-center text-sm sm:text-base block"
                          >
                            <span className="inline-block">Book Now</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* House Rules Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <HouseRules />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Rooms?</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Experience luxury and comfort with our world-class amenities and exceptional service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-800" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Every room is meticulously designed with premium materials and finishes
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Exceptional Service</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our dedicated staff ensures your comfort and satisfaction throughout your stay
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Prime Location</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Enjoy stunning views and easy access to all the best attractions and amenities
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Rooms 
