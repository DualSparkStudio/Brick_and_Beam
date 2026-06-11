/** Adult count from a booking (legacy rows without num_guests used 2 + num_extra_adults). */
export function getBookingAdultCount(booking: {
  num_guests?: number
  num_extra_adults?: number
  num_children_above_5?: number
}): number {
  const children = booking.num_children_above_5 || 0
  if (booking.num_guests != null && booking.num_guests > 0) {
    return Math.max(1, booking.num_guests - children)
  }
  return 2 + (booking.num_extra_adults || 0)
}

export function getBookingTotalGuests(booking: {
  num_guests?: number
  num_extra_adults?: number
  num_children_above_5?: number
}): number {
  if (booking.num_guests != null && booking.num_guests > 0) {
    return booking.num_guests
  }
  return 2 + (booking.num_extra_adults || 0) + (booking.num_children_above_5 || 0)
}
