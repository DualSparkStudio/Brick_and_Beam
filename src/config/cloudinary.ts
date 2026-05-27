// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = 'dvf39djml'
export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`

/**
 * Generate optimized Cloudinary image URL
 * @param publicId - The image path in Cloudinary (e.g., 'Resort Booking System/delux room/image1')
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getCloudinaryImage = (
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low'
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'scale' | 'crop'
  } = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options

  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop && (width || height)) transformations.push(`c_${crop}`)
  transformations.push(`f_${format}`)
  transformations.push(`q_${quality}`)

  const transformString = transformations.join(',')
  
  return `${CLOUDINARY_BASE_URL}${transformString}/${publicId}`
}

/**
 * Get responsive image URLs for different screen sizes
 */
export const getResponsiveImages = (publicId: string) => {
  return {
    mobile: getCloudinaryImage(publicId, { width: 400 }),
    tablet: getCloudinaryImage(publicId, { width: 800 }),
    desktop: getCloudinaryImage(publicId, { width: 1200 }),
    large: getCloudinaryImage(publicId, { width: 1920 })
  }
}

/**
 * Convert a Cloudinary URL to responsive srcSet
 * Use this when you have a URL from admin panel
 */
export const makeResponsive = (cloudinaryUrl: string) => {
  // Extract the public ID from the URL
  const match = cloudinaryUrl.match(/\/upload\/(?:.*?\/)?(Grand%20Valley%20Resort\/.+)$/)
  if (!match) return cloudinaryUrl
  
  const publicId = decodeURIComponent(match[1])
  
  return {
    src: getCloudinaryImage(publicId, { width: 1200 }),
    srcSet: `
      ${getCloudinaryImage(publicId, { width: 400 })} 400w,
      ${getCloudinaryImage(publicId, { width: 800 })} 800w,
      ${getCloudinaryImage(publicId, { width: 1200 })} 1200w,
      ${getCloudinaryImage(publicId, { width: 1920 })} 1920w
    `,
    sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px'
  }
}

/**
 * Get thumbnail image
 */
export const getThumbnail = (publicId: string, size: number = 300) => {
  return getCloudinaryImage(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto:good'
  })
}

/**
 * Cloudinary image paths for Resort Booking System
 */
export const CLOUDINARY_PATHS = {
  // Room types
  DELUX_ROOM: 'Resort Booking System/delux room',
  FAMILY_ROOM: 'Resort Booking System/Family room',
  VALLEY_VIEW_ROOM: 'Resort Booking System/Valley view room',
  
  // Restaurant
  RESTAURANT: 'Resort Booking System/Restaurants',
  
  // You can add more paths as needed
} as const
