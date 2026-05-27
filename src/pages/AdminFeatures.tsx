import {
    CheckCircleIcon,
    PencilIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Feature {
  id?: number;
  title: string;
  description: string;
  icon: string;
  category?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const AdminFeatures: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [formData, setFormData] = useState<Feature>({
    title: '',
    description: '',
    icon: 'star',
    category: 'general',
    display_order: 0,
    is_active: true
  });

  const categories = [
    'All',
    'booking',
    'location',
    'service',
    'Connectivity',
    'Recreation',
    'Wellness',
    'Fitness',
    'Safety',
    'Business',
    'Activities',
    'Transport',
    'Convenience',
    'Luxury',
    'Family',
    'Culture',
    'general'
  ];

  const iconOptions = [
    { value: 'StarIcon', label: 'Star' },
    { value: 'CheckCircleIcon', label: 'Check Circle' },
    { value: 'CalendarIcon', label: 'Calendar' },
    { value: 'MapPinIcon', label: 'Map Pin' },
    { value: 'WifiIcon', label: 'WiFi' },
    { value: 'BeakerIcon', label: 'Beaker' },
    { value: 'SparklesIcon', label: 'Sparkles' },
    { value: 'CakeIcon', label: 'Cake' },
    { value: 'HeartIcon', label: 'Heart' },
    { value: 'ShieldCheckIcon', label: 'Shield Check' },
    { value: 'ClockIcon', label: 'Clock' },
    { value: 'UserGroupIcon', label: 'User Group' },
    { value: 'SunIcon', label: 'Sun' },
    { value: 'MapIcon', label: 'Map' },
    { value: 'TruckIcon', label: 'Truck' },
    { value: 'CreditCardIcon', label: 'Credit Card' },
    { value: 'UserIcon', label: 'User' }
  ];

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      toast.error('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFeature?.id) {
        // Update existing feature
        const { error } = await supabase
          .from('features')
          .update(formData)
          .eq('id', editingFeature.id);

        if (error) throw error;
        toast.success('Feature updated successfully');
      } else {
        // Create new feature
        const { error } = await supabase
          .from('features')
          .insert([formData]);

        if (error) throw error;
        toast.success('Feature added successfully');
      }

      setShowModal(false);
      setEditingFeature(null);
      resetForm();
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to save feature');
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      category: feature.category || 'general',
      display_order: feature.display_order,
      is_active: feature.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this feature?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                const { data, error } = await supabase
                  .from('features')
                  .delete()
                  .eq('id', id)
                  .select();

                if (error) {
                  throw error;
                }
                
                toast.success('Feature deleted successfully');
                fetchFeatures();
              } catch (error) {
                if (error instanceof Error) {
                  toast.error(`Failed to delete feature: ${error.message}`);
                } else {
                  toast.error('Failed to delete feature');
                }
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
      title: '',
      description: '',
      icon: 'star',
      category: 'general',
      display_order: 0,
      is_active: true
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      StarIcon: StarIcon,
      CheckCircleIcon: CheckCircleIcon,
      CalendarIcon: () => <span>📅</span>,
      MapPinIcon: () => <span>📍</span>,
      WifiIcon: () => <span>📶</span>,
      BeakerIcon: () => <span>🧪</span>,
      SparklesIcon: () => <span>✨</span>,
      CakeIcon: () => <span>🍰</span>,
      HeartIcon: () => <span>❤️</span>,
      ShieldCheckIcon: () => <span>🛡️</span>,
      ClockIcon: () => <span>⏰</span>,
      UserGroupIcon: () => <span>👥</span>,
      SunIcon: () => <span>☀️</span>,
      MapIcon: () => <span>🗺️</span>,
      TruckIcon: () => <span>🚚</span>,
      CreditCardIcon: () => <span>💳</span>,
      UserIcon: () => <span>👤</span>
    };
    
    return iconMap[iconName] || StarIcon;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      booking: 'bg-blue-100 text-blue-800',
      location: 'bg-green-100 text-green-800',
      service: 'bg-purple-100 text-purple-800',
      Connectivity: 'bg-indigo-100 text-indigo-800',
      Recreation: 'bg-cyan-100 text-cyan-800',
      Wellness: 'bg-emerald-100 text-emerald-800',
      Fitness: 'bg-red-100 text-red-800',
      Safety: 'bg-yellow-100 text-yellow-800',
      Business: 'bg-gray-100 text-gray-800',
      Activities: 'bg-pink-100 text-pink-800',
      Transport: 'bg-teal-100 text-teal-800',
      Convenience: 'bg-lime-100 text-lime-800',
      Luxury: 'bg-amber-100 text-amber-800',
      Family: 'bg-rose-100 text-rose-800',
      Culture: 'bg-violet-100 text-violet-800',
      general: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredFeatures = selectedCategory === 'All' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading features...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Features</h1>
            <p className="text-gray-600 mt-2">Add and manage resort features and amenities</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingFeature(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Feature
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {feature.icon || '✨'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <span className={`${getCategoryColor(feature.category)} px-2 py-1 rounded-full text-xs font-semibold`}>
                        {feature.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {feature.is_active ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{feature.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Order: {feature.display_order}</span>
                  <span>{feature.is_active ? 'Active' : 'Inactive'}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(feature)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => feature.id && handleDelete(feature.id)}
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

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No features found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first feature.</p>
            <button
              onClick={() => {
                resetForm();
                setEditingFeature(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Your First Feature
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFeature ? 'Edit Feature' : 'Add New Feature'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Easy Booking"
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
                    {categories.filter(cat => cat !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon *
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon.value} value={icon.value}>{icon.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="0"
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
                  placeholder="Describe the feature and its benefits..."
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFeature(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeatures; 
