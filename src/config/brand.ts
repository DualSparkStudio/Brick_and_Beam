export const BRAND_NAME = 'Brick and Beam'
export const BRAND_TAGLINE = 'Your Perfect Getaway'
export const BRAND_LOCATION = 'Bhilar, Mahabaleshwar'

export const DEFAULT_VILLA_ADDRESS = [
  'Brick and Beam',
  'Bhilar, Mahabaleshwar',
  'Maharashtra, India',
].join('\n')

const PLACEHOLDER_ADDRESS_PATTERN = /sample address|city,\s*state/i

/** Admin profile address, or the real villa location when unset / placeholder. */
export function resolveVillaAddress(address?: string | null): string {
  const trimmed = address?.trim()
  if (trimmed && !PLACEHOLDER_ADDRESS_PATTERN.test(trimmed)) {
    return trimmed
  }
  return DEFAULT_VILLA_ADDRESS
}

export const PUBLIC_BOOK_CTA_HREF = '/#book'

export const INSTAGRAM_URL =
  'https://www.instagram.com/brick_and_beam_mahabaleshwar?igsh=MWY3dHE0anVseHRvZQ=='

export const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3796.593223769032!2d73.77053137502251!3d17.904464383073602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc269c66a0d2c1f%3A0xea1df83a3991e44e!2sBrick%20%26%20beam%20%7C%20Premium%20Villa%20in%20Panchgani!5e0!3m2!1sen!2sin!4v1782915004597!5m2!1sen!2sin'
