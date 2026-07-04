import React from 'react'
import { motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import PremiumImage from '../components/PremiumImage'
import { PAGE_HERO_IMAGES } from '../config/galleryImages'

const Features: React.FC = () => {
  const facilities = [
    '4BHK Luxury Villa',
    'Kitchen',
    'Swimming pool (13 feet × 26 feet) with a separate kids pool',
    'Gated parking',
    'WiFi',
    '24-hour hot water available',
    'Music System',
  ]

  const villaDetails = [
    'The villa has 4 spacious bedrooms',
    'All bedrooms are air-conditioned',
    'Each bedroom has an attached bathroom with a Western-style toilet',
    'Extra mattresses are available',
    'Fresh linen and pillows are provided in all rooms',
  ]

  const featuredAmenities = [
    {
      title: '4BHK Luxury Villa',
      description:
        'A private 4-bedroom villa designed for families and groups, offering spacious living areas and a refined stay in Mahabaleshwar.',
      image: PAGE_HERO_IMAGES.features,
      icon: '🏡',
    },
    {
      title: 'Swimming Pool',
      description:
        'Enjoy a 13 feet × 26 feet swimming pool with a separate kids pool — perfect for a refreshing dip and relaxed afternoons.',
      image: '/images/gallery/pool-area.png',
      icon: '🏊',
    },
    {
      title: 'Kitchen',
      description:
        'A fully equipped kitchen so you can prepare meals at your convenience during your stay.',
      image: '/images/gallery/kitchen.png',
      icon: '🍳',
    },
    {
      title: 'Comfort & Connectivity',
      description:
        'Gated parking, WiFi, 24-hour hot water, and a music system — everything you need for a comfortable villa getaway.',
      image: '/images/hero/pool-facade-day.png',
      icon: '✨',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const renderList = (items: string[]) => (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start text-gray-700 group-hover:text-gray-900 transition-colors">
          <div className="w-1.5 h-1.5 bg-golden-500 rounded-full mr-3 flex-shrink-0 mt-2 group-hover:scale-150 transition-transform" />
          <span className="text-sm sm:text-base">{item}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Facilities & Amenities"
        subtitle="Discover the comforts and conveniences of our 4BHK luxury villa in Mahabaleshwar"
        image={PAGE_HERO_IMAGES.features}
      />

      {/* Facilities & Villa Details */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-md p-6 h-full group hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-golden-100 to-dark-blue-100 border border-golden-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                      🏨
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-golden-600 transition-colors">
                      Facilities & Amenities
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-5 leading-relaxed">
                      Everything you need for a comfortable and memorable stay at Brick and Beam.
                    </p>
                    {renderList(facilities)}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-md p-6 h-full group hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-golden-100 to-dark-blue-100 border border-golden-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                      🛏️
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-golden-600 transition-colors">
                      About the Villa
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-5 leading-relaxed">
                      Spacious bedrooms and thoughtful in-room comforts for every guest.
                    </p>
                    {renderList(villaDetails)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Amenities */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Experience the Villa
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Luxury living, private pool, and modern comforts in the heart of Mahabaleshwar
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {featuredAmenities.map((amenity, index) => (
              <motion.div key={index} variants={itemVariants} className="group relative">
                <div className="relative rounded-lg overflow-hidden bg-white shadow-md group-hover:shadow-xl transition-all duration-500">
                  <div className="relative h-72 lg:h-80 overflow-hidden">
                    <PremiumImage
                      src={amenity.image}
                      alt={amenity.title}
                      className="h-full w-full scale-100 group-hover:scale-110 transition-transform duration-700"
                      parallax
                      blur
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent" />
                    <div className="absolute top-6 left-6">
                      <div className="w-14 h-14 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 flex items-center justify-center text-2xl shadow-lg group-hover:bg-white transition-colors">
                        {amenity.icon}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 lg:p-8">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-golden-600 transition-colors">
                      {amenity.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Features
