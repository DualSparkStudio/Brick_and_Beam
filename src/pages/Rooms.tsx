import { CheckCircleIcon, MapPinIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HouseRules from '../components/HouseRules'
import LogoLoader from '../components/LogoLoader'
import SEO from '../components/SEO'
<<<<<<< HEAD
import PageHero from '../components/PageHero'
import { PAGE_HERO_IMAGES } from '../config/galleryImages'
=======
import VillaDetailsSection from '../components/VillaDetailsSection'
import { useVilla } from '../contexts/VillaContext'
import { resolveVillaGuestLimits } from '../lib/villa-settings'
>>>>>>> 9f9f3922271f7bb3a97135500fa67d5e3b1f6a45
import type { Room } from '../lib/supabase'
import { api } from '../lib/supabase'
import { normalizeImageUrl } from '../utils/imageUrl'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

function getRoomImages(room: Room): string[] {
  const fromArray = (room.images || []).filter((img) => img && img.trim())
  if (fromArray.length > 0) return fromArray
  if (room.image_url?.trim()) return [room.image_url]
  return [FALLBACK_IMAGE]
}

function getRoomLabel(room: Room, index: number): string {
  if (room.room_number?.trim()) return room.room_number
  if (room.name?.trim()) return room.name
  return `Room ${index + 1}`
}

const Rooms: React.FC = () => {
  const { settings: villaSettings, displayName } = useVilla()
  const [searchParams] = useSearchParams()
  const [roomTypes, setRoomTypes] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [roomSlugs, setRoomSlugs] = useState<{ [key: number]: string }>({})

  const numGuests = searchParams.get('guests')
  const checkInDate = searchParams.get('checkIn')
  const checkOutDate = searchParams.get('checkOut')
  const primaryBookRoom = filteredRooms.find((room) => room.is_active && roomSlugs[room.id])
  const { includedCapacity: displayedCapacity, maxCapacity: villaMaxCapacity } =
    resolveVillaGuestLimits(villaSettings)
  const guestFilterCount = numGuests ? parseInt(numGuests, 10) : 0
  const guestsExceedVillaMax =
    guestFilterCount > 0 && villaMaxCapacity > 0 && guestFilterCount > villaMaxCapacity

  useEffect(() => {
    loadRoomTypes()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [roomTypes, numGuests, checkInDate, checkOutDate, villaMaxCapacity])

  const filterRooms = async () => {
    let filtered = [...roomTypes]

    if (numGuests) {
      const guestCount = parseInt(numGuests, 10)
      if (!Number.isNaN(guestCount) && guestCount > 0 && villaMaxCapacity > 0 && guestCount > villaMaxCapacity) {
        filtered = []
      }
    }

    if (checkInDate && checkOutDate) {
      const availableRooms = await Promise.all(
        filtered.map(async (room) => {
          try {
            const result = await api.checkRoomAvailability(room.id, checkInDate, checkOutDate)
            const isAvailable =
              typeof result === 'object' && result !== null && 'available' in result
                ? result.available
                : false
            return isAvailable ? room : null
          } catch {
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

      const slugMap = (data || []).reduce(
        (acc, room) => {
          if (room.slug) acc[room.id] = room.slug
          return acc
        },
        {} as { [key: number]: string }
      )
      setRoomSlugs(slugMap)
    } catch {
      setRoomTypes([])
    } finally {
      setLoading(false)
    }
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
<<<<<<< HEAD
      <RoomUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false)
          setUnavailableRoomName(undefined)
        }}
        roomName={unavailableRoomName}
      />
      <SEO 
        title="Luxury Rooms & Accommodations - Brick and Beam"
        description="Explore our luxury rooms and accommodations at Brick and Beam. From deluxe suites to premium rooms, find your perfect stay."
        keywords="luxury rooms, Brick and Beam rooms, accommodation, premium rooms, resort rooms, booking system"
        url="https://riverbreezehomestay.com/rooms"
      />
      <div className="min-h-screen bg-gray-50">
        <PageHero
          title="Our Luxury Villa"
          subtitle="Discover comfort and elegance in our private hill-station retreat"
          image={PAGE_HERO_IMAGES.rooms}
        />
=======
      <SEO
        title={`Villa Spaces - ${displayName}`}
        description="Explore our villa spaces, room layout, and photos. Booking is for the entire villa experience."
        keywords="villa rooms, villa layout, whole villa booking, accommodations"
        url="https://riverbreezehomestay.com/rooms"
      />
      <div className="min-h-screen bg-gray-50">
        <section className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-dark-blue-800 to-golden-500">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Our Villa Spaces</h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto">
                Book the entire villa — browse each room and its photos below
              </p>
            </div>
          </div>
        </section>
>>>>>>> 9f9f3922271f7bb3a97135500fa67d5e3b1f6a45

        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Whole Villa Booking</h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    All rooms are included when you book the villa.
                  </p>
                  {displayedCapacity > 0 && (
                    <p className="text-sm text-blue-700 mt-2 font-medium">
                      Capacity: ~{displayedCapacity} guests
                      {villaMaxCapacity > displayedCapacity && (
                        <span className="text-blue-600 font-normal"> · max {villaMaxCapacity}</span>
                      )}
                    </p>
                  )}
                </div>
                {primaryBookRoom ? (
                  <Link
                    to={`/book/${roomSlugs[primaryBookRoom.id]}`}
                    className="inline-flex justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
                  >
                    Book Entire Villa
                  </Link>
                ) : (
                  <Link
                    to="/contact"
                    className="inline-flex justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  >
                    Contact for Availability
                  </Link>
                )}
              </div>
            </div>

            {(numGuests || checkInDate || checkOutDate) && (
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between gap-4">
                <div className="text-sm text-blue-800">
                  {numGuests && <p>Guests: {numGuests}</p>}
                  {checkInDate && <p>Check-in: {new Date(checkInDate).toLocaleDateString()}</p>}
                  {checkOutDate && <p>Check-out: {new Date(checkOutDate).toLocaleDateString()}</p>}
                  <p className="mt-1 font-medium">{filteredRooms.length} room(s) shown</p>
                </div>
                <Link to="/rooms" className="text-sm text-blue-600 hover:underline shrink-0">
                  Clear filters
                </Link>
              </div>
            )}

            {filteredRooms.length === 0 ? (
              <div className="text-center py-16">
                <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms to show</h3>
                <p className="text-gray-600">
                  {guestsExceedVillaMax
                    ? `The villa accommodates up to ${villaMaxCapacity} guests. Try fewer guests or contact us.`
                    : 'Try clearing filters or check back later.'}
                </p>
              </div>
            ) : (
<<<<<<< HEAD
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
                      const firstValidImage = room.images.find((img: string) => img && img.trim())
                      if (firstValidImage) return normalizeImageUrl(firstValidImage)
                    }

                    return normalizeImageUrl(
                      room.image_url ||
                      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    )
                  }
                  
                  const mainImage = getMainImage()
                  
=======
              <div className="space-y-14 sm:space-y-20">
                {filteredRooms.map((room, index) => {
                  const images = getRoomImages(room)
                  const label = getRoomLabel(room, index)

>>>>>>> 9f9f3922271f7bb3a97135500fa67d5e3b1f6a45
                  return (
                    <article
                      key={room.id}
                      className={`${!room.is_active ? 'opacity-80' : ''}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 sm:mb-6 border-b border-gray-200 pb-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{label}</h2>
                        {!room.is_active && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-red-700 bg-red-50 px-3 py-1 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {room.description && (
                        <p className="text-gray-600 mb-5 sm:mb-6 max-w-3xl text-sm sm:text-base">
                          {room.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {images.map((src, imgIndex) => (
                          <div
                            key={`${room.id}-${imgIndex}`}
                            className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[4/3]"
                          >
                            <img
                              src={src}
                              alt={`${label} — photo ${imgIndex + 1}`}
                              className={`w-full h-full object-cover ${!room.is_active ? 'grayscale' : ''}`}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = FALLBACK_IMAGE
                              }}
                            />
                          </div>
                        ))}
                      </div>

                    </article>
                  )
                })}
              </div>
            )}

            <div className="mt-14 sm:mt-16">
              <VillaDetailsSection settings={villaSettings} />
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-700 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                More about this space
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <HouseRules />
          </div>
        </section>

        <section className="py-10 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Book the Entire Villa?</h3>
            <p className="text-gray-600 mb-6">Select your dates and reserve the full villa stay.</p>
            {primaryBookRoom ? (
              <Link
                to={`/book/${roomSlugs[primaryBookRoom.id]}`}
                className="inline-flex px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600"
              >
                Book Entire Villa
              </Link>
            ) : (
              <Link
                to="/contact"
                className="inline-flex px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Contact for Booking
              </Link>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Our Villa Stay?</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Experience comfort with our amenities and exceptional service
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-7 w-7 text-blue-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600 text-sm">Carefully designed spaces with premium finishes</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Exceptional Service</h3>
                <p className="text-gray-600 text-sm">Dedicated support throughout your stay</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Prime Location</h3>
                <p className="text-gray-600 text-sm">Stunning views and easy access to attractions</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Rooms
