import React, { useEffect, useState } from 'react'
import { StarIcon, UserIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { api } from '../lib/supabase'
import toast from 'react-hot-toast'

interface Review {
  id: number
  guest_name: string
  rating: number
  comment: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  location?: string
}

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await api.getTestimonials()
      setReviews(data)
    } catch (error) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="w-5 h-5 text-gray-300" />
          )
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-cream-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">
            Guest Reviews
          </h2>
          <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto mb-8">
            Read testimonials from our satisfied guests who experienced luxury at its finest
          </p>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="testimonial-card animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.slice(0, 6).map((review, index) => (
              <div 
                key={review.id} 
                className="testimonial-card animate-scale-in group hover:shadow-xl transition-shadow duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  {renderStars(review.rating)}
                  {review.is_featured && (
                    <span className="bg-forest-800 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
                
                <blockquote className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                  "{review.comment}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div>
                    <cite className="font-semibold text-forest not-italic">
                      {review.guest_name}
                    </cite>
                    {review.location && (
                      <p className="text-xs text-gray-500 mt-1">{review.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* External Reviews Links Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-forest mb-8">
            See More Reviews
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Grand+Valley+Resort+Bhilar"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">View on Google</h4>
              <p className="text-sm text-gray-600">Read all Google reviews</p>
            </a>
          </div>
        </div>

        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button className="btn-secondary">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsSection 
