import {
    EyeIcon,
    MapPinIcon,
    PencilIcon,
    PlusIcon,
    StarIcon,
    TrashIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { TouristAttraction } from '../lib/supabase'
import { api } from '../lib/supabase'

const AdminTouristAttractions: React.FC = () => {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedAttraction, setSelectedAttraction] = useState<TouristAttraction | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    images: [] as string[],
    location: '',
    distance_from_resort: '',
    estimated_time: '',
    category: '',
    rating: '',
    google_maps_url: '',
    is_featured: false,
    is_active: true,
    display_order: ''
  })

  const categories = ['Beach', 'Fort', 'Temple', 'Market', 'Viewpoint', 'Museum', 'Park']

  useEffect(() => {
    loadAttractions()
  }, [])

  const loadAttractions = async () => {
    try {
      setLoading(true)
      const data = await api.getAllTouristAttractions()
      setAttractions(data)
    } catch (error) {
      toast.error('Failed to load tourist attractions')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (mode: 'add' | 'edit' | 'view', attraction?: TouristAttraction) => {
    setModalMode(mode)
    if (attraction) {
      setSelectedAttraction(attraction)
      setFormData({
        name: attraction.name,
        description: attraction.description,
        image_url: attraction.image_url || '',
        images: attraction.images || [],
        location: attraction.location,
        distance_from_resort: attraction.distance_from_resort.toString(),
        estimated_time: attraction.estimated_time,
        category: attraction.category,
        rating: attraction.rating.toString(),
        google_maps_url: attraction.google_maps_url || '',
        is_featured: attraction.is_featured,
        is_active: attraction.is_active,
        display_order: attraction.display_order.toString()
      })
    } else {
      setSelectedAttraction(null)
      setFormData({
        name: '',
        description: '',
        image_url: '',
        images: [],
        location: '',
        distance_from_resort: '',
        estimated_time: '',
        category: '',
        rating: '',
        google_maps_url: '',
        is_featured: false,
        is_active: true,
        display_order: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedAttraction(null)
    setFormData({
      name: '',
      description: '',
      image_url: '',
      images: [],
      location: '',
      distance_from_resort: '',
      estimated_time: '',
      category: '',
      rating: '',
      google_maps_url: '',
      is_featured: false,
      is_active: true,
      display_order: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const attractionData = {
        ...formData,
        distance_from_resort: parseFloat(formData.distance_from_resort),
        rating: parseFloat(formData.rating),
        display_order: parseInt(formData.display_order) || 0,
        images: formData.images.filter(img => img.trim() !== '') // Remove empty strings
      }

      if (modalMode === 'add') {
        await api.createTouristAttraction(attractionData)
        toast.success('Tourist attraction created successfully')
      } else if (modalMode === 'edit' && selectedAttraction) {
        await api.updateTouristAttraction(selectedAttraction.id, attractionData)
        toast.success('Tourist attraction updated successfully')
      }

      closeModal()
      loadAttractions()
    } catch (error) {
      toast.error('Failed to save tourist attraction')
    }
  }

  const addImageUrl = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    })
  }

  const removeImageUrl = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const updateImageUrl = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({
      ...formData,
      images: newImages
    })
  }

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this tourist attraction?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await api.deleteTouristAttraction(id)
                toast.success('Tourist attraction deleted successfully')
                loadAttractions()
              } catch (error) {
                toast.error('Failed to delete tourist attraction')
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Beach: 'bg-blue-100 text-blue-800',
      Fort: 'bg-red-100 text-red-800',
      Temple: 'bg-yellow-100 text-yellow-800',
      Market: 'bg-green-100 text-green-800',
      Viewpoint: 'bg-purple-100 text-purple-800',
      Museum: 'bg-indigo-100 text-indigo-800',
      Park: 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tourist Attractions</h1>
          <p className="mt-2 text-gray-600">Manage places to visit in Mahabaleshwar</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Attractions</h3>
            <p className="text-3xl font-bold text-blue-600">{attractions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Featured</h3>
            <p className="text-3xl font-bold text-green-600">{attractions.filter(a => a.is_featured).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Active</h3>
            <p className="text-3xl font-bold text-purple-600">{attractions.filter(a => a.is_active).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Avg Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {attractions.length > 0 
                ? (attractions.reduce((sum, a) => sum + a.rating, 0) / attractions.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">All Attractions</h2>
            <span className="text-sm text-gray-500">({attractions.length} attractions)</span>
          </div>
          <button
            onClick={() => openModal('add')}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Attraction
          </button>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div key={attraction.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={attraction.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={attraction.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 flex space-x-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(attraction.category)}`}>
                    {attraction.category}
                  </span>
                  {attraction.is_featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex items-center bg-white rounded-full px-2 py-1">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{attraction.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{attraction.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{attraction.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {attraction.location}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Distance: {attraction.distance_from_resort} km</span>
                    <span className="text-gray-500">{attraction.estimated_time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('view', attraction)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openModal('edit', attraction)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(attraction.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attraction.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {attraction.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {attractions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPinIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tourist attractions yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding the first tourist attraction in Mahabaleshwar.</p>
            <button
              onClick={() => openModal('add')}
              className="btn-primary"
            >
              Add First Attraction
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add Tourist Attraction' : 
                   modalMode === 'edit' ? 'Edit Tourist Attraction' : 'View Tourist Attraction'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                      disabled={modalMode === 'view'}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance from Resort (km) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distance_from_resort}
                      onChange={(e) => setFormData({ ...formData, distance_from_resort: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time *
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_time}
                      onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                      placeholder="e.g., 30 minutes, 2 hours"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating (1-5) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Image URL (for backward compatibility)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    disabled={modalMode === 'view'}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Images (Multiple URLs)
                    </label>
                    {modalMode !== 'view' && (
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add Image
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={modalMode === 'view'}
                          placeholder="https://example.com/image.jpg"
                        />
                        {modalMode !== 'view' && (
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.images.length === 0 && modalMode === 'view' && (
                      <p className="text-sm text-gray-500">No additional images</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={modalMode === 'view'}
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Attraction</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={modalMode === 'view'}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                {modalMode !== 'view' && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {modalMode === 'add' ? 'Create Attraction' : 'Update Attraction'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminTouristAttractions 
