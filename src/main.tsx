import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Preloader from './components/Preloader'

// Suppress React DevTools message and other development noise
const originalWarn = console.warn
const originalError = console.error

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Download the React DevTools') ||
     args[0].includes('React Router Future Flag'))
  ) {
    return
  }
  originalWarn.apply(console, args)
}

console.error = (...args) => {
  // Suppress network errors in development (Supabase connection issues)
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ERR_NAME_NOT_RESOLVED') ||
     args[0].includes('Failed to fetch') ||
     args[0].includes('net::ERR_NAME_NOT_RESOLVED') ||
     args[0].includes('404 (Not Found)') ||
     args[0].includes('GET http'))
  ) {
    return
  }
  
  // Suppress Supabase connection errors
  if (
    args.length > 0 &&
    typeof args[0] === 'object' &&
    args[0] !== null &&
    ('message' in args[0] || 'code' in args[0]) &&
    (args[0].message?.includes('Failed to fetch') ||
     args[0].message?.includes('ERR_NAME_NOT_RESOLVED'))
  ) {
    return
  }
  
  originalError.apply(console, args)
}

// Suppress image 404 errors globally
window.addEventListener('error', (event) => {
  if (
    event.target instanceof HTMLImageElement &&
    (event.message?.includes('404') || 
     event.message?.includes('Failed to load') ||
     event.target.src?.includes('logo.png') ||
     event.target.src?.includes('Exterior'))
  ) {
    event.preventDefault()
    return false
  }
}, true)

function Root() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <StrictMode>
      {isLoading ? (
        <Preloader onComplete={() => setIsLoading(false)} />
      ) : (
        <App />
      )}
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
