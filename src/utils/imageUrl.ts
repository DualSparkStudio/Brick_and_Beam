/**
 * Normalize image URLs for display — converts Google Drive share links
 * into direct-view URLs that work in <img> tags.
 *
 * Supported Google Drive formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 * - https://lh3.googleusercontent.com/d/FILE_ID
 */

export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim()

  if (trimmed.includes('drive.google.com') || trimmed.includes('googleusercontent.com')) {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
      const match = trimmed.match(pattern)
      if (match?.[1]) return match[1]
    }
  }

  return null
}

export function isGoogleDriveUrl(url: string): boolean {
  return extractGoogleDriveFileId(url) !== null
}

export function normalizeImageUrl(url: string): string {
  if (!url?.trim()) return url

  const trimmed = url.trim()
  const fileId = extractGoogleDriveFileId(trimmed)

  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }

  return trimmed
}

export function validateImageUrl(url: string): boolean {
  if (!url.trim()) return false

  if (url.startsWith('/') || url.startsWith('./')) return true

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function canUseWebpVariant(url: string): boolean {
  return (
    (url.startsWith('/') || url.startsWith('./')) &&
    /\.(jpg|jpeg|png)$/i.test(url.split('?')[0])
  )
}
