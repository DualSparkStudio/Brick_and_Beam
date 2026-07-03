import { GALLERY_IMAGES, HERO_IMAGES } from '../config/galleryImages'
import type { Room, RoomImage } from './supabase'
import { normalizeImageUrl } from '../utils/imageUrl'

const PLACEHOLDER_IMAGE_PATTERN = /images\.unsplash\.com/i

function parseImagesField(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images.map((img) => String(img ?? '').trim()).filter(Boolean)
  }
  if (typeof images === 'string') {
    const trimmed = images.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map((img) => String(img ?? '').trim()).filter(Boolean)
      }
    } catch {
      return [trimmed]
    }
  }
  return []
}

export function isPlaceholderStockImage(url: string): boolean {
  return PLACEHOLDER_IMAGE_PATTERN.test(url)
}

/** Real Brick & Beam photos bundled with the site (not stock placeholders). */
export function getDefaultVillaImages(): string[] {
  const exterior = GALLERY_IMAGES.filter((img) => img.category === 'exterior').map((img) => img.src)
  return [
    HERO_IMAGES.main,
    HERO_IMAGES.pool,
    HERO_IMAGES.night,
    ...exterior,
  ].filter((src, index, arr) => arr.indexOf(src) === index)
}

export function resolveRoomImages(
  room?: Room | null,
  roomImageRecords?: RoomImage[] | null
): string[] {
  const collected: string[] = []

  for (const img of parseImagesField(room?.images)) {
    collected.push(img)
  }

  if (room?.image_url?.trim()) {
    collected.push(room.image_url.trim())
  }

  for (const record of roomImageRecords ?? []) {
    if (record.image_url?.trim()) {
      collected.push(record.image_url.trim())
    }
  }

  const normalized = [...new Set(collected.map(normalizeImageUrl).filter(Boolean))]
  const realPhotos = normalized.filter((url) => !isPlaceholderStockImage(url))

  if (realPhotos.length > 0) return realPhotos
  return getDefaultVillaImages()
}
