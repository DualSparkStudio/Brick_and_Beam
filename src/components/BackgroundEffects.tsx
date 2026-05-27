import { useEffect, useRef } from 'react'

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Gradient noise texture
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 10
      data[i] = 4 + noise // R
      data[i + 1] = 15 + noise // G
      data[i + 2] = 50 + noise // B
      data[i + 3] = 5 // Alpha (very subtle)
    }

    ctx.putImageData(imageData, 0, 0)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      {/* Gradient Noise Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-30 mix-blend-overlay"
        style={{ zIndex: 1 }}
      />

      {/* Blurred Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-golden-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-dark-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-golden-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </>
  )
}
