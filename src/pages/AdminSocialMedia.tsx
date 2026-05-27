import {
    GlobeAltIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { SocialMediaLink } from '../lib/supabase'
import { api } from '../lib/supabase'

const AdminSocialMedia: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedItem, setSelectedItem] = useState<SocialMediaLink | null>(null)
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon_class: '',
    is_active: true,
    display_order: ''
  })

  const socialPlatforms = [
    { name: 'Facebook', icon: 'fab fa-facebook', color: 'text-blue-600' },
    { name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-600' },
    { name: 'Twitter', icon: 'fab fa-twitter', color: 'text-blue-400' },
    { name: 'YouTube', icon: 'fab fa-youtube', color: 'text-red-600' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', color: 'text-blue-700' },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: 'text-black' },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'text-green-600' },
    { name: 'Telegram', icon: 'fab fa-telegram', color: 'text-blue-500' }
  ]



  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const socialData = await api.getAllSocialMediaLinks()
      setSocialLinks(socialData)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (mode: 'add' | 'edit' | 'view', item?: SocialMediaLink) => {
    setModalMode(mode)
    if (item) {
      setSelectedItem(item)
      setFormData({
        platform: item.platform,
        url: item.url || '',
        icon_class: item.icon_class || '',
        is_active: item.is_active,
        display_order: item.display_order?.toString() || ''
      })
    } else {
      setSelectedItem(null)
      setFormData({
        platform: '',
        url: '',
        icon_class: '',
        is_active: true,
        display_order: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setFormData({
      platform: '',
      url: '',
      icon_class: '',
      is_active: true,
      display_order: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const socialData = {
        ...formData,
        display_order: parseInt(formData.display_order) || 0
      }

      if (modalMode === 'add') {
        await api.createSocialMediaLink(socialData)
        toast.success('Social media link created successfully')
      } else if (modalMode === 'edit' && selectedItem) {
        await api.updateSocialMediaLink(selectedItem.id, socialData)
        toast.success('Social media link updated successfully')
      }

      closeModal()
      loadData()
    } catch (error) {
      toast.error('Failed to save data')
    }
  }

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this item?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await api.deleteSocialMediaLink(id)
                toast.success('Social media link deleted successfully')
                loadData()
              } catch (error) {
                toast.error('Failed to delete item')
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

  const getPlatformIcon = (platform: string) => {
    const found = socialPlatforms.find(p => p.name.toLowerCase() === platform.toLowerCase())
    return found ? { icon: found.icon, color: found.color } : { icon: 'fas fa-link', color: 'text-gray-600' }
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
          <h1 className="text-3xl font-bold text-gray-900">Social Media & External Links</h1>
          <p className="mt-2 text-gray-600">Manage social media links and external booking sources</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
            <p className="text-3xl font-bold text-blue-600">{socialLinks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Social</h3>
            <p className="text-3xl font-bold text-green-600">{socialLinks.filter(s => s.is_active).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Media Links */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    Social Media Links
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Manage your social media presence</p>
                </div>
                <button
                  onClick={() => openModal('add')}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Link
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {socialLinks.length > 0 ? (
                <div className="space-y-4">
                  {socialLinks.map((link) => {
                    const platformIcon = getPlatformIcon(link.platform)
                    return (
                      <div key={link.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformIcon.color} bg-gray-100`}>
                            <i className={`${platformIcon.icon} text-lg`}></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{link.platform}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{link.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => openModal('edit', link)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No social media links</h3>
                  <p className="text-gray-500 mb-4">Start building your social media presence.</p>
                  <button
                    onClick={() => openModal('add')}
                    className="btn-primary"
                  >
                    Add First Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add Social Media Link' : 'Edit Social Media Link'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select Platform</option>
                    {socialPlatforms.map(platform => (
                      <option key={platform.name} value={platform.name}>{platform.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Class (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.icon_class}
                    onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
                    placeholder="fab fa-facebook"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                    placeholder="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

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
                    {modalMode === 'add' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminSocialMedia 
