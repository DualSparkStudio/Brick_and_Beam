import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { useLocation } from 'react-router-dom'
import { setLenisInstance } from './ScrollToTop'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Disable smooth scroll for admin routes
    if (location.pathname.startsWith('/admin')) {
      // Destroy Lenis if it exists when entering admin routes
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
        setLenisInstance(null)
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
      }
      return
    }

    // Create Lenis instance only if it doesn't exist
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: true,
        touchMultiplier: 2,
        infinite: false,
      })

      // Set global instance for ScrollToTop component
      setLenisInstance(lenisRef.current)

      // Animation loop
      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time)
          rafIdRef.current = requestAnimationFrame(raf)
        }
      }

      rafIdRef.current = requestAnimationFrame(raf)
    }

    // Scroll to top on route change (with smooth transition)
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false })
    }

    // Cleanup function
    return () => {
      // Don't destroy on route change, only on unmount
    }
  }, [location.pathname])

  // Handle anchor links with smooth scrolling (set up once)
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      // Find the anchor element (could be the target or a parent)
      let anchor: HTMLAnchorElement | null = null
      if (e.target instanceof HTMLAnchorElement) {
        anchor = e.target
      } else if (e.target instanceof HTMLElement) {
        anchor = e.target.closest('a[href^="#"]')
      }

      if (anchor && lenisRef.current) {
        const href = anchor.getAttribute('href')
        if (href && href.startsWith('#') && href !== '#') {
          const targetElement = document.querySelector(href)
          if (targetElement) {
            e.preventDefault()
            lenisRef.current.scrollTo(targetElement, {
              offset: -80, // Offset for fixed headers if needed
              duration: 1.2,
            })
          }
        }
      }
    }

    // Add event listener for anchor links
    document.addEventListener('click', handleAnchorClick, true)

    // Cleanup anchor link handler
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
    }
  }, [])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
        setLenisInstance(null)
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  return <>{children}</>
}
