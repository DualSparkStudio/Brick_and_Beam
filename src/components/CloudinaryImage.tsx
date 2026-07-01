import React from 'react'

interface CloudinaryImageProps {
  publicId: string // e.g., "Brick and Beam/delux room/image1.jpg"
  alt: string
  className?: string
  sizes?: string // Optional: custom sizes attribute
}

/**
 * Cloudinary Responsive Image Component
 * Automatically serves optimized images for different screen sizes
 */
const CloudinaryImage: React.FC<CloudinaryImageProps> = ({ 
  publicId, 
  alt, 
  className = '',
  sizes = '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px'
}) => {
  const cloudName = 'dvf39djml'
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
  
  // Encode the public ID properly
  const encodedPublicId = encodeURIComponent(publicId).replace(/%2F/g, '/')
  
  // Generate different sizes
  const getSrc = (width: number) => {
    return `${baseUrl}/w_${width},f_auto,q_auto/${encodedPublicId}`
  }
  
  return (
    <img
      src={getSrc(1200)} // Default/fallback image
      srcSet={`
        ${getSrc(400)} 400w,
        ${getSrc(800)} 800w,
        ${getSrc(1200)} 1200w,
        ${getSrc(1920)} 1920w
      `}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy" // Lazy load for better performance
    />
  )
}

export default CloudinaryImage
