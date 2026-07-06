import type { VillaSettings } from './villa-settings'
import { parseVillaGuestLimits, resolveVillaGuestLimits } from './villa-settings'

export interface VillaNightlyRates {
  weekdayPrice: number
  weekendPrice: number
}

export interface StayNightlySummary extends VillaNightlyRates {
  nights: number
  weekdayNights: number
  weekendNights: number
  baseAmount: number
}

export interface VillaPriceBreakdown {
  nights: number
  capacity: number
  maxCapacity: number
  weekdayPrice: number
  weekendPrice: number
  weekdayNights: number
  weekendNights: number
  /** Average base rate across the stay (for display only) */
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

export function nightsBetween(checkIn: string, checkOut: string): number {
  const checkInDate = parseLocalDate(checkIn) ?? new Date(checkIn)
  const checkOutDate = parseLocalDate(checkOut) ?? new Date(checkOut)
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) return 0
  return Math.ceil(
    Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )
}

/** Saturday is treated as the weekend night. */
export function isWeekendNight(date: Date): boolean {
  return date.getDay() === 6
}

export function eachStayNight(checkIn: string, checkOut: string): Date[] {
  const nightCount = nightsBetween(checkIn, checkOut)
  const start = parseLocalDate(checkIn)
  if (!start || nightCount <= 0) return []

  const nights: Date[] = []
  for (let i = 0; i < nightCount; i++) {
    const night = new Date(start)
    night.setDate(night.getDate() + i)
    nights.push(night)
  }
  return nights
}

export function resolveVillaNightlyRates(source?: {
  weekday_price_per_night?: number | string | null
  weekend_price_per_night?: number | string | null
  price_per_night?: number | string | null
  price?: string | number | null
} | null): VillaNightlyRates {
  if (!source) return { weekdayPrice: 0, weekendPrice: 0 }

  const legacy = parseAmount(source.price_per_night ?? source.price)
  const weekday = parseAmount(source.weekday_price_per_night) || legacy
  const weekend = parseAmount(source.weekend_price_per_night) || legacy

  return { weekdayPrice: weekday, weekendPrice: weekend }
}

export function sumStayNightlyRates(
  checkIn: string,
  checkOut: string,
  weekdayPrice: number,
  weekendPrice: number
): StayNightlySummary {
  const nights = eachStayNight(checkIn, checkOut)
  let weekdayNights = 0
  let weekendNights = 0
  let baseAmount = 0

  for (const night of nights) {
    if (isWeekendNight(night)) {
      weekendNights += 1
      baseAmount += weekendPrice
    } else {
      weekdayNights += 1
      baseAmount += weekdayPrice
    }
  }

  return {
    nights: nights.length,
    weekdayNights,
    weekendNights,
    weekdayPrice,
    weekendPrice,
    baseAmount,
  }
}

/** Label for cards and listings — reflects selected dates when provided. */
export function formatVillaPriceBadge(
  source: Parameters<typeof resolveVillaNightlyRates>[0],
  dates?: { checkIn?: string; checkOut?: string }
): { primary: string; secondary?: string } {
  const { weekdayPrice, weekendPrice } = resolveVillaNightlyRates(source)

  if (dates?.checkIn && dates?.checkOut && dates.checkIn !== dates.checkOut) {
    const summary = sumStayNightlyRates(dates.checkIn, dates.checkOut, weekdayPrice, weekendPrice)
    if (summary.weekendNights > 0 && summary.weekdayNights === 0) {
      return {
        primary: `Weekend (Sat) ₹${weekendPrice.toLocaleString('en-IN')}/night`,
      }
    }
    if (summary.weekdayNights > 0 && summary.weekendNights === 0) {
      return {
        primary: `Weekday ₹${weekdayPrice.toLocaleString('en-IN')}/night`,
      }
    }
    if (summary.nights > 0) {
      return {
        primary: `From ₹${Math.round(summary.baseAmount / summary.nights).toLocaleString('en-IN')}/night`,
        secondary: `Weekday ₹${weekdayPrice.toLocaleString('en-IN')} · Sat ₹${weekendPrice.toLocaleString('en-IN')}`,
      }
    }
  }

  if (weekdayPrice > 0 && weekendPrice > 0 && weekdayPrice !== weekendPrice) {
    return {
      primary: `Weekday ₹${weekdayPrice.toLocaleString('en-IN')}`,
      secondary: `Sat ₹${weekendPrice.toLocaleString('en-IN')}`,
    }
  }

  const rate = weekdayPrice || weekendPrice
  return { primary: `Per Night ₹${rate.toLocaleString('en-IN')}` }
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
 * Whole-villa nightly rates: weekday (Mon–Fri, Sun) vs weekend (Saturday).
 * Base rate covers guests up to included capacity; extra guests charged per night.
 */
export function calculateVillaBookingPrice(params: {
  checkIn: string
  checkOut: string
  numGuests?: number
  villaSettings: VillaSettings
  roomFallback?: {
    weekday_price_per_night?: number | string | null
    weekend_price_per_night?: number | string | null
    price_per_night?: number | string
    included_capacity?: number
    max_capacity?: number
    extra_guest_price?: number | string | null
    extra_mattress_price?: number | string | null
  }
}): VillaPriceBreakdown | null {
  const { checkIn, checkOut, numGuests = 1, villaSettings, roomFallback } = params

  if (!checkIn || !checkOut || checkIn === checkOut) return null

  const { includedCapacity: capacity, maxCapacity } = resolveVillaGuestLimits(villaSettings, {
    roomIncludedCapacity: roomFallback?.included_capacity,
    roomMaxCapacity: roomFallback?.max_capacity,
  })

  if (maxCapacity > 0 && numGuests > maxCapacity) return null

  let { weekdayPrice, weekendPrice } = resolveVillaNightlyRates({
    price: villaSettings.price,
    ...roomFallback,
  })

  if (!weekdayPrice && !weekendPrice) return null
  if (!weekdayPrice) weekdayPrice = weekendPrice
  if (!weekendPrice) weekendPrice = weekdayPrice

  const stayRates = sumStayNightlyRates(checkIn, checkOut, weekdayPrice, weekendPrice)
  if (stayRates.nights <= 0) return null

  const effectiveCapacity = capacity > 0 ? capacity : maxCapacity
  const extraGuestPricePerNight =
    parseAmount(villaSettings.extra_guest_price) ||
    parseAmount(roomFallback?.extra_guest_price) ||
    parseAmount(roomFallback?.extra_mattress_price)

  const extraGuests = effectiveCapacity > 0 ? Math.max(0, numGuests - effectiveCapacity) : 0
  const extraGuestsAmount = extraGuestPricePerNight * extraGuests * stayRates.nights
  const baseAmount = stayRates.baseAmount
  const subtotal = baseAmount + extraGuestsAmount
  const total = subtotal

  return {
    nights: stayRates.nights,
    capacity: effectiveCapacity,
    maxCapacity,
    weekdayPrice,
    weekendPrice,
    weekdayNights: stayRates.weekdayNights,
    weekendNights: stayRates.weekendNights,
    basePricePerNight: stayRates.nights > 0 ? baseAmount / stayRates.nights : 0,
    baseAmount,
    extraAdults: extraGuests,
    extraChildren: 0,
    extraGuests,
    extraGuestPricePerNight,
    extraGuestsAmount,
    numChildren: 0,
    subtotal,
    total,
  }
}

export function hasConfiguredVillaRates(
  villaSettings: VillaSettings,
  room?: {
    weekday_price_per_night?: number | string | null
    weekend_price_per_night?: number | string | null
    price_per_night?: number | string | null
  } | null
): boolean {
  const fromSettings = parseAmount(villaSettings.price)
  const { weekdayPrice, weekendPrice } = resolveVillaNightlyRates(room ?? { price: villaSettings.price })
  return fromSettings > 0 || weekdayPrice > 0 || weekendPrice > 0
}

export function formatRupee(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}
