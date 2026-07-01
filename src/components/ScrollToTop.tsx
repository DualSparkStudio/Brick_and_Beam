import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type Lenis from 'lenis'

let globalLenisInstance: Lenis | null = null
const scrollListeners = new Set<(scroll: number) => void>()

export const setLenisInstance = (lenis: Lenis | null) => {
  globalLenisInstance = lenis
}

export const getLenisInstance = () => globalLenisInstance

export const subscribeLenisScroll = (listener: (scroll: number) => void) => {
  scrollListeners.add(listener)
  return () => scrollListeners.delete(listener)
}

export const notifyLenisScroll = (scroll: number) => {
  scrollListeners.forEach((listener) => listener(scroll))
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (globalLenisInstance) {
      globalLenisInstance.scrollTo(0, { immediate: false, lerp: 0.075, duration: 1.2 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pathname])

  return null
}

export default ScrollToTop
