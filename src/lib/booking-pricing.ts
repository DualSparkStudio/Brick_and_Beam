import type { Booking, Room } from './supabase'
import {
  calculateVillaBookingPrice,
  formatRupee,
  type VillaPriceBreakdown,
} from './villa-pricing'
import type { VillaSettings } from './villa-settings'
import { defaultVillaSettings, resolveVillaGuestLimits, roomIncludedCapacity } from './villa-settings'

export type BookingPriceBreakdown = VillaPriceBreakdown

export function bookingHasStoredPriceBreakdown(booking: Booking): boolean {
  return booking.base_amount != null && booking.base_amount > 0
}

/** Nights between check-in and check-out (local YYYY-MM-DD). */
export function bookingNights(checkIn: string, checkOut: string): number {
  const match = (s: string) => /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim())
  const toLocal = (s: string) => {
    const m = match(s)
    if (!m) return new Date(s)
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const start = toLocal(checkIn)
  const end = toLocal(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/** Price lines for a booking — uses stored snapshot, or recomputes from villa/room rates. */
export function resolveBookingPriceBreakdown(
  booking: Booking,
  options?: {
    villaSettings?: VillaSettings
    room?: Room | null
  }
): BookingPriceBreakdown | null {
  if (bookingHasStoredPriceBreakdown(booking)) {
    const nights = bookingNights(booking.check_in_date, booking.check_out_date)
    const capacity = booking.included_capacity ?? 0
    const villaLimits = resolveVillaGuestLimits(options?.villaSettings ?? defaultVillaSettings(), {
      roomIncludedCapacity: roomIncludedCapacity(options?.room),
      roomMaxCapacity: options?.room?.max_capacity,
    })
    const extraGuests = booking.extra_guests ?? 0
    const extraGuestPricePerNight = booking.extra_guest_price_per_night ?? 0
    const baseAmount = booking.base_amount ?? 0
    const extraGuestsAmount = booking.extra_guests_amount ?? 0
    const subtotal = booking.subtotal_amount ?? baseAmount + extraGuestsAmount
    const total = booking.total_amount ?? subtotal

    return {
      nights,
      capacity,
      maxCapacity: villaLimits.maxCapacity,
      basePricePerNight: nights > 0 ? baseAmount / nights : baseAmount,
      baseAmount,
      extraAdults: 0,
      extraChildren: 0,
      extraGuests,
      extraGuestPricePerNight,
      extraGuestsAmount,
      numChildren: booking.num_children_above_5 ?? 0,
      subtotal,
      total,
    }
  }

  const villaSettings = options?.villaSettings ?? defaultVillaSettings()
  const room = options?.room

  return calculateVillaBookingPrice({
    checkIn: booking.check_in_date,
    checkOut: booking.check_out_date,
    numGuests: booking.num_guests,
    villaSettings,
    roomFallback: room
      ? {
          weekday_price_per_night: room.weekday_price_per_night,
          weekend_price_per_night: room.weekend_price_per_night,
          price_per_night: room.price_per_night,
          included_capacity: roomIncludedCapacity(room),
          max_capacity: room.max_capacity,
          extra_guest_price: room.extra_guest_price,
          extra_mattress_price: room.extra_mattress_price,
        }
      : undefined,
  })
}

export function snapshotFromPriceBreakdown(
  breakdown: VillaPriceBreakdown,
  totalAmount: number,
  subtotalAmount: number
): Pick<
  Booking,
  | 'base_amount'
  | 'extra_guests_amount'
  | 'extra_guests'
  | 'extra_guest_price_per_night'
  | 'included_capacity'
  | 'subtotal_amount'
  | 'total_amount'
> {
  return {
    base_amount: breakdown.baseAmount,
    extra_guests_amount: breakdown.extraGuestsAmount,
    extra_guests: breakdown.extraGuests,
    extra_guest_price_per_night: breakdown.extraGuestPricePerNight,
    included_capacity: breakdown.capacity,
    subtotal_amount: subtotalAmount,
    total_amount: totalAmount,
  }
}

export { formatRupee }
