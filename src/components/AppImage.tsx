import { ImgHTMLAttributes, useState } from 'react'
import { normalizeImageUrl } from '../utils/imageUrl'

interface AppImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export default function AppImage({
  src,
  fallback,
  onError,
  ...props
}: AppImageProps) {
  const [failed, setFailed] = useState(false)
  const resolvedSrc = src ? normalizeImageUrl(String(src)) : undefined
  const displaySrc = failed && fallback ? fallback : resolvedSrc

  return (
    <img
      {...props}
      src={displaySrc}
      onError={(e) => {
        if (!failed) setFailed(true)
        onError?.(e)
      }}
    />
  )
}
