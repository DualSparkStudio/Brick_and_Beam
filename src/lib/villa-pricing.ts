import type { VillaSettings } from './villa-settings'
import { parseGstPercentage, parseVillaGuestLimits } from './villa-settings'

export interface VillaPriceBreakdown {
  nights: number
  capacity: number
  maxCapacity: number
  basePricePerNight: number
  baseAmount: number
  extraAdults: number
  extraChildren: number
  adultPricePerNight: number
  adultsAmount: number
  childPricePerNight: number
  childrenAmount: number
  numChildren: number
  subtotal: number
  gstPercentage: number
  gst: number
  total: number
}

function parseAmount(value: string | number | undefined | null): number {
  if (value == null || value === '') return 0
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(num) ? num : 0
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  return Math.ceil(
    Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )
}

/** Guests above capacity that are charged extra rates (adults fill base slots first). */
export function allocateExtraGuests(
  numAdults: number,
  numChildren: number,
  capacity: number
): { extraAdults: number; extraChildren: number } {
  if (capacity <= 0) {
    return { extraAdults: numAdults, extraChildren: numChildren }
  }
  const adultsInBase = Math.min(numAdults, capacity)
  const childrenInBase = Math.min(numChildren, Math.max(0, capacity - adultsInBase))
  return {
    extraAdults: numAdults - adultsInBase,
    extraChildren: numChildren - childrenInBase,
  }
}

/**
 * Base nightly rate covers up to `capacity` guests.
 * Extra adult/child rates apply only to guests above capacity (up to max_capacity).
 */
export function calculateVillaBookingPrice(params: {
  checkIn: string
  checkOut: string
  numAdults: number
  numChildren: number
  villaSettings: VillaSettings
  roomFallback?: {
    price_per_night?: number | string
    extra_guest_price?: number | string
    child_above_5_price?: number | string
  }
}): VillaPriceBreakdown | null {
  const { checkIn, checkOut, numAdults, numChildren, villaSettings, roomFallback } = params

  if (!checkIn || !checkOut || checkIn === checkOut) return null

  const nights = nightsBetween(checkIn, checkOut)
  if (nights <= 0) return null

  const { capacity, maxCapacity } = parseVillaGuestLimits(villaSettings)
  const totalGuests = numAdults + numChildren
  if (maxCapacity > 0 && totalGuests > maxCapacity) return null

  let basePricePerNight = parseAmount(villaSettings.price)
  let adultPricePerNight = parseAmount(villaSettings.extra_adult_price)
  let childPricePerNight = parseAmount(villaSettings.child_price)

  if (!basePricePerNight && roomFallback) {
    basePricePerNight = parseAmount(roomFallback.price_per_night)
    adultPricePerNight = adultPricePerNight || parseAmount(roomFallback.extra_guest_price)
    childPricePerNight = childPricePerNight || parseAmount(roomFallback.child_above_5_price)
  }

  if (!basePricePerNight) return null

  const gstPercentage = parseGstPercentage(villaSettings)

  const effectiveCapacity = capacity > 0 ? capacity : maxCapacity
  const { extraAdults, extraChildren } = allocateExtraGuests(
    numAdults,
    numChildren,
    effectiveCapacity
  )

  const baseAmount = basePricePerNight * nights
  const adultsAmount = adultPricePerNight * extraAdults * nights
  const childrenAmount = childPricePerNight * extraChildren * nights
  const subtotal = baseAmount + adultsAmount + childrenAmount
  const gst = (subtotal * gstPercentage) / 100
  const total = subtotal + gst

  return {
    nights,
    capacity: effectiveCapacity,
    maxCapacity,
    basePricePerNight,
    baseAmount,
    extraAdults,
    extraChildren,
    adultPricePerNight,
    adultsAmount,
    childPricePerNight,
    childrenAmount,
    numChildren,
    subtotal,
    gstPercentage,
    gst,
    total,
  }
}

export function formatRupee(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}
