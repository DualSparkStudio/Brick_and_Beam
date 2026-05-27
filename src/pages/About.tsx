import {
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import PremiumImage from '../components/PremiumImage'
import SEO from '../components/SEO'
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
        title="About Resort Booking System - Our Story & History"
        description="Discover the story behind Resort Booking System. Learn about our history, mission, and commitment to providing luxury experiences."
        keywords="about resort, resort history, luxury resort"
        url="https://resortbooking.com/about"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Hero Section */}
        <section className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[400px] py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-dark-blue-800 to-golden-500">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">Welcome to Resort Booking System</h1>
              <p className="text-sm sm:text-base lg:text-xl max-w-2xl mx-auto leading-relaxed">
                Resort Booking System is a destination that blends comfort, nature, and modern amenities. 
                Our resort offers a perfect escape from the hustle and bustle of city life, surrounded by natural beauty.
              </p>
            </div>
          </div>
        </section>

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
                    Welcome to Resort Booking System, your serene retreat where nature's calm meets thoughtful comfort. Our resort offers a refreshing escape from the everyday, inviting you to unwind in an environment designed for relaxation and rejuvenation amidst scenic beauty.
                  </p>
                  <p>
                    At Resort Booking System, we believe that every stay should feel like a personal journey into peace and comfort. Our philosophy is simple: luxury with nature — a space where guests can reconnect with the outdoors without giving up the conveniences of modern living. From cool breezes and green vistas to cozy interiors and attentive service, every element is crafted to make your stay memorable.
                  </p>
                </div>
              </div>
              
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/images/Exterior (Front).PNG"
                  alt="Resort Booking System - Front View"
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
                  src="/images/Exterior (back).PNG"
                  alt="Resort Booking System - Back View"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base text-justify">
                  <p>
                    Resort Booking System emerged as a nature-inspired hideaway where comfort harmonizes with breathtaking landscapes. This retreat was conceived to offer travellers an escape from urban life — a place where cool mountain air, panoramic views, and serene surroundings become part of every stay.
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
                Explore the beauty and elegance of Resort Booking System
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Image 1 - Front View */}
              <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src="/images/Exterior (Front).PNG"
                  alt="Resort Booking System - Front Exterior"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold p-4">Front Exterior View</p>
                </div>
              </div>

              {/* Image 2 - Back View */}
              <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src="/images/Exterior (back).PNG"
                  alt="Resort Booking System - Back Exterior"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold p-4">Back Exterior View</p>
                </div>
              </div>

              {/* Image 3 - Night View */}
              <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src="/images/exteror (night).jpg"
                  alt="Resort Booking System - Night View"
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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14671.936717416102!2d73.7584162481834!3d17.90826147912499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc269ff80f61731%3A0xffc74f4030ef9795!2sGrand%20Valley%20Resort%20Bhilar%20Annex!5e1!3m2!1sen!2sin!4v1769187769047!5m2!1sen!2sin" 
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
