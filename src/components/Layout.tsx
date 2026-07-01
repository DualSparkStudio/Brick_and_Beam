import {
    Bars3Icon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    HomeIcon,
    MapPinIcon,
    PhotoIcon,
    SparklesIcon,
    UserGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useVilla } from '../contexts/VillaContext'
import { api } from '../lib/supabase'
import { LOGO_IMAGE } from '../config/galleryImages'
import BackgroundEffects from './BackgroundEffects'
import SocialMediaWidget from './SocialMediaWidget'
import WhatsAppWidget from './WhatsAppWidget'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { displayName } = useVilla()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{
    first_name: string
    last_name: string
    email: string
    phone?: string
    address?: string
  }>({
    first_name: 'Admin',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  })

  const [scrolled, setScrolled] = useState(false)

  // Fetch admin info for footer
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const info = await api.getAdminInfo()
        setAdminInfo(info)
      } catch (error) {
      }
    }

    fetchAdminInfo()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const onLenisScroll = (e: Event) => {
      const detail = (e as CustomEvent<{ scroll: number }>).detail
      setScrolled(detail.scroll > 24)
    }
    window.addEventListener('app-scroll', onLenisScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('app-scroll', onLenisScroll)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setScrolled(false)
  }, [location.pathname])




  const isActive = (path: string) => location.pathname === path

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Rooms', href: '/rooms', icon: BuildingOfficeIcon },
    { name: 'Attractions', href: '/attractions', icon: MapPinIcon },
    { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
    { name: 'Features', href: '/features', icon: SparklesIcon },
    { name: 'About', href: '/about', icon: UserGroupIcon },
    { name: 'Contact', href: '/contact', icon: EnvelopeIcon },
  ]

  const isHomeHero = location.pathname === '/' && !scrolled
  const navSurface = isHomeHero
    ? 'border-white/10 bg-dark-blue-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.25)]'
    : 'border-white/40 bg-white/65 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
  const titleColor = isHomeHero ? 'text-white' : 'text-gray-900'
  const subtitleColor = isHomeHero ? 'text-white/70' : 'text-gray-600'
  const linkIdle = isHomeHero ? 'text-white/85 hover:text-golden-300' : 'text-gray-700 hover:text-golden-500'
  const linkActive = isHomeHero ? 'text-golden-300' : 'text-golden-500'
  const menuBtn = isHomeHero
    ? 'text-white/90 hover:text-golden-300 hover:bg-white/10'
    : 'text-gray-700 hover:text-golden-500 hover:bg-white/50'

  return (
    <div className="min-h-screen bg-white relative">
      <BackgroundEffects />
      {/* Navigation — glassmorphism */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ${navSurface}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="mr-3 rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-sm transition-colors group-hover:border-golden-500/40">
                  <img 
                    src={LOGO_IMAGE} 
                    alt="Brick and Beam Logo" 
                    className="h-14 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="h-14 w-14 bg-gradient-luxury rounded-lg flex items-center justify-center hidden">
                    <span className="text-golden font-bold text-xl">B&B</span>
                  </div>
                </div>
                <div>
                  <h1 className={`text-lg font-bold transition-colors duration-300 ${titleColor}`}>
                    Brick and Beam
                  </h1>
                  <p className={`text-xs transition-colors duration-300 ${subtitleColor}`}>
                    Your Perfect Getaway
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? `${linkActive} ${isHomeHero ? 'bg-white/10' : 'bg-golden-50/80'}`
                      : `${linkIdle} hover:bg-white/10`
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-golden-400" />
                  )}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/rooms"
                  className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isHomeHero
                      ? 'border border-golden-400/50 bg-golden-500/90 text-dark-blue-900 shadow-lg shadow-golden-500/20 hover:bg-golden-400'
                      : 'btn-primary rounded-lg'
                  }`}
                >
                  Book Now
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden rounded-xl p-2.5 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-golden-500/50 ${menuBtn}`}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10">
            <div
              className={`space-y-1 px-3 py-3 backdrop-blur-xl ${
                isHomeHero ? 'bg-dark-blue-900/50' : 'bg-white/75'
              }`}
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-xl px-3 py-3 text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? isHomeHero
                        ? 'bg-white/10 text-golden-300'
                        : 'bg-golden-50/90 text-golden-600'
                      : isHomeHero
                        ? 'text-white/90 hover:bg-white/10 hover:text-golden-300'
                        : 'text-gray-700 hover:bg-white/60 hover:text-golden-500'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              
              <div className={`space-y-3 border-t pt-4 pb-2 ${isHomeHero ? 'border-white/10' : 'border-gray-200/60'}`}>
                <Link
                  to="/rooms"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 ${
                    isHomeHero
                      ? 'bg-golden-500/90 text-dark-blue-900 hover:bg-golden-400'
                      : 'btn-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-cream-beige text-gray-800 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src={LOGO_IMAGE} 
                  alt="Brick and Beam Logo" 
                  className="h-12 w-auto mr-3 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="h-12 w-12 bg-gradient-luxury rounded-lg flex items-center justify-center mr-3 hidden">
                  <span className="text-golden font-bold text-lg">B&B</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Brick and Beam</h3>
                  <p className="text-sm text-gray-600">Your Perfect Getaway</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Experience luxury and comfort in the heart of nature. Our resort offers 
                stunning views, world-class amenities, and unforgettable memories.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <Link to="/rooms" className="text-gray-600 hover:text-golden-500 transition-colors">
                    Rooms & Suites
                  </Link>
                </li>
                <li>
                  <Link to="/attractions" className="text-gray-600 hover:text-golden-500 transition-colors">
                    Local Attractions
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="text-gray-600 hover:text-golden-500 transition-colors">
                    Photo Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-gray-600 hover:text-golden-500 transition-colors">
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-golden-500 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                {adminInfo.address && (
                  <li className="whitespace-pre-line">{adminInfo.address}</li>
                )}
                {!adminInfo.address && (
                  <>
                    <li>Bhilar, Mahabaleshwar, Maharashtra</li>
                    <li>India</li>
                  </>
                )}
                {adminInfo.phone && (
                  <li>Phone: {adminInfo.phone}</li>
                )}
                {!adminInfo.phone && (
                  <li>Phone: +91 123 456 7890</li>
                )}
                <li>Email: {adminInfo.email}</li>
              </ul>
              
              {/* Social Media Links */}
              <div>
                <h5 className="text-sm font-semibold mb-3 text-gray-900">Follow Us</h5>
                <div className="flex space-x-3">
                  <a
                    href="https://www.instagram.com/river_breeze_homestay?igsh=M2dnbW0wZ2I3MnE3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-200 hover:bg-pink-600 hover:text-white rounded-full flex items-center justify-center transition-colors duration-200 text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM15.156 7.987c.03.307.038.839.038 1.581v2.701c0 .742-.009 1.274-.038 1.581-.131.001-.581.002-1.362.002l-1.897.013h-2.564c-.44 0-.794-.006-1.091-.024-.858-.052-1.483-.311-1.975-.803S5.890 12.262 5.890 11.668v-2.701c0-.742.009-1.274.038-1.581.305-.708.81-1.195 1.571-1.463.761-.268 1.693-.372 2.865-.372h2.564c1.232 0 2.174.091 2.865.372.691.281 1.233.744 1.571 1.463zM11.017 6.072c1.644 0 2.977 1.333 2.977 2.977s-1.333 2.977-2.977 2.977-2.977-1.333-2.977-2.977 1.333-2.977 2.977-2.977zm0 1.424c-.858 0-1.553.695-1.553 1.553s.695 1.553 1.553 1.553 1.553-.695 1.553-1.553-.695-1.553-1.553-1.553zm3.85-.273c.384 0 .695.311.695.695s-.311.695-.695.695-.695-.311-.695-.695.311-.695.695-.695z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/${adminInfo.phone && adminInfo.phone.trim() ? (() => {
                      let phoneNumber = adminInfo.phone.replace(/\D/g, '')
                      if (!phoneNumber.startsWith('91')) {
                        phoneNumber = '91' + phoneNumber
                      }
                      return phoneNumber
                    })() : '919876543210'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-200 hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors duration-200 text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-600">
              <div className="flex flex-wrap justify-center sm:justify-start sm:items-center gap-x-4 gap-y-2">
                <span>© 2025 Brick and Beam. All rights reserved.</span>
                <span className="text-gray-400">•</span>
                <span className="text-golden-500 hover:text-golden-600 font-medium transition-colors duration-200">
                  <a href="/policy">Privacy Policy & Terms</a>
                </span>
              </div>
              <p className="text-center sm:text-right">
                Designed & Developed by{' '}
                <a
                  href="https://dualsparkstudio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-golden-500 hover:text-golden-600 font-medium transition-colors duration-200"
                >
                  DualSpark Studio
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Widgets */}
      <WhatsAppWidget />
      <SocialMediaWidget />
    </div>
  )
}

export default Layout 
