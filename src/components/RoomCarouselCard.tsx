import { memo } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import type { Room } from '../lib/supabase'
import { formatVillaPriceBadge } from '../lib/villa-pricing'
import { normalizeImageUrl } from '../utils/imageUrl'

function getRoomImage(room: Room) {
  if (room.images?.length) {
    const first = room.images.find((img) => img?.trim())
    if (first) return normalizeImageUrl(first)
  }
  return normalizeImageUrl(
    room.image_url ||
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  )
}

interface RoomCarouselCardProps {
  room: Room
  index: number
  isCenter: boolean
  onActivate: (index: number) => void
  /** When set, badge reflects weekday vs Saturday rates for the stay */
  selectedDates?: { checkIn?: string; checkOut?: string }
}

const RoomCarouselCard = memo(function RoomCarouselCard({
  room,
  index,
  isCenter,
  onActivate,
  selectedDates,
}: RoomCarouselCardProps) {
  const imageUrl = getRoomImage(room)
  const priceBadge = formatVillaPriceBadge(room, selectedDates)

  return (
    <div
      data-room-index={index}
      className={`relative flex-shrink-0 snap-center cursor-pointer transition-[opacity,transform] duration-500 ease-out will-change-auto ${
        isCenter
          ? 'z-10 w-[85%] scale-100 opacity-100 sm:w-auto sm:max-w-md sm:flex-1 lg:max-w-lg'
          : 'z-0 w-[85%] scale-[0.97] opacity-80 sm:w-auto sm:max-w-xs sm:flex-1'
      }`}
      onMouseEnter={() => {
        if (window.innerWidth >= 640) onActivate(index)
      }}
      onClick={() => {
        if (window.innerWidth < 640) onActivate(index)
      }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-white transition-shadow duration-500 ${
          isCenter ? 'shadow-xl' : 'shadow-md'
        }`}
      >
        <div className="relative h-64 overflow-hidden sm:h-72">
          <img
            src={imageUrl}
            alt={room.name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isCenter ? 'scale-105' : 'scale-100'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src =
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }}
          />
          <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-lg bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
            <span className="block text-sm font-semibold text-gray-900 sm:text-base">
              {priceBadge.primary}
            </span>
            {priceBadge.secondary && (
              <span className="block text-xs font-medium text-gray-600 sm:text-sm">
                {priceBadge.secondary}
              </span>
            )}
          </div>
          {!room.is_active && (
            <div className="absolute right-4 top-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white sm:text-sm">
              Unavailable
            </div>
          )}
        </div>

        <div className={isCenter ? 'p-6 sm:p-8' : 'p-4 sm:p-6'}>
          <h3
            className={`mb-3 font-semibold text-gray-900 ${
              isCenter ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
            }`}
          >
            {room.name}
          </h3>

          <div className="space-y-3">
            {room.description && (
              <p
                className={`line-clamp-2 text-gray-600 ${
                  isCenter ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                }`}
              >
                {room.description.length > (isCenter ? 120 : 80)
                  ? `${room.description.substring(0, isCenter ? 120 : 80)}...`
                  : room.description}
              </p>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {room.amenities.slice(0, isCenter ? 4 : 3).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full border border-golden-200 bg-golden-50 px-2.5 py-1 text-xs text-golden-700"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > (isCenter ? 4 : 3) && (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                    +{room.amenities.length - (isCenter ? 4 : 3)} more
                  </span>
                )}
              </div>
            )}

            {isCenter && (
              <div className="pt-2">
                <Link
                  to={room.slug ? `/room/${room.slug}` : '#'}
                  className="inline-flex items-center gap-2 text-sm font-medium text-golden-500 transition-colors duration-200 hover:text-golden-600"
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default RoomCarouselCard
