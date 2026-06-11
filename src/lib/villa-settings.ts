export interface VillaSettings {
  villa_name: string
  price: string
  /** Guests included in the base nightly price */
  capacity: string
  /** Absolute maximum guests allowed (must be >= capacity) */
  max_capacity: string
  amenities: string
  games: string
  /** Per-night rate for extra adults above capacity (up to max_capacity) */
  extra_adult_price: string
  /** Per-night rate for extra children above capacity (up to max_capacity) */
  child_price: string
  /** GST percentage applied to booking subtotals */
  gst_percentage: string
}

export const VILLA_SETTING_KEYS = {
  villa_name: 'villa_name',
  villa_price: 'villa_price',
  villa_capacity: 'villa_capacity',
  villa_max_capacity: 'villa_max_capacity',
  villa_amenities: 'villa_amenities',
  villa_games: 'villa_games',
  villa_extra_adult_price: 'villa_extra_adult_price',
  villa_child_price: 'villa_child_price',
  villa_gst_percentage: 'villa_gst_percentage',
} as const

export const defaultVillaSettings = (): VillaSettings => ({
  villa_name: '',
  price: '',
  capacity: '',
  max_capacity: '',
  amenities: '',
  games: '',
  extra_adult_price: '',
  child_price: '',
  gst_percentage: '12',
})

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

  return {
    villa_name: map.get(VILLA_SETTING_KEYS.villa_name) || '',
    price: map.get(VILLA_SETTING_KEYS.villa_price) || '',
    capacity,
    max_capacity: maxCapacity,
    amenities: map.get(VILLA_SETTING_KEYS.villa_amenities) || '',
    games: map.get(VILLA_SETTING_KEYS.villa_games) || '',
    extra_adult_price: map.get(VILLA_SETTING_KEYS.villa_extra_adult_price) || '',
    child_price: map.get(VILLA_SETTING_KEYS.villa_child_price) || '',
    gst_percentage: map.get(VILLA_SETTING_KEYS.villa_gst_percentage) || '12',
  }
}

export function parseGstPercentage(settings: VillaSettings): number {
  const parsed = parseFloat(settings.gst_percentage)
  if (!settings.gst_percentage.trim() || Number.isNaN(parsed)) return 12
  return Math.min(100, Math.max(0, parsed))
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
