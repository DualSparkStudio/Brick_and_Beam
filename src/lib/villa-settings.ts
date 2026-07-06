export interface VillaSettings {
  villa_name: string
  price: string
  /** Guests included in the base nightly price */
  capacity: string
  /** Absolute maximum guests allowed (must be >= capacity) */
  max_capacity: string
  amenities: string
  games: string
  /** Per-night rate for each guest above capacity (adults and children) */
  extra_guest_price: string
}

export const VILLA_SETTING_KEYS = {
  villa_name: 'villa_name',
  villa_price: 'villa_price',
  villa_capacity: 'villa_capacity',
  villa_max_capacity: 'villa_max_capacity',
  villa_amenities: 'villa_amenities',
  villa_games: 'villa_games',
  villa_extra_guest_price: 'villa_extra_guest_price',
  /** @deprecated Legacy keys — read-only fallback */
  villa_extra_adult_price: 'villa_extra_adult_price',
  villa_child_price: 'villa_child_price',
} as const

export const defaultVillaSettings = (): VillaSettings => ({
  villa_name: '',
  price: '',
  capacity: '',
  max_capacity: '',
  amenities: '',
  games: '',
  extra_guest_price: '',
})

/** Ensures all fields exist; maps legacy extra adult/child keys to extra_guest_price. */
export function normalizeVillaSettings(
  settings: Partial<VillaSettings> & {
    extra_adult_price?: string
    child_price?: string
  }
): VillaSettings {
  const defaults = defaultVillaSettings()
  const extra_guest_price =
    settings.extra_guest_price ??
    settings.extra_adult_price ??
    settings.child_price ??
    defaults.extra_guest_price

  return {
    villa_name: settings.villa_name ?? defaults.villa_name,
    price: settings.price ?? defaults.price,
    capacity: settings.capacity ?? defaults.capacity,
    max_capacity: settings.max_capacity ?? defaults.max_capacity,
    amenities: settings.amenities ?? defaults.amenities,
    games: settings.games ?? defaults.games,
    extra_guest_price,
  }
}

function readExtraGuestPrice(map: Map<string, string | null | undefined>): string {
  return (
    map.get(VILLA_SETTING_KEYS.villa_extra_guest_price) ||
    map.get(VILLA_SETTING_KEYS.villa_extra_adult_price) ||
    map.get(VILLA_SETTING_KEYS.villa_child_price) ||
    ''
  )
}

/** Read settings from DB map (migrates legacy single max_capacity value to capacity). */
export function mapVillaSettingsFromDb(
  map: Map<string, string | null | undefined>
): VillaSettings {
  const legacyMax = map.get(VILLA_SETTING_KEYS.villa_max_capacity) || ''
  const hasCapacityKey = map.has(VILLA_SETTING_KEYS.villa_capacity)
  const capacity = hasCapacityKey
    ? map.get(VILLA_SETTING_KEYS.villa_capacity) || ''
    : legacyMax
  const maxCapacity = hasCapacityKey
    ? map.get(VILLA_SETTING_KEYS.villa_max_capacity) || capacity
    : legacyMax

  return normalizeVillaSettings({
    villa_name: map.get(VILLA_SETTING_KEYS.villa_name) || '',
    price: map.get(VILLA_SETTING_KEYS.villa_price) || '',
    capacity,
    max_capacity: maxCapacity,
    amenities: map.get(VILLA_SETTING_KEYS.villa_amenities) || '',
    games: map.get(VILLA_SETTING_KEYS.villa_games) || '',
    extra_guest_price: readExtraGuestPrice(map),
  })
}

export function parseVillaGuestLimits(settings: VillaSettings): {
  capacity: number
  maxCapacity: number
} {
  const capacity = parseInt(settings.capacity, 10) || 0
  const maxParsed = parseInt(settings.max_capacity, 10) || 0
  const maxCapacity = maxParsed > 0 ? maxParsed : capacity
  return {
    capacity,
    maxCapacity: Math.max(maxCapacity, capacity),
  }
}

const DEFAULT_GUEST_LIMIT = 10

export interface ResolvedVillaGuestLimits {
  /** Guests included in the base nightly price */
  includedCapacity: number
  /** Absolute maximum guests allowed for a booking */
  maxCapacity: number
}

/** Single source of truth for included vs max guest limits (whole-villa booking). */
export function resolveVillaGuestLimits(
  settings: VillaSettings,
  options?: { roomMaxCapacity?: number; roomIncludedCapacity?: number }
): ResolvedVillaGuestLimits {
  const roomIncluded = options?.roomIncludedCapacity ?? 0
  const roomMax = options?.roomMaxCapacity ?? 0

  if (roomIncluded > 0 || roomMax > 0) {
    const includedCapacity = roomIncluded > 0 ? roomIncluded : roomMax
    const maxCapacity = roomMax > 0 ? Math.max(roomMax, includedCapacity) : includedCapacity
    return { includedCapacity, maxCapacity }
  }

  const { capacity, maxCapacity } = parseVillaGuestLimits(settings)

  const includedCapacity =
    capacity > 0 ? capacity : maxCapacity > 0 ? maxCapacity : roomMax > 0 ? roomMax : DEFAULT_GUEST_LIMIT

  const resolvedMax =
    maxCapacity > 0 ? maxCapacity : capacity > 0 ? capacity : roomMax > 0 ? roomMax : DEFAULT_GUEST_LIMIT

  return {
    includedCapacity,
    maxCapacity: Math.max(resolvedMax, includedCapacity),
  }
}

/** Included guests in base price from a room row (supports legacy max_occupancy column). */
export function roomIncludedCapacity(room?: {
  included_capacity?: number
  max_occupancy?: number
} | null): number | undefined {
  if (!room) return undefined
  if (room.included_capacity != null && room.included_capacity > 0) return room.included_capacity
  if (room.max_occupancy != null && room.max_occupancy > 0) return room.max_occupancy
  return undefined
}

export function parseListField(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function formatPriceDisplay(price: string): string {
  const num = parseFloat(price)
  if (!price.trim() || Number.isNaN(num)) return ''
  return `₹${num.toLocaleString('en-IN')}`
}
