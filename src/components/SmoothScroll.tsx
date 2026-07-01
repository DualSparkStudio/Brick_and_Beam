import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocation } from 'react-router-dom'
import { setLenisInstance, subscribeLenisScroll, notifyLenisScroll } from './ScrollToTop'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const APPLE_LENIS_OPTIONS = {
  lerp: 0.075,
  duration: 1.4,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.075,
  touchMultiplier: 1.15,
  wheelMultiplier: 0.85,
  infinite: false,
  autoResize: true,
  anchors: {
    offset: -88,
    duration: 1.4,
    lerp: 0.075,
  },
} as const

function createLenis() {
  return new Lenis({
    ...APPLE_LENIS_OPTIONS,
    autoRaf: true,
    prevent: (node) =>
      node.closest('[data-lenis-prevent]') !== null ||
      node.closest('.fc-scroller') !== null,
  })
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)
  const isAdminRef = useRef(location.pathname.startsWith('/admin'))

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isAdminRoute || prefersReducedMotion) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
        setLenisInstance(null)
      }
      isAdminRef.current = isAdminRoute
      return
    }

    const wasAdmin = isAdminRef.current
    isAdminRef.current = false

    if (!lenisRef.current || wasAdmin) {
      const lenis = createLenis()
      lenisRef.current = lenis
      setLenisInstance(lenis)

      lenis.on('scroll', (instance) => {
        notifyLenisScroll(instance.scroll)
        if (ScrollTrigger.getAll().length > 0) {
          ScrollTrigger.update()
        }
      })
    }

    return undefined
  }, [location.pathname])

  useEffect(() => {
    const unsubscribe = subscribeLenisScroll((scroll) => {
      window.dispatchEvent(new CustomEvent('app-scroll', { detail: { scroll } }))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
        setLenisInstance(null)
      }
    }
  }, [])

  return <>{children}</>
}
