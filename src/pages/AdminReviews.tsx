import {
    EyeIcon,
    PencilIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Testimonial } from '../lib/supabase'
import { api } from '../lib/supabase'

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedReview, setSelectedReview] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState<{
    guest_name: string
    rating: number
    comment: string
    is_featured: boolean
    is_active: boolean
    source: 'website' | 'google'
  }>({
    guest_name: '',
    rating: 5,
    comment: '',
    is_featured: false,
    is_active: true,
    source: 'website'
  })

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  const loadReviews = async () => {
    try {
      setLoading(true)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
      
      const dataPromise = api.getAllTestimonials()
      const data = await Promise.race([dataPromise, timeoutPromise])
      
      setReviews(data || [])
    } catch (error) {
      toast.error('Failed to load reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const openModal = (mode: 'add' | 'edit' | 'view', review?: Testimonial) => {
    setModalMode(mode)
    setSelectedReview(review || null)
    
    if (mode === 'add') {
      const newFormData = {
        guest_name: '',
        rating: 5,
        comment: '',
        is_featured: false,
        is_active: true,
        source: 'website' as const
      }
      setFormData(newFormData)
    } else if (review) {
      const editFormData = {
        guest_name: review.guest_name,
        rating: review.rating,
        comment: review.comment,
        is_featured: review.is_featured,
        is_active: review.is_active,
        source: review.source || 'website' as const
      }
      setFormData(editFormData)
    }
    
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    
    // Validate form data
    if (!formData.guest_name.trim()) {
      toast.error('Guest name is required')
      return
    }
    
    if (!formData.comment.trim()) {
      toast.error('Comment is required')
      return
    }
    
    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Rating must be between 1 and 5')
      return
    }
    
    try {
      if (modalMode === 'add') {
        await api.createTestimonial(formData)
        toast.success('Review added successfully!')
      } else if (modalMode === 'edit' && selectedReview) {
        
        // Try the normal update first
        try {
          const result = await api.updateTestimonial(selectedReview.id, formData)
          toast.success('Review updated successfully!')
        } catch (updateError) {
          
          // Enhanced error handling for RLS and other issues
          if (updateError instanceof Error) {
            if (updateError.message.includes('policy') || updateError.message.includes('permission') || updateError.message.includes('RLS')) {
              
              try {
                await api.deleteTestimonial(selectedReview.id)
                const newReview = await api.createTestimonial(formData)
                toast.success('Review updated successfully!')
              } catch (workaroundError) {
                toast.error('Update failed: Database permission issue. Please check Supabase RLS policies.')
                throw updateError // Throw the original error
              }
            } else {
              // For other types of errors, throw them immediately
              throw updateError
            }
          } else {
            throw updateError
          }
        }
      } else {
        toast.error('Invalid operation state')
        return
      }
      
      closeModal()
      await loadReviews() // Ensure reload completes
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to save review: ${errorMessage}`)
    }
  }

  const handleDelete = async (review: Testimonial) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete the review by {review.guest_name}?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await api.deleteTestimonial(review.id)
                toast.success('Review deleted successfully!')
                loadReviews()
              } catch (error) {
                toast.error('Failed to delete review')
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      icon: '⚠️'
    })
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            {star <= rating ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
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

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'google':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviews Management</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Manage guest reviews and testimonials</p>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Debug: {loading ? 'Loading...' : `Found ${reviews.length} reviews`}
            </p>
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={loadReviews}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Manual Reload'}
              </button>
              {reviews.length > 0 && (
                <button 
                  onClick={async () => {
                    const firstReview = reviews[0]
                    try {
                      const testUpdate = {
                        guest_name: firstReview.guest_name,
                        rating: firstReview.rating,
                        comment: firstReview.comment + ' [TEST UPDATE]',
                        is_featured: firstReview.is_featured,
                        is_active: firstReview.is_active,
                        source: firstReview.source || 'website'
                      }
                      const result = await api.updateTestimonial(firstReview.id, testUpdate)
                      toast.success('Test update successful!')
                      loadReviews()
                    } catch (error) {
                      toast.error(`Test update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Test Update First Review
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Total Reviews</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{reviews.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Featured</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{reviews.filter(r => r.is_featured).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Active</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{reviews.filter(r => r.is_active).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Avg Rating</h3>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm sm:text-base"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Review
            </button>
            <button
              onClick={loadReviews}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm sm:text-base"
              disabled={loading}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.length > 0 ? reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.guest_name}</div>
                        {review.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      "{review.comment}"
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSourceBadgeColor(review.source || 'website')}`}>
                      {review.source || 'website'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      review.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {review.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', review)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Review"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', review)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                        title="Edit Review"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Review"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-500">Add your first review to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <UserIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{review.guest_name}</h3>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-xs text-gray-600">({review.rating})</span>
                      </div>
                      {review.is_featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openModal('view', review)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openModal('edit', review)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(review)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 line-clamp-2">"{review.comment}"</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSourceBadgeColor(review.source || 'website')}`}>
                      {review.source || 'website'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      review.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {review.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-500">Add your first review to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal()
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 sticky top-0 bg-white z-10 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {modalMode === 'add' ? 'Add Review' : modalMode === 'edit' ? 'Edit Review' : 'View Review'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {modalMode === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReview?.guest_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="mt-1 flex items-center">
                      {renderStars(selectedReview?.rating || 0)}
                      <span className="ml-2 text-sm text-gray-600">({selectedReview?.rating})</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comment</label>
                    <p className="mt-1 text-sm text-gray-900">"{selectedReview?.comment}"</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReview?.source || 'website'}</p>
                  </div>
                  <div className="flex space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Featured</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReview?.is_featured ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Active</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReview?.is_active ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReview && formatDate(selectedReview.created_at)}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                    <input
                      type="text"
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="mt-1">
                      {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comment</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as 'website' | 'google' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="website">Website</option>
                      <option value="google">Google</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 order-1 sm:order-2"
                    >
                      {modalMode === 'add' ? 'Add Review' : 'Update Review'}
                    </button>
                  </div>
                </form>
              )}
              
              {modalMode === 'view' && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => openModal('edit', selectedReview!)}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 order-1 sm:order-2"
                  >
                    Edit Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminReviews 
