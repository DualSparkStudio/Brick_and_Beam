import { Bars3Icon, CheckIcon, PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order_num: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminFAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) {
        toast.error('Failed to load FAQs');
        return;
      }

      setFaqs(data || []);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      if (editingId) {
        // Update existing FAQ
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) {
          toast.error('Failed to update FAQ');
          return;
        }

        toast.success('FAQ updated successfully');
        setEditingId(null);
      } else {
        // Add new FAQ
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            order_num: faqs.length + 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          toast.error('Failed to add FAQ');
          return;
        }

        toast.success('FAQ added successfully');
        setIsAdding(false);
      }

      // Reset form
      setFormData({ question: '', answer: '' });
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete this FAQ?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                const { error } = await supabase
                  .from('faqs')
                  .delete()
                  .eq('id', id);

                if (error) {
                  toast.error('Failed to delete FAQ');
                  return;
                }

                toast.success('FAQ deleted successfully');
                fetchFAQs();
              } catch (error) {
                toast.error('Failed to delete FAQ');
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
    setIsAdding(false);
    setEditingId(null);
    setFormData({ question: '', answer: '' });
  };

  // Drag and drop handlers
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
    if (!draggedId || draggedId === targetId) return;

    try {
      const draggedIndex = faqs.findIndex(faq => faq.id === draggedId);
      const targetIndex = faqs.findIndex(faq => faq.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Create new array with reordered items
      const newFaqs = [...faqs];
      const [draggedItem] = newFaqs.splice(draggedIndex, 1);
      newFaqs.splice(targetIndex, 0, draggedItem);

      // Update order_num for all items
      const updatedFaqs = newFaqs.map((faq, index) => ({
        ...faq,
        order_num: index + 1
      }));

      // Update all FAQs in database
      for (const faq of updatedFaqs) {
        const { error } = await supabase
          .from('faqs')
          .update({ order_num: faq.order_num })
          .eq('id', faq.id);

        if (error) {
          toast.error('Failed to update FAQ order');
          return;
        }
      }

      setFaqs(updatedFaqs);
      setDraggedId(null);
      toast.success('FAQ order updated successfully');
    } catch (error) {
      toast.error('Failed to update FAQ order');
    }
  };

  const toggleActive = async (faq: FAQ) => {
    try {
      
      const { error } = await supabase
        .from('faqs')
        .update({
          is_active: !faq.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', faq.id);

      if (error) {
        toast.error(`Failed to update FAQ status: ${error.message}`);
        return;
      }

      toast.success(`FAQ ${faq.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to update FAQ status');
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage FAQs</h1>
          <p className="text-gray-600">Add, edit, and manage frequently asked questions</p>
        </div>

        {/* Add New FAQ Button */}
        {!isAdding && (
          <div className="mb-6">
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New FAQ
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter the question"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter the answer"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    {editingId ? 'Update FAQ' : 'Add FAQ'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* FAQs List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All FAQs</h2>
          </div>
          <div className="divide-y divide-gray-200">
                        {faqs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No FAQs found. Add your first FAQ to get started.
              </div>
            ) : (
              faqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="px-6 py-4 cursor-move hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, faq.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, faq.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Bars3Icon className="h-5 w-5 text-gray-400 cursor-move" />
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          faq.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                                             <button
                         onClick={() => toggleActive(faq)}
                         className={`p-2 rounded-lg ${
                           faq.is_active
                             ? 'text-red-600 hover:bg-red-50'
                             : 'text-green-600 hover:bg-green-50'
                         }`}
                         title={faq.is_active ? 'Deactivate' : 'Activate'}
                       >
                         {faq.is_active ? (
                           <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                         ) : (
                           <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                         )}
                       </button>
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFAQ; 
