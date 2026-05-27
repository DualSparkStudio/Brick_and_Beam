import {
    CheckCircleIcon,
    EyeIcon,
    PencilIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from 'react-modal'
import type { Facility } from '../lib/supabase'
import { api } from '../lib/supabase'

Modal.setAppElement('#root') // or your app root element

const AdminFacilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true
  })
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      setLoading(true)
      const data = await api.getFacilities()
      setFacilities(data)
    } catch (error) {
      toast.error('Failed to load facilities')
    } finally {
      setLoading(false)
    }
  }

  const toggleFacilityStatus = async (facilityId: number, isActive: boolean) => {
    try {
      await api.updateFacility(facilityId, { is_active: isActive })
      await loadFacilities()
      toast.success(`Facility status updated successfully`)
    } catch (error) {
      toast.error('Failed to update facility status')
    }
  }

  const deleteFacility = async (facilityId: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this facility?</p>
        <p className="text-sm text-gray-600">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await api.deleteFacility(facilityId)
                await loadFacilities()
                toast.success('Facility deleted successfully')
              } catch (error) {
                toast.error('Failed to delete facility')
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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircleIcon className="h-4 w-4 text-green-600" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-red-600" />
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({ name: '', description: '', image_url: '', is_active: true })
  }

  const handleFacilityFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    try {
      await api.createFacility({
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        is_active: formData.is_active,
      })
      toast.success('Facility added successfully!')
      closeModal()
      await loadFacilities()
    } catch (error) {
      toast.error('Failed to add facility')
    } finally {
      setModalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
      <div className="bg-white shadow-sm border-b mb-4">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Facility Management</h1>
              <p className="text-gray-600 text-sm">Manage resort facilities and amenities</p>
              </div>
              <button className="btn-primary flex items-center" onClick={openModal}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Facility
              </button>
            </div>
          </div>
        </div>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
                  <p className="text-gray-500">Add some facilities to get started.</p>
                </div>
              </div>
            ) : (
              facilities.map((facility) => (
                <div key={facility.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Facility Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {facility.image_url ? (
                      <img
                        src={facility.image_url}
                        alt={facility.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Facility Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {facility.name}
                        </h3>
                        <div className="flex items-center">
                          {getStatusIcon(facility.is_active)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(facility.is_active)}`}>
                            {facility.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {/* View facility details */}}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Edit facility */}}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Edit Facility"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFacility(facility.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Facility"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {facility.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Added {formatDate(facility.created_at)}</span>
                      <button
                        onClick={() => toggleFacilityStatus(facility.id, !facility.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          facility.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {facility.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Facility Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-blue-800" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Facilities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {facilities.filter(f => f.is_active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="h-6 w-6 text-red-800" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive Facilities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {facilities.filter(f => !f.is_active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="h-6 w-6 text-purple-800" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                  <p className="text-2xl font-bold text-gray-900">{facilities.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Add Facility */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-30 z-40"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <form onSubmit={handleAddFacility}>
              <h2 className="text-xl font-bold mb-4">Add Facility</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Facility Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleFacilityFormChange} required className="input-field" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleFacilityFormChange} className="input-field" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Image URL</label>
              <input type="text" name="image_url" value={formData.image_url} onChange={handleFacilityFormChange} className="input-field" />
              </div>
              <div className="mb-4 flex items-center">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="mr-2" />
                <label className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={modalLoading}>{modalLoading ? 'Adding...' : 'Add Facility'}</button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
  )
}

export default AdminFacilities 
