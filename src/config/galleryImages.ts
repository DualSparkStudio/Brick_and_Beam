export type GalleryCategory =
  | 'exterior'
  | 'rooms'
  | 'living'
  | 'dining'
  | 'amenities'

export interface GalleryImage {
  id: number
  src: string
  title: string
  category: GalleryCategory
}

export const HERO_IMAGES = {
  main: '/images/hero/cover-dusk.png',
  pool: '/images/hero/pool-facade-day.png',
  night: '/images/hero/facade-dusk.png',
} as const

export const LOGO_IMAGE = '/images/logo/brick-and-beam-sign.png'

export const PAGE_HERO_IMAGES = {
  rooms: '/images/hero/pool-facade-day.png',
  gallery: '/images/hero/cover-dusk.png',
  about: '/images/hero/facade-day.png',
  features: '/images/gallery/living-room-2.png',
  contact: '/images/gallery/bonfire.png',
  attractions: '/images/gallery/balcony-view-1.png',
  policy: '/images/hero/facade-dusk.png',
  default: '/images/hero/cover-dusk.png',
} as const

export const ABOUT_IMAGES = {
  main: '/images/hero/facade-day.png',
  history: '/images/hero/pool-facade-day.png',
  night: '/images/hero/cover-dusk.png',
} as const

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: '/images/hero/cover-dusk.png', title: 'Villa at Dusk', category: 'exterior' },
  { id: 2, src: '/images/hero/facade-day.png', title: 'Exterior — Day View', category: 'exterior' },
  { id: 3, src: '/images/hero/facade-dusk.png', title: 'Exterior — Evening', category: 'exterior' },
  { id: 4, src: '/images/hero/pool-facade-day.png', title: 'Pool & Facade', category: 'exterior' },
  { id: 5, src: '/images/gallery/pool-area.png', title: 'Private Pool', category: 'exterior' },
  { id: 6, src: '/images/gallery/bonfire.png', title: 'Bonfire Evenings', category: 'amenities' },
  { id: 7, src: '/images/gallery/living-room-1.png', title: 'Living Room', category: 'living' },
  { id: 8, src: '/images/gallery/living-room-2.png', title: 'Open-Plan Lounge', category: 'living' },
  { id: 9, src: '/images/gallery/dining-room.png', title: 'Dining Area', category: 'dining' },
  { id: 10, src: '/images/gallery/kitchen.png', title: 'Modern Kitchen', category: 'dining' },
  { id: 11, src: '/images/gallery/breakfast-spread.png', title: 'Breakfast Spread', category: 'dining' },
  { id: 12, src: '/images/gallery/bedroom-1-1.png', title: 'Bedroom 1', category: 'rooms' },
  { id: 13, src: '/images/gallery/bedroom-1-2.png', title: 'Bedroom 1 — Detail', category: 'rooms' },
  { id: 14, src: '/images/gallery/bedroom-2-1.png', title: 'Bedroom 2', category: 'rooms' },
  { id: 15, src: '/images/gallery/bedroom-2-2.png', title: 'Bedroom 2 — Headboard', category: 'rooms' },
  { id: 16, src: '/images/gallery/bedroom-3-1.png', title: 'Bedroom 3 — Circular Bed', category: 'rooms' },
  { id: 17, src: '/images/gallery/bedroom-3-2.png', title: 'Bedroom 3 — Suite View', category: 'rooms' },
  { id: 18, src: '/images/gallery/bedroom-4-1.png', title: 'Bedroom 4', category: 'rooms' },
  { id: 19, src: '/images/gallery/bedroom-4-2.png', title: 'Bedroom 4 — Interior', category: 'rooms' },
  { id: 20, src: '/images/gallery/bathroom-1.png', title: 'Bathroom 1', category: 'rooms' },
  { id: 21, src: '/images/gallery/bathroom-2.png', title: 'Bathroom 2', category: 'rooms' },
  { id: 22, src: '/images/gallery/bathroom-3.png', title: 'Bathroom 3', category: 'rooms' },
  { id: 23, src: '/images/gallery/bathroom-4.png', title: 'Bathroom 4', category: 'rooms' },
  { id: 24, src: '/images/gallery/balcony-1.png', title: 'Balcony — Forest View', category: 'rooms' },
  { id: 25, src: '/images/gallery/balcony-2.png', title: 'Balcony — Morning Coffee', category: 'rooms' },
  { id: 26, src: '/images/gallery/balcony-3.png', title: 'Balcony — Valley View', category: 'rooms' },
  { id: 27, src: '/images/gallery/balcony-4.png', title: 'Balcony — Scenic Retreat', category: 'rooms' },
  { id: 28, src: '/images/gallery/balcony-view-1.png', title: 'Balcony View', category: 'rooms' },
  { id: 29, src: '/images/gallery/balcony-view-2.png', title: 'Balcony — Brick Wall', category: 'rooms' },
  { id: 30, src: '/images/gallery/balcony-view-3.png', title: 'Balcony — Greenery', category: 'rooms' },
  { id: 31, src: '/images/gallery/interior-passage.png', title: 'Interior Staircase', category: 'living' },
  { id: 32, src: '/images/gallery/game-room-1.png', title: 'Game Room', category: 'amenities' },
  { id: 33, src: '/images/gallery/game-room-2.png', title: 'Indoor Games', category: 'amenities' },
  { id: 34, src: '/images/logo/brick-and-beam-sign.png', title: 'Brick & Beam Sign', category: 'exterior' },
]

export const GALLERY_CATEGORIES: { id: GalleryCategory | 'all'; name: string }[] = [
  { id: 'all', name: 'All' },
  { id: 'exterior', name: 'Exterior' },
  { id: 'rooms', name: 'Rooms' },
  { id: 'living', name: 'Living' },
  { id: 'dining', name: 'Dining' },
  { id: 'amenities', name: 'Amenities' },
]
