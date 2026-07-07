import {
    ArrowRightIcon,
    CalendarIcon,
    CheckCircleIcon,
    MapPinIcon,
    StarIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import SEO from '../components/SEO'
import VillaBookingShowcase from '../components/VillaBookingShowcase'
import { useVilla } from '../contexts/VillaContext'
import { GOOGLE_MAPS_EMBED_URL, resolveVillaAddress } from '../config/brand'
import { ABOUT_IMAGES } from '../config/galleryImages'
import { formatCheckInOutLine } from '../lib/villa-check-times'
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

const Home: React.FC = () => {
  const { checkTimes } = useVilla()
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [features, setFeatures] = useState<Feature[]>([])
  const [featuresLoading, setFeaturesLoading] = useState(true)
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
  })

  // Load rooms from API
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setRoomsLoading(true)
        const data = await api.getRooms()
        
        // Single-villa site — show the villa listing only
        setRooms(data.slice(0, 1))
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
          phone: contactInfo.phone || '',
          address: resolveVillaAddress(contactInfo.address),
        })
      } catch (error) {
        // Keep default values if loading fails
      }
    }
    
    loadAdminContactInfo()
  }, [])

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
                <div className="relative h-[220px] sm:h-[380px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden">
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
                  Experience Opulence: Your Retreat of Refinement and Relaxation
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Nestled in the heart of the Mahabaleshwar, our opulent villa offers guests an unforgettable experience of refined luxury and impeccable service.
                </p>

                {/* Explore More Button */}
                <div className="flex items-center gap-4">
                  <Link
                    to="/contact"
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

        <VillaBookingShowcase room={rooms[0] ?? null} loading={roomsLoading} />

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
                        <p className="text-sage text-sm">{formatCheckInOutLine(checkTimes)}</p>
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

      </div>
    </>
  )
}

export default Home 
