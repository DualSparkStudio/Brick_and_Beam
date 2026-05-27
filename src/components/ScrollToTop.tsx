import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// Global Lenis instance reference (will be set by SmoothScroll)
let globalLenisInstance: Lenis | null = null;

export const setLenisInstance = (lenis: Lenis | null) => {
  globalLenisInstance = lenis;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    // Use Lenis if available, otherwise fallback to window.scrollTo
    if (globalLenisInstance) {
      globalLenisInstance.scrollTo(0, { immediate: false });
    } else {
      // Fallback for admin routes or before Lenis is initialized
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop; 
