import React from 'react'
import { formatPriceDisplay, parseListField, parseVillaGuestLimits, type VillaSettings } from '../lib/villa-settings'

interface VillaDetailsSectionProps {
  settings: VillaSettings
}

const VillaDetailsSection: React.FC<VillaDetailsSectionProps> = ({ settings }) => {
  const amenities = parseListField(settings.amenities)
  const games = parseListField(settings.games)
  const priceLabel = formatPriceDisplay(settings.price)
  const { capacity, maxCapacity } = parseVillaGuestLimits(settings)

  const hasContent =
    priceLabel ||
    capacity > 0 ||
    maxCapacity > 0 ||
    amenities.length > 0 ||
    games.length > 0 ||
    (settings.extra_guest_price ?? '').trim()

  if (!hasContent) return null

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Villa Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {priceLabel && capacity > 0 && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">Base price</p>
            <p className="text-2xl font-bold text-blue-900">{priceLabel}</p>
            <p className="text-xs text-blue-700 mt-1">per night · up to {capacity} guests</p>
          </div>
        )}
        {priceLabel && capacity <= 0 && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">Price</p>
            <p className="text-2xl font-bold text-blue-900">{priceLabel}</p>
            <p className="text-xs text-blue-700 mt-1">per night (whole villa)</p>
          </div>
        )}
        {maxCapacity > 0 && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Max capacity</p>
            <p className="text-2xl font-bold text-gray-900">{maxCapacity}</p>
            <p className="text-xs text-gray-500 mt-1">guests maximum</p>
          </div>
        )}
        {(settings.extra_guest_price ?? '').trim() && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Extra guest</p>
            <p className="text-xl font-bold text-gray-900">{formatPriceDisplay(settings.extra_guest_price)}</p>
            <p className="text-xs text-gray-500 mt-1">per night above capacity (adults & children)</p>
          </div>
        )}
      </div>

      {amenities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
          <ul className="flex flex-wrap gap-2">
            {amenities.map((item) => (
              <li key={item} className="text-sm bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {games.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Games</h3>
          <ul className="flex flex-wrap gap-2">
            {games.map((item) => (
              <li
                key={item}
                className="text-sm bg-amber-50 text-amber-900 px-3 py-1.5 rounded-full border border-amber-100"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default VillaDetailsSection
