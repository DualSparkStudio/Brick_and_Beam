import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface PremiumImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  parallax?: boolean
  blur?: boolean
}

export default function PremiumImage({
  src,
  alt,
  className = '',
  priority = false,
  parallax = false,
  blur = true,
}: PremiumImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [webpSrc, setWebpSrc] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Try to use WebP if available
    const webpPath = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    const testImg = new Image()
    testImg.onload = () => setWebpSrc(webpPath)
    testImg.onerror = () => setWebpSrc(null)
    testImg.src = webpPath
  }, [src])

  useEffect(() => {
    if (parallax && imgRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!imgRef.current) return
        const rect = imgRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        imgRef.current.style.transform = `translate(${x * 10 - 5}px, ${y * 10 - 5}px) scale(1.05)`
      }

      const handleMouseLeave = () => {
        if (imgRef.current) {
          imgRef.current.style.transform = 'translate(0, 0) scale(1)'
        }
      }

      imgRef.current.addEventListener('mousemove', handleMouseMove)
      imgRef.current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        if (imgRef.current) {
          imgRef.current.removeEventListener('mousemove', handleMouseMove)
          imgRef.current.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    }
  }, [parallax, loaded])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {blur && !loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-blue-700 to-dark-blue-900 animate-pulse" />
      )}
      <motion.img
        ref={imgRef}
        src={webpSrc || src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`w-full h-full object-cover transition-transform duration-700 ${
          parallax ? 'cursor-pointer' : ''
        }`}
        style={{ filter: loaded ? 'none' : 'blur(20px)' }}
      />
      {error && (
        <div className="absolute inset-0 bg-dark-blue-800 flex items-center justify-center">
          <span className="text-golden/50">Image not available</span>
        </div>
      )}
    </div>
  )
}
