import { Bars3Icon, CheckIcon, PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface HouseRule {
  id: number;
  rule_text: string;
  order_num: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminHouseRules: React.FC = () => {
  const { user } = useAuth();
  const [houseRules, setHouseRules] = useState<HouseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    rule_text: ''
  });

  useEffect(() => {
    fetchHouseRules();
  }, []);

  const fetchHouseRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('house_rules')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) {
        toast.error('Failed to load house rules');
        return;
      }

      setHouseRules(data || []);
    } catch (error) {
      toast.error('Failed to load house rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }
    
    if (!formData.rule_text.trim()) {
      toast.error('Please fill in the rule text');
      return;
    }

    try {
      if (editingId) {
        // Update existing house rule
        const { error } = await supabase
          .from('house_rules')
          .update({
            rule_text: formData.rule_text.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) {
          toast.error('Failed to update house rule');
          return;
        }

        toast.success('House rule updated successfully');
        setEditingId(null);
        setShowEditModal(false);
      } else {
        // Add new house rule
        const { error } = await supabase
          .from('house_rules')
          .insert({
            rule_text: formData.rule_text.trim(),
            order_num: houseRules.length + 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          toast.error('Failed to add house rule');
          return;
        }

        toast.success('House rule added successfully');
        setIsAdding(false);
      }

      setFormData({ rule_text: '' });
      fetchHouseRules();
    } catch (error) {
      toast.error('Failed to save house rule');
    }
  };

  const handleEdit = (houseRule: HouseRule) => {
    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }
    
    setEditingId(houseRule.id);
    setFormData({ rule_text: houseRule.rule_text });
    setShowEditModal(true);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this house rule?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                const { error } = await supabase
                  .from('house_rules')
                  .delete()
                  .eq('id', id);

                if (error) {
                  toast.error(`Failed to delete house rule: ${error.message}`);
                  return;
                }

                toast.success('House rule deleted successfully');
                fetchHouseRules();
              } catch (error) {
                toast.error('Failed to delete house rule');
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

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setShowEditModal(false);
    setFormData({ rule_text: '' });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    try {
      const draggedRule = houseRules.find(rule => rule.id === draggedId);
      const targetRule = houseRules.find(rule => rule.id === targetId);
      
      if (!draggedRule || !targetRule) {
        setDraggedId(null);
        return;
      }

      const draggedIndex = houseRules.findIndex(rule => rule.id === draggedId);
      const targetIndex = houseRules.findIndex(rule => rule.id === targetId);

      // Create new order array
      const newOrder = [...houseRules];
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, removed);

      // Update order numbers
      const updates = newOrder.map((rule, index) => ({
        id: rule.id,
        order_num: index + 1
      }));

      // Update all rules with new order
      for (const update of updates) {
        const { error } = await supabase
          .from('house_rules')
          .update({ order_num: update.order_num })
          .eq('id', update.id);

        if (error) {
          toast.error('Failed to update order');
          return;
        }
      }

      toast.success('Order updated successfully');
      fetchHouseRules();
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setDraggedId(null);
    }
  };

  const toggleActive = async (houseRule: HouseRule) => {
    // Check if user is authenticated and is admin
    if (!user || !user.is_admin) {
      toast.error('You must be logged in as an admin to perform this action');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('house_rules')
        .update({ 
          is_active: !houseRule.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', houseRule.id);

      if (error) {
        toast.error('Failed to update house rule status');
        return;
      }

      toast.success(`House rule ${houseRule.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchHouseRules();
    } catch (error) {
      toast.error('Failed to update house rule status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">House Rules Management</h1>
            <button
              onClick={() => {
                if (!user || !user.is_admin) {
                  toast.error('You must be logged in as an admin to perform this action');
                  return;
                }
                setIsAdding(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Rule
            </button>
          </div>

          {/* Add Form */}
          {isAdding && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="rule_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Text
                  </label>
                  <textarea
                    id="rule_text"
                    value={formData.rule_text}
                    onChange={(e) => setFormData({ ...formData, rule_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                    placeholder="Enter house rule text..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Add Rule
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* House Rules List */}
          <div className="space-y-3">
            {houseRules.map((houseRule, index) => (
              <div
                key={houseRule.id}
                draggable
                onDragStart={(e) => handleDragStart(e, houseRule.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, houseRule.id)}
                className={`flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  draggedId === houseRule.id ? 'opacity-50' : ''
                } ${!houseRule.is_active ? 'opacity-60 bg-gray-50' : ''}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <Bars3Icon className="h-5 w-5 text-gray-400 cursor-move" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!houseRule.is_active ? 'text-gray-500' : 'text-gray-900'}`}>
                      {houseRule.rule_text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Order: {houseRule.order_num} • 
                      {houseRule.is_active ? ' Active' : ' Inactive'} • 
                      Updated: {new Date(houseRule.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(houseRule)}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      houseRule.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {houseRule.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(houseRule)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(houseRule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {houseRules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No house rules found. Add your first rule to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit House Rule</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit_rule_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Text
                  </label>
                  <textarea
                    id="edit_rule_text"
                    value={formData.rule_text}
                    onChange={(e) => setFormData({ ...formData, rule_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={4}
                    placeholder="Enter house rule text..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Update Rule
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHouseRules;
