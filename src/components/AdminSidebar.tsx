import {
    ArrowLeftOnRectangleIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    HomeIcon,
    MapPinIcon,
    QuestionMarkCircleIcon,
    SparklesIcon,
    StarIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LOGO_IMAGE } from '../config/galleryImages'

interface AdminSidebarProps {
  onClose?: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Villas', href: '/admin/rooms', icon: BuildingOfficeIcon },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarIcon },
    { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'FAQ', href: '/admin/faq', icon: QuestionMarkCircleIcon },
    { name: 'House Rules', href: '/admin/house-rules', icon: DocumentTextIcon },
    { name: 'Maintenance', href: '/admin/maintenance', icon: WrenchScrewdriverIcon },
    { name: 'Profile', href: '/admin/profile', icon: UserIcon },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      if (onClose) {
        onClose()
      }
    } catch (error) {
    }
  }

  return (
    <div className="flex flex-col h-full bg-dark-blue-800 border-r border-golden-500/20 w-64 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-golden-500/20 flex-shrink-0 bg-dark-blue-800">
        <div className="flex items-center">
          <img 
            src={LOGO_IMAGE} 
            alt="Brick and Beam Logo" 
            className="h-10 w-auto mr-3"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="h-10 w-10 bg-gradient-luxury rounded-lg flex items-center justify-center mr-3 hidden">
            <span className="text-golden font-bold text-sm">B&B</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-golden">Brick and Beam</h1>
            <p className="text-xs text-golden/70">Admin Panel</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-golden-500/20 flex-shrink-0">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-golden-500/20 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-golden" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-golden/70 truncate">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable if needed */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={handleLinkClick}
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isActive(item.href)
                ? 'bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white shadow-md'
                : 'text-white/70 hover:bg-dark-blue-700 hover:text-golden'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 ${
                isActive(item.href) ? 'text-white' : 'text-white/50 group-hover:text-golden'
              }`}
            />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Bottom actions - Fixed at bottom */}
      <div className="border-t border-golden-500/20 p-4 space-y-2 flex-shrink-0">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="group flex items-center px-3 py-2.5 text-sm font-medium text-white/70 rounded-lg hover:bg-dark-blue-700 hover:text-golden transition-colors duration-200"
        >
          <HomeIcon className="mr-3 h-5 w-5 text-white/50 group-hover:text-golden" />
          Back to Website
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full group flex items-center px-3 py-2.5 text-sm font-medium text-white/70 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-white/50 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar 
