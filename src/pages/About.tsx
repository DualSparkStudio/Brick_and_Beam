import {
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import PremiumImage from '../components/PremiumImage'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import { GOOGLE_MAPS_EMBED_URL } from '../config/brand'
import { PAGE_HERO_IMAGES, ABOUT_IMAGES } from '../config/galleryImages'
import { api } from '../lib/supabase'

const About: React.FC = () => {
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: 'info@resortbooking.com',
    phone: '+91 98765 43210',
    address: 'Sample Address, City, State, PIN Code'
  })

  useEffect(() => {
    const loadAdminContactInfo = async () => {
      try {
        const adminInfo = await api.getAdminInfo()
        setAdminContactInfo({
          email: adminInfo.email || 'info@resortbooking.com',
          phone: adminInfo.phone || '+91 98765 43210',
          address: adminInfo.address || 'Sample Address, City, State, PIN Code'
        })
      } catch (error) {
        // Keep default values
      }
    }
    
    loadAdminContactInfo()
  }, [])

  return (
    <>
      <SEO 
        title="About Brick and Beam - Our Story & History"
        description="Discover the story behind Brick and Beam. Learn about our history, mission, and commitment to providing luxury experiences."
        keywords="about resort, resort history, luxury resort"
        url="https://resortbooking.com/about"
      />
      <div className="min-h-screen bg-gray-50">
        <PageHero
          size="tall"
          title="Welcome to Brick and Beam"
          subtitle="A destination that blends comfort, nature, and modern amenities — your perfect escape surrounded by natural beauty."
          image={PAGE_HERO_IMAGES.about}
        />

        {/* About Us Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  About Us
                </h2>
                
                <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base text-justify">
                  <p>
                    Welcome to Brick and Beam, your serene retreat where nature's calm meets thoughtful comfort. Our resort offers a refreshing escape from the everyday, inviting you to unwind in an environment designed for relaxation and rejuvenation amidst scenic beauty.
                  </p>
                  <p>
                    At Brick and Beam, we believe that every stay should feel like a personal journey into peace and comfort. Our philosophy is simple: luxury with nature — a space where guests can reconnect with the outdoors without giving up the conveniences of modern living. From cool breezes and green vistas to cozy interiors and attentive service, every element is crafted to make your stay memorable.
                  </p>
                </div>
              </div>
              
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                  src={ABOUT_IMAGES.main}
                  alt="Brick and Beam - Front View"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                History
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative rounded-lg overflow-hidden shadow-lg order-2 lg:order-1">
                <img
                  src={ABOUT_IMAGES.history}
                  alt="Brick and Beam - Pool & Facade"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base text-justify">
                  <p>
                    Brick and Beam emerged as a nature-inspired hideaway where comfort harmonizes with breathtaking landscapes. This retreat was conceived to offer travellers an escape from urban life — a place where cool mountain air, panoramic views, and serene surroundings become part of every stay.
                  </p>
                  <p>
                    Over the years, our resort has grown into a favourite destination for couples, families, and nature lovers — a place where every sunrise and every quiet evening in the gardens adds a chapter to a visitor's story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resort Gallery Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Resort Gallery
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore the beauty and elegance of Brick and Beam
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Image 1 - Front View */}
              <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={ABOUT_IMAGES.main}
                  alt="Brick and Beam - Day View"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold p-4">Daytime Exterior</p>
                </div>
              </div>

              {/* Image 2 - Back View */}
              <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={ABOUT_IMAGES.history}
                  alt="Brick and Beam - Pool View"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold p-4">Pool & Villa</p>
                </div>
              </div>

              {/* Image 3 - Night View */}
              <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={ABOUT_IMAGES.night}
                  alt="Brick and Beam - Night View"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold p-4">Night Ambiance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Perfect Location
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Located in the heart of Mahabaleshwar, our resort offers the perfect balance 
                  of seclusion and accessibility. Just a short distance from major attractions 
                  yet worlds away from the everyday.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <MapPinIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span>{adminContactInfo.address}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <PhoneIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span>{adminContactInfo.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span>{adminContactInfo.email}</span>
                  </div>
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <iframe 
                  src={GOOGLE_MAPS_EMBED_URL} 
                  width="100%" 
                  height="450" 
                  style={{border: 0}} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[450px] rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
