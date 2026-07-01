import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import { PAGE_HERO_IMAGES } from '../config/galleryImages'
import AppImage from '../components/AppImage'
import { GALLERY_CATEGORIES, GALLERY_IMAGES } from '../config/galleryImages'

interface GalleryImage {
  id: number
  src: string
  title: string
  category: string
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = GALLERY_CATEGORIES

  useEffect(() => {
    loadGalleryImages()
  }, [])

  const loadGalleryImages = async () => {
    try {
      setLoading(true)
      setImages(GALLERY_IMAGES)
    } catch (error) {
      console.error('Error loading gallery images:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory)

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'auto'
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    let newIndex: number
    
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1
    } else {
      newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1
    }
    
    setSelectedImage(filteredImages[newIndex])
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return
      
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigateImage('prev')
      if (e.key === 'ArrowRight') navigateImage('next')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, filteredImages])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Photo Gallery - Brick and Beam"
        description="Explore stunning photos of Brick and Beam - luxury rooms, beautiful exterior views, and our restaurant."
        keywords="Brick and Beam gallery, resort photos, luxury resort gallery"
        url="https://resortbooking.com/gallery"
      />
      
      <div className="min-h-screen bg-gray-50">
        <PageHero
          title="Photo Gallery"
          subtitle="Explore the beauty and elegance of Brick and Beam through our curated collection of photographs"
          image={PAGE_HERO_IMAGES.gallery}
        >
          <PhotoIcon className="mx-auto mb-4 h-12 w-12 text-golden-300 sm:h-14 sm:w-14" />
        </PageHero>

        {/* Category Filter */}
        <section className="py-6 sm:py-8 bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
            >
              <AnimatePresence>
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 ${
                      index % 5 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                    }`}
                    onClick={() => openLightbox(image)}
                  >
                    <div className={`relative ${index % 5 === 0 ? 'h-48 sm:h-80 lg:h-96' : 'h-48 sm:h-56 lg:h-64'}`}>
                      <AppImage
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        fallback="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-blue-800/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg">{image.title}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-golden-500/80 text-white text-xs rounded-full capitalize">
                          {image.category}
                        </span>
                      </div>
                      
                      {/* View Icon */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <PhotoIcon className="h-6 w-6 sm:h-7 sm:w-7 text-dark-blue-800" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredImages.length === 0 && (
              <div className="text-center py-16">
                <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Gallery photos are being updated</p>
                <p className="text-gray-500 text-sm">New resort images will be added here soon.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-dark-blue-800 to-golden-500">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Experience This Beauty?
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-8">
              Book your stay and create your own beautiful memories at Brick and Beam
            </p>
            <Link
              to="/rooms"
              className="inline-block bg-white text-dark-blue-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
            >
              Book Your Stay
            </Link>
          </div>
        </section>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-white/20 transition-colors"
              >
                <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </button>

              {/* Image */}
              <motion.div
                key={selectedImage.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-5xl max-h-[85vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <AppImage
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full max-h-[75vh] object-contain rounded-lg"
                />
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 rounded-b-lg">
                  <h3 className="text-white font-bold text-lg sm:text-xl">{selectedImage.title}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-golden-500/80 text-white text-sm rounded-full capitalize">
                    {selectedImage.category}
                  </span>
                </div>
              </motion.div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm">
                  {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default Gallery
