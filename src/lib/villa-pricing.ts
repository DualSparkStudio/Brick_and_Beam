import type { VillaSettings } from './villa-settings'
import { parseVillaGuestLimits } from './villa-settings'

export interface VillaPriceBreakdown {
  nights: number
  capacity: number
  maxCapacity: number
  basePricePerNight: number
  baseAmount: number
  extraAdults: number
  extraChildren: number
  extraGuests: number
  extraGuestPricePerNight: number
  extraGuestsAmount: number
  numChildren: number
  subtotal: number
  total: number
}

function parseAmount(value: string | number | undefined | null): number {
  if (value == null || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const cleaned = value.replace(/[₹,\s]/g, '')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : 0
}

function parseLocalDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const checkInDate = parseLocalDate(checkIn) ?? new Date(checkIn)
  const checkOutDate = parseLocalDate(checkOut) ?? new Date(checkOut)
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) return 0
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
 * Same extra guest rate applies to adults and children above capacity (up to max_capacity).
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
  let extraGuestPricePerNight = parseAmount(villaSettings.extra_guest_price)

  if (roomFallback) {
    if (!basePricePerNight) {
      basePricePerNight = parseAmount(roomFallback.price_per_night)
    }
    if (!extraGuestPricePerNight) {
      extraGuestPricePerNight = parseAmount(roomFallback.extra_guest_price)
    }
  }

  if (!basePricePerNight) return null

  const effectiveCapacity = capacity > 0 ? capacity : maxCapacity
  const { extraAdults, extraChildren } = allocateExtraGuests(
    numAdults,
    numChildren,
    effectiveCapacity
  )
  const extraGuests = extraAdults + extraChildren

  const baseAmount = basePricePerNight * nights
  const extraGuestsAmount = extraGuestPricePerNight * extraGuests * nights
  const subtotal = baseAmount + extraGuestsAmount
  const total = subtotal

  return {
    nights,
    capacity: effectiveCapacity,
    maxCapacity,
    basePricePerNight,
    baseAmount,
    extraAdults,
    extraChildren,
    extraGuests,
    extraGuestPricePerNight,
    extraGuestsAmount,
    numChildren,
    subtotal,
    total,
  }
}

export function formatRupee(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}
