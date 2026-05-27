import {
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    MapPinIcon,
    PencilIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Attraction {
  id?: number;
  name: string;
  description: string;
  images: string[];
  distance: string;
  travel_time: string;
  type: string;
  highlights: string[];
  best_time: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

const AdminAttractions: React.FC = () => {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [showGallery, setShowGallery] = useState<{ images: string[]; title: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<Attraction>({
    name: '',
    description: '',
    images: [''],
    distance: '',
    travel_time: '',
    type: '',
    highlights: [''],
    best_time: '',
    category: 'beach'
  });

  const categories = [
    { value: 'beach', label: 'Beach', color: 'bg-blue-100 text-blue-800' },
    { value: 'historical', label: 'Historical', color: 'bg-amber-100 text-amber-800' },
    { value: 'heritage', label: 'Heritage', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'nature', label: 'Nature', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'agriculture', label: 'Agriculture', color: 'bg-green-100 text-green-800' },
    { value: 'spiritual', label: 'Spiritual', color: 'bg-purple-100 text-purple-800' }
  ];

  // Test database connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchAttractions();
    }
  }, [connectionStatus]);

  const testConnection = async () => {
    try {
      const { error } = await supabase
        .from('attractions')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus('error');
        toast.error('Database connection failed. Please check your configuration.');
        return;
      }

      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Database connection failed. Please check your configuration.');
    }
  };

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAttractions(data || []);
    } catch (error) {
      toast.error('Failed to fetch attractions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Attraction name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.distance.trim()) {
      toast.error('Distance is required');
      return false;
    }
    if (!formData.travel_time.trim()) {
      toast.error('Travel time is required');
      return false;
    }
    if (!formData.type.trim()) {
      toast.error('Type is required');
      return false;
    }
    if (!formData.best_time.trim()) {
      toast.error('Best time to visit is required');
      return false;
    }
    
    // Validate image URLs
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      toast.error('At least one image URL is required');
      return false;
    }
    
    // Validate highlights
    const validHighlights = formData.highlights.filter(h => h.trim() !== '');
    if (validHighlights.length === 0) {
      toast.error('At least one highlight is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const attractionData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== '')
      };


      if (editingAttraction?.id) {
        // Update existing attraction
        
        const { data, error } = await supabase
          .from('attractions')
          .update({
            ...attractionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAttraction.id)
          .select();


        if (error) {
          throw error;
        }
        
        toast.success('Attraction updated successfully');
      } else {
        // Create new attraction
        
        const { data, error } = await supabase
          .from('attractions')
          .insert([{
            ...attractionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();


        if (error) {
          throw error;
        }
        
        toast.success('Attraction added successfully');
      }

      setShowModal(false);
      setEditingAttraction(null);
      resetForm();
      fetchAttractions();
    } catch (error) {
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          toast.error('Attraction name already exists. Please use a different name.');
        } else if (error.message.includes('foreign key')) {
          toast.error('Invalid reference. Please check your data.');
        } else if (error.message.includes('not null')) {
          toast.error('Required field is missing. Please fill all required fields.');
        } else if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
          toast.error('Permission denied. Please run the RLS fix script in your Supabase SQL Editor.');
        } else if (error.message.includes('CORS')) {
          toast.error('CORS error. Please configure CORS settings in your Supabase dashboard.');
        } else {
          toast.error(`Failed to save attraction: ${error.message}`);
        }
      } else {
        toast.error('Failed to save attraction. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingAttraction(attraction);
    setFormData({
      name: attraction.name,
      description: attraction.description,
      images: attraction.images.length > 0 ? attraction.images : [''],
      distance: attraction.distance,
      travel_time: attraction.travel_time,
      type: attraction.type,
      highlights: attraction.highlights.length > 0 ? attraction.highlights : [''],
      best_time: attraction.best_time,
      category: attraction.category
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this attraction?</p>
        <p className="text-sm text-gray-600">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                const { error } = await supabase
                  .from('attractions')
                  .delete()
                  .eq('id', id);

                if (error) {
                  throw error;
                }

                toast.success('Attraction deleted successfully');
                fetchAttractions();
              } catch (error) {
                toast.error('Failed to delete attraction. Please try again.');
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
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      images: [''],
      distance: '',
      travel_time: '',
      type: '',
      highlights: [''],
      best_time: '',
      category: 'beach'
    });
    setImagePreview('');
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
    
    // Set preview for the first image
    if (index === 0) {
      setImagePreview(value);
    }
  };

  const addHighlightField = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const removeHighlightField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((highlight, i) => i === index ? value : highlight)
    }));
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  // Show connection status
  if (connectionStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing database connection...</p>
        </div>
      </div>
    );
  }

  // Show connection error
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Failed</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the database. Please check your configuration.</p>
          <button
            onClick={testConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attractions...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Attractions</h1>
            <p className="text-gray-600 mt-2">Add and manage tourist attractions for your website</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-green-600">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Connected
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingAttraction(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Attraction
            </button>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div key={attraction.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {attraction.images && attraction.images[0] ? (
                  <img
                    src={attraction.images[0]}
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`${getCategoryColor(attraction.category)} px-2 py-1 rounded-full text-xs font-semibold`}>
                    {getCategoryLabel(attraction.category)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{attraction.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{attraction.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {attraction.distance}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {attraction.travel_time}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowGallery({ images: attraction.images, title: attraction.name })}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(attraction)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => attraction.id && handleDelete(attraction.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {attractions.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attractions yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first tourist attraction.</p>
            <button
              onClick={() => {
                resetForm();
                setEditingAttraction(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Your First Attraction
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAttraction ? 'Edit Attraction' : 'Add New Attraction'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAttraction(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attraction Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Ganpatipule Beach & Temple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Beach & Temple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Best Time to Visit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.best_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, best_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., October to March"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance from Resort *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.distance}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., 25 km from resort"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.travel_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, travel_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., 45 mins drive"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the attraction, its history, and what visitors can expect..."
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs *
                </label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => updateImage(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  + Add Image URL
                </button>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview:</label>
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights (What to Expect) *
                </label>
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Ancient Ganesh Temple"
                    />
                    {formData.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHighlightField(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHighlightField}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  + Add Highlight
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAttraction(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingAttraction ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingAttraction ? 'Update Attraction' : 'Add Attraction'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{showGallery.title}</h2>
              <button
                onClick={() => setShowGallery(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {showGallery.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showGallery.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${showGallery.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No images available for this attraction.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttractions; 
