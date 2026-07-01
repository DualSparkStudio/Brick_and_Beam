import {
    ArrowRightIcon,
    CalendarIcon,
    CheckCircleIcon,
    MapPinIcon,
    StarIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AttractionCard from '../components/AttractionCard'
import FAQ from '../components/FAQ'
import HeroSection from '../components/HeroSection'
import RoomCarouselCard from '../components/RoomCarouselCard'
import SEO from '../components/SEO'
import { GOOGLE_MAPS_EMBED_URL } from '../config/brand'
import { ABOUT_IMAGES } from '../config/galleryImages'
import type { Room } from '../lib/supabase'
import { api } from '../lib/supabase'

interface Feature {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface Attraction {
  id: number;
  name: string;
  description: string;
  images: string[];
  distance: string;
  travel_time: string;
  type: string;
  highlights: string[];
  best_time: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [features, setFeatures] = useState<Feature[]>([])
  const [featuresLoading, setFeaturesLoading] = useState(true)
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [attractionsLoading, setAttractionsLoading] = useState(true)
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: '',
    phone: ''
  })
  const [expandedAmenities, setExpandedAmenities] = useState<{ [key: string]: boolean }>({})
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleRoomActivate = useCallback((index: number) => {
    setCurrentRoomIndex(index)
  }, [])

  // Gallery modal state
  const [galleryModal, setGalleryModal] = useState<{
    isOpen: boolean
    images: string[]
    title: string
    currentIndex: number
  }>({
    isOpen: false,
    images: [],
    title: '',
    currentIndex: 0
  })

  // Gallery functions
  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      images: [],
      title: '',
      currentIndex: 0
    })
  }

  const nextImage = () => {
    setGalleryModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

  const prevImage = () => {
    setGalleryModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!galleryModal.isOpen) return
      
      if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'Escape') {
        closeGallery()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [galleryModal.isOpen])

  // Load rooms from API
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setRoomsLoading(true)
        const data = await api.getRooms()
        
        // Just use the first 3 rooms with their existing slugs
        setRooms(data.slice(0, 3))
      } catch (error) {
      } finally {
        setRoomsLoading(false)
      }
    }
    
    loadRooms()
  }, [])

  // Load features from API
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setFeaturesLoading(true)
        const data = await api.getFeatures()
        setFeatures(data)
      } catch (error) {
      } finally {
        setFeaturesLoading(false)
      }
    }
    
    loadFeatures()
  }, [])

  // Load admin contact info
  useEffect(() => {
    const loadAdminContactInfo = async () => {
      try {
        const contactInfo = await api.getAdminInfo()
        setAdminContactInfo({
          email: contactInfo.email,
          phone: contactInfo.phone
        })
      } catch (error) {
        // Keep default values if loading fails
      }
    }
    
    loadAdminContactInfo()
  }, [])

  // Load attractions for homepage preview
  useEffect(() => {
    const loadAttractions = async () => {
      try {
        setAttractionsLoading(true)
        const data = await api.getTouristAttractions()
        // Show first 6 attractions on homepage
        setAttractions(data?.slice(0, 6) || [])
      } catch (error) {
        // Keep empty array if loading fails
        setAttractions([])
      } finally {
        setAttractionsLoading(false)
      }
    }
    
    loadAttractions()
  }, [])

  // Auto-scroll carousel on mobile when currentRoomIndex changes
  useEffect(() => {
    if (carouselRef.current && window.innerWidth < 640) {
      const roomCards = carouselRef.current.querySelectorAll('[data-room-index]')
      const activeCard = roomCards[currentRoomIndex] as HTMLElement
      if (activeCard) {
        activeCard.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [currentRoomIndex])

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      StarIcon: StarIcon,
      CheckCircleIcon: CheckCircleIcon,
      CalendarIcon: CalendarIcon,
      MapPinIcon: MapPinIcon,
      WifiIcon: () => <span>📶</span>,
      BeakerIcon: () => <span>🧪</span>,
      SparklesIcon: () => <span>✨</span>,
      CakeIcon: () => <span>🍰</span>,
      ShieldCheckIcon: () => <span>🛡️</span>,
      ClockIcon: () => <span>⏰</span>,
      UserGroupIcon: () => <span>👥</span>,
      SunIcon: () => <span>☀️</span>,
      MapIcon: () => <span>🗺️</span>,
      TruckIcon: () => <span>🚚</span>,
      CreditCardIcon: () => <span>💳</span>,
      UserIcon: () => <span>👤</span>
    };
    
    return iconMap[iconName] || StarIcon;
  };

  // Get featured features for home page
  const featuredFeatures = features.filter(f => f.is_featured && f.is_active).slice(0, 4);

  const toggleAmenities = (roomId: string) => {
    setExpandedAmenities(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }))
  }

  // Gallery functions for attractions
  const openAttractionGallery = (images: string[], title: string) => {
    setGalleryModal({
      isOpen: true,
      images,
      title,
      currentIndex: 0
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-blue-100 text-blue-800',
      fort: 'bg-red-100 text-red-800',
      temple: 'bg-yellow-100 text-yellow-800',
      market: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-indigo-100 text-indigo-800',
      park: 'bg-emerald-100 text-emerald-800',
      agriculture: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <SEO 
        title="Brick and Beam - Luxury Villa Stay"
        description="Experience luxury and comfort with Brick and Beam. Book your perfect getaway with stunning views, premium amenities, and exceptional service."
        keywords="Brick and Beam, resort booking, luxury accommodation, booking platform"
        url="https://grandvalleyresort.com"
      />
      <div className="bg-cream-beige">
        <HeroSection />

        {/* About Us Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Image */}
              <div className="relative">
                <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden">
                  <img
                    src={ABOUT_IMAGES.main}
                    alt="Brick and Beam villa exterior with pool"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="space-y-6 sm:space-y-8">
                {/* Sub-heading */}
                <div className="flex items-center gap-2">
                  <span className="text-golden-500 text-sm sm:text-base font-medium tracking-wider">
                    ~ ABOUT Brick and Beam ~
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-gray-900 leading-tight">
                  Where Comfort Meets Nature
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Brick and Beam is described as a destination where comfort meets nature, blending a relaxed, natural environment with good basic amenities. It's surrounded by greenery — ideal if you want a quieter, more scenic retreat.
                </p>

                {/* Explore More Button */}
                <div className="flex items-center gap-4">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <span>Explore More</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>

                  {/* Decorative Icons */}
                  <div className="flex items-center gap-4 text-golden-500">
                    {/* Umbrella Icon */}
                    <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2c-4.97 0-9 4.03-9 9 0 1.1.9 2 2 2h2v-4c0-1.1.9-2 2-2s2 .9 2 2v4h2c1.1 0 2-.9 2-2 0-4.97-4.03-9-9-9zm0 2c3.86 0 7 3.14 7 7 0 .55-.45 1-1 1h-2v-2c0-1.1-.9-2-2-2s-2 .9-2 2v2H6c-.55 0-1-.45-1-1 0-3.86 3.14-7 7-7z"/>
                      <path d="M12 20v-6h-2v6h2z"/>
                    </svg>
                    {/* Wavy Line Icon */}
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                      <path d="M2 8c2 0 4-2 6-2s4 2 6 2 4-2 6-2 4 2 6 2M2 16c2 0 4-2 6-2s4 2 6 2 4-2 6-2 4 2 6 2"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="scroll-perf-section py-12 sm:py-16 lg:py-20 bg-cream-beige relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-12 sm:mb-16">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
                {/* Left Side - Title */}
                <div className="flex-1">
                  {/* Sub-heading with decorative lines */}
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-4 text-golden-500" fill="currentColor" viewBox="0 0 24 4">
                      <path d="M0 2c2 0 4-2 6-2s4 2 6 2 4-2 6-2 4 2 6 2"/>
                    </svg>
                    <span className="text-golden-500 text-sm sm:text-base font-medium tracking-wider">
                      ROOM & SUITES
                    </span>
                    <svg className="w-8 h-4 text-golden-500" fill="currentColor" viewBox="0 0 24 4">
                      <path d="M0 2c2 0 4-2 6-2s4 2 6 2 4-2 6-2 4 2 6 2"/>
                    </svg>
                  </div>
                  {/* Main Title */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
                    Discover Our Rooms
                  </h2>
                </div>

                {/* Right Side - Description & Button */}
                <div className="flex-1 lg:max-w-md">
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                    Explore a variety of rooms tailored to your comfort and style. Whether you're traveling solo or with family, find the perfect space to unwind.
                  </p>
                  <div>
                    <Link
                      to="/rooms"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                    >
                      <span>Explore All Suite</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms Carousel */}
            {roomsLoading ? (
              <div className="flex justify-center gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-full max-w-sm animate-pulse">
                    <div className="h-64 bg-gray-300 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  </div>
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <div className="relative">
                {/* Carousel Container */}
                <div 
                  ref={carouselRef}
                  data-lenis-prevent
                  className="flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-4 sm:pb-0 sm:justify-center sm:overflow-hidden"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                  onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
                  onTouchEnd={() => {
                    if (!touchStart || !touchEnd) return
                    const distance = touchStart - touchEnd
                    const isLeftSwipe = distance > 50
                    const isRightSwipe = distance < -50
                    
                    if (isLeftSwipe && currentRoomIndex < rooms.length - 1) {
                      setCurrentRoomIndex(currentRoomIndex + 1)
                    }
                    if (isRightSwipe && currentRoomIndex > 0) {
                      setCurrentRoomIndex(currentRoomIndex - 1)
                    }
                  }}
                >
<<<<<<< HEAD
                  {rooms.map((room, index) => (
                    <RoomCarouselCard
                      key={room.id}
                      room={room}
                      index={index}
                      isCenter={index === currentRoomIndex}
                      onActivate={handleRoomActivate}
                    />
                  ))}
=======
                  {rooms.map((room, index) => {
                    const isCenter = index === currentRoomIndex;
                    const getMainImage = () => {
                      if (room.images && room.images.length > 0) {
                        const firstValidImage = room.images.find((img: string) => img && img.trim())
                        if (firstValidImage) return firstValidImage
                      }
                      return room.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    }
                    
                    const imageUrl = getMainImage();
                    
                    return (
                      <motion.div
                        key={room.id}
                        data-room-index={index}
                        className={`relative flex-shrink-0 ${isCenter ? 'w-[85%] sm:w-auto sm:flex-1 sm:max-w-md lg:max-w-lg' : 'w-[85%] sm:w-auto sm:flex-1 sm:max-w-xs'} cursor-pointer snap-center`}
                        onMouseEnter={() => {
                          if (window.innerWidth >= 640) {
                            setCurrentRoomIndex(index)
                          }
                        }}
                        onClick={() => {
                          if (window.innerWidth < 640) {
                            setCurrentRoomIndex(index)
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        animate={{
                          opacity: isCenter ? 1 : 0.75,
                          scale: isCenter ? 1 : 0.95,
                          zIndex: isCenter ? 10 : 1
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 0.8,
                          opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                          scale: { 
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                          }
                        }}
                        whileHover={{
                          scale: isCenter ? 1.02 : 0.97,
                          transition: { 
                            type: "spring",
                            stiffness: 400,
                            damping: 20
                          }
                        }}
                        layout
                      >
                        <motion.div 
                          className="relative rounded-2xl overflow-hidden shadow-lg bg-white"
                          animate={{
                            boxShadow: isCenter 
                              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                          }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                        >
                          {/* Image */}
                          <motion.div 
                            className="relative overflow-hidden h-64 sm:h-72"
                            animate={{
                              scale: 1
                            }}
                            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                          >
                            <motion.img
                              src={imageUrl}
                              alt={room.name}
                              className="w-full h-full object-cover"
                              animate={{
                                scale: isCenter ? 1.05 : 1
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                              }}
                              whileHover={{
                                scale: isCenter ? 1.1 : 1.05,
                                transition: { 
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25
                                }
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            {!room.is_active && (
                              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold">
                                Unavailable
                              </div>
                            )}
                          </motion.div>

                          {/* Content */}
                          <motion.div
                            className={isCenter ? "p-6 sm:p-8" : "p-4 sm:p-6"}
                            animate={{
                              scale: 1
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          >
                            <motion.h3
                              className={`font-semibold text-gray-900 mb-3 ${isCenter ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'}`}
                              animate={{
                                opacity: 1
                              }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                              {room.name}
                            </motion.h3>
                            
                            {/* Room Details */}
                            <motion.div
                              className="space-y-3"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                delay: isCenter ? 0.15 : 0.1
                              }}
                            >
                              {/* Description - Truncated */}
                              {room.description && (
                                <p className={`text-gray-600 ${isCenter ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} line-clamp-2`}>
                                  {room.description.length > (isCenter ? 120 : 80) 
                                    ? `${room.description.substring(0, isCenter ? 120 : 80)}...` 
                                    : room.description}
                                </p>
                              )}

                              {/* Amenities - Show first 3 */}
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities.slice(0, isCenter ? 4 : 3).map((amenity: string, idx: number) => (
                                    <span 
                                      key={idx}
                                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-golden-50 text-golden-700 border border-golden-200"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                  {room.amenities.length > (isCenter ? 4 : 3) && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                                      +{room.amenities.length - (isCenter ? 4 : 3)} more
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* View Details Button - Only for center card */}
                              {isCenter && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="pt-2"
                                >
                                  <Link
                                    to="/rooms"
                                    className="inline-flex items-center gap-2 text-golden-500 hover:text-golden-600 font-medium text-sm transition-colors duration-200"
                                  >
                                    <span>View Details</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                  </Link>
                                </motion.div>
                              )}
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
>>>>>>> 9f9f3922271f7bb3a97135500fa67d5e3b1f6a45
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No rooms available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tourist Attractions Section */}
        {attractions.length > 0 && (
          <div className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">
                  Explore Nearby Attractions
                </h2>
                <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto">
                  Discover the beautiful tourist attractions near our resort. Plan your perfect getaway with easy access to stunning beaches, historic forts, and scenic viewpoints.
                </p>
              </div>

              {attractionsLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="h-64 sm:h-72 bg-gray-300"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-300 rounded mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
                    {attractions.map((attraction) => (
                      <AttractionCard
                        key={attraction.id}
                        compact
                        id={attraction.id}
                        name={attraction.name}
                        description={attraction.description}
                        images={attraction.images}
                        distance={attraction.distance}
                        travel_time={attraction.travel_time}
                        type={attraction.type}
                        highlights={attraction.highlights}
                        best_time={attraction.best_time}
                        category={attraction.category}
                        onImageClick={() => openAttractionGallery(attraction.images, attraction.name)}
                        getCategoryColor={getCategoryColor}
                      />
                    ))}
                  </div>

                  {/* View All Attractions Button */}
                  <div className="text-center mt-8">
                    <Link
                      to="/attractions"
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-green-700 group"
                    >
                      <span>View All Attractions</span>
                      <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Location & Map Section */}
        <div className="py-8 sm:py-10 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-forest mb-2">Find Us</h2>
              <p className="text-sm sm:text-base text-sage max-w-2xl mx-auto">
                Located in beautiful Mahabaleshwar — easy access to all major attractions
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
              {/* Map */}
              <div className="order-2 lg:order-1">
                <div className="relative rounded-xl overflow-hidden shadow-lg h-full min-h-[220px]">
                  <iframe 
                    src={GOOGLE_MAPS_EMBED_URL} 
                    width="100%" 
                    height="280" 
                    style={{border: 0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[220px] sm:h-[260px] lg:h-full lg:min-h-[280px]"
                  ></iframe>
                </div>
              </div>
              
              {/* Location Details */}
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-lg h-full">
                  <h3 className="text-lg font-bold text-forest mb-4">Our Location</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2.5">
                      <MapPinIcon className="h-5 w-5 text-forest-800 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-forest text-sm">Address</h4>
                        <p className="text-sage text-sm leading-relaxed">
                          {adminContactInfo.address ? (
                            <span>
                              {adminContactInfo.address.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                  {line}
                                  {index < adminContactInfo.address.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </span>
                          ) : (
                            <>Brick and Beam<br />Bhilar, Mahabaleshwar<br />Maharashtra, India</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5">
                      <CalendarIcon className="h-5 w-5 text-forest-800 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-forest text-sm">Check-in / Check-out</h4>
                        <p className="text-sage text-sm">Check-in: 1:00 PM · Check-out: 10:00 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5">
                      <svg className="h-5 w-5 text-forest-800 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-forest text-sm">Contact</h4>
                        <p className="text-sage text-sm">{adminContactInfo.phone}<br />{adminContactInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">Ready to Experience Brick and Beam?</h2>
            <p className="text-lg sm:text-xl text-sage mb-6 sm:mb-8 max-w-3xl mx-auto">
              Book your stay today and create memories that will last a lifetime
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link
                to="/rooms"
                className="btn-luxury inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRightIcon className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery Modal */}
        {galleryModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl max-h-full">
              <button className="absolute top-4 right-4 text-white text-3xl z-10" onClick={closeGallery}>
                &times;
              </button>
              <div className="relative">
                <img
                  src={galleryModal.images[galleryModal.currentIndex]}
                  alt={galleryModal.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
                onClick={prevImage}
              >
                &lt;
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
                onClick={nextImage}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home 
