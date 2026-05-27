import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Room } from '../lib/supabase';
import { api } from '../lib/supabase';

const AdminRooms: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    price_per_night: '', // Couple charges
    max_capacity: '4', // Maximum number of guests allowed
    quantity: '1', // Number of rooms of this type
    amenities: '',
    image_url: '',
    images: [''], // Add images array like attractions
    video_url: '', // Add video URL field
    is_active: true,
    extra_guest_price: '',
    child_above_5_price: '', // Child above 5 years price
    gst_percentage: '12', // Default GST 12%
    accommodation_details: '',
    floor: '',
    extra_mattress_price: '200' // Default ₹200
  });
  const [selectedRoomType, setSelectedRoomType] = useState<Room | null>(null);
  const [roomTypeModalMode, setRoomTypeModalMode] = useState<'edit' | 'add' | 'view'>('add');

  const [imagePreview, setImagePreview] = useState<string>('');
  const [roomTypes, setRoomTypes] = useState<Room[]>([]);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadData();
  }, []);

  // Update image preview whenever roomTypeForm.images changes
  useEffect(() => {
    const firstValidImage = roomTypeForm.images.find(img => img.trim());
    setImagePreview(firstValidImage || '');
  }, [roomTypeForm.images]);

  // Debug modal mode changes
  useEffect(() => {
  }, [roomTypeModalMode]);

  // Debug modal open state
  useEffect(() => {
    if (isModalOpen) {
    }
  }, [isModalOpen, roomTypeModalMode]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAllRooms();
      // Filter out soft-deleted rooms from admin display
      const activeRooms = (data || []).filter(room => !room.is_deleted);
      setRoomTypes(activeRooms);
    } catch (error) {
      toast.error('Failed to load room type data');
      // Set empty array to prevent undefined errors
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoomTypeModalMode('add'); // Reset modal mode to default
    setSelectedRoomType(null);
    setFieldErrors({}); // Clear field errors
        setRoomTypeForm({ 
          name: '', 
          description: '', 
          price_per_night: '', 
          max_capacity: '4',
          quantity: '1',
          amenities: '', 
          image_url: '', 
          images: [''], // Reset images array
          video_url: '', // Reset video URL
          is_active: true, 
          extra_guest_price: '', 
          child_above_5_price: '',
          gst_percentage: '12',
          accommodation_details: '',
          floor: '',
          extra_mattress_price: '200'
        });
    setImagePreview('');
  };

  const handleRoomTypeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRoomTypeForm({ ...roomTypeForm, [e.target.name]: e.target.value });
  };

  const addImageField = () => {
    setRoomTypeForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    setRoomTypeForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setRoomTypeForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setRoomTypeForm(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { ...prev, images: newImages };
    });
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingImage(imageIndex || 0);
      
      // For now, we'll just show a success message
      // In a real implementation, you would upload to a cloud service like Supabase Storage
      toast.success('File selected! Please enter the image URL manually.');
      
      // Clear the file input
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleAddRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Collect all validation errors
      const errors: string[] = [];
      const newFieldErrors: {[key: string]: boolean} = {};
      
      // Validate required fields
      if (!roomTypeForm.name.trim()) {
        errors.push('Room type name is required');
        newFieldErrors.name = true;
      }
      
      if (!roomTypeForm.price_per_night.trim()) {
        errors.push('Price per night is required');
        newFieldErrors.price_per_night = true;
      } else if (parseFloat(roomTypeForm.price_per_night) <= 0) {
        errors.push('Price per night must be greater than 0');
        newFieldErrors.price_per_night = true;
      }

      if (!roomTypeForm.quantity.trim()) {
        errors.push('Number of rooms is required');
        newFieldErrors.quantity = true;
      } else if (parseInt(roomTypeForm.quantity) < 1) {
        errors.push('Number of rooms must be at least 1');
        newFieldErrors.quantity = true;
      }

      // Filter out empty image URLs and validate
      const validImages = roomTypeForm.images.filter(img => img.trim() && validateImageUrl(img));
      
      if (validImages.length === 0) {
        errors.push('At least one valid image URL is required');
        newFieldErrors.images = true;
      }

      // If there are any errors, show them all and highlight fields
      if (errors.length > 0) {
        setFieldErrors(newFieldErrors);
        // Show a summary error message
        toast.error(`Please fix ${errors.length} error${errors.length > 1 ? 's' : ''} in the form`);
        // Show individual errors
        errors.forEach(error => toast.error(error, { duration: 4000 }));
        return;
      }

      // Clear field errors if validation passes
      setFieldErrors({});

      const roomData = {
        name: roomTypeForm.name.trim(),
        description: roomTypeForm.description.trim(),
        price_per_night: parseFloat(roomTypeForm.price_per_night),
        max_capacity: parseInt(roomTypeForm.max_capacity) || 4,
        quantity: parseInt(roomTypeForm.quantity) || 1,
        amenities: roomTypeForm.amenities.split('\n').filter(item => item.trim()),
        image_url: validImages[0], // Use first image as main image
        images: validImages, // Store all images
        video_url: roomTypeForm.video_url.trim() || undefined, // Add video URL
        is_active: roomTypeForm.is_active,
        is_available: true, // Set room as available when creating
        extra_guest_price: roomTypeForm.extra_guest_price ? parseFloat(roomTypeForm.extra_guest_price) : 0,
        child_above_5_price: roomTypeForm.child_above_5_price ? parseFloat(roomTypeForm.child_above_5_price) : 0,
        gst_percentage: roomTypeForm.gst_percentage ? parseFloat(roomTypeForm.gst_percentage) : 12,
        accommodation_details: roomTypeForm.accommodation_details.trim(),
        floor: roomTypeForm.floor ? parseInt(roomTypeForm.floor) : undefined,
        extra_mattress_price: roomTypeForm.extra_mattress_price ? parseFloat(roomTypeForm.extra_mattress_price) : 200,
        check_in_time: '12:00 PM',
        check_out_time: '10:00 AM',
        room_number: roomTypeForm.name.replace(/\s+/g, '-').toUpperCase(), // Generate from name
      };

      if (roomTypeModalMode === 'edit' && selectedRoomType) {
        await api.updateRoom(selectedRoomType.id, roomData);
        toast.success('Room type updated successfully!');
      } else {
        const result = await api.createRoom(roomData);
        toast.success('Room type added successfully!');
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error('Error saving room type:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save room type: ${errorMessage}`);
      // Show more detailed error in console for debugging
      if (error && typeof error === 'object' && 'details' in error) {
        console.error('Error details:', error);
      }
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    const room = roomTypes.find(r => r.id === roomId);
    const roomName = room?.name || 'this room';
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Are you sure you want to delete "{roomName}"?</p>
        <p className="text-sm text-gray-600">This will:</p>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>Delete the room permanently</li>
          <li>Remove all blocked dates for this room</li>
          <li>This action cannot be undone</li>
        </ul>
        <p className="text-xs text-orange-600">Note: Rooms with existing bookings cannot be deleted.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                const loadingToast = toast.loading('Deleting room...');
                await api.deleteRoom(roomId);
                toast.dismiss(loadingToast);
                toast.success(`${roomName} deleted successfully!`);
                await loadData();
              } catch (error: any) {
                console.error('Delete room error:', error);
                
                // Check if it's a foreign key constraint error
                // PostgreSQL error code 23503 = foreign key violation
                if (
                  error?.code === '23503' || 
                  error?.code === 23503 ||
                  error?.details?.includes('still referenced') ||
                  error?.message?.includes('foreign key constraint') ||
                  error?.message?.includes('violates foreign')
                ) {
                  toast.error('Cannot delete this room type because it has existing bookings. Please deactivate it instead or delete the bookings first.', {
                    duration: 6000
                  });
                } else {
                  const errorMessage = error?.message || error?.details || 'Unknown error';
                  toast.error(`Failed to delete room type: ${errorMessage}`, {
                    duration: 4000
                  });
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
      duration: 15000,
      icon: '⚠️'
    })
  };

  const handleToggleRoomStatus = async (roomId: number, currentStatus: boolean) => {
    try {
      await api.updateRoom(roomId, { 
        is_active: !currentStatus,
        is_available: !currentStatus 
      });
      toast.success(`Room type ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await loadData(); // Reload the data
    } catch (error) {
      toast.error(`Failed to update room type status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openRoomTypeModal = async (mode: 'edit' | 'add' | 'view', roomType?: Room) => {
    try {
      
      // Set the modal mode first and wait for it to be set
      setRoomTypeModalMode(mode);
      
      // If switching from view to edit mode, we don't need to reload the form data
      if (mode === 'edit' && roomTypeModalMode === 'view' && selectedRoomType) {
        setIsModalOpen(true);
        return;
      }
      
      if (roomType) {
        setSelectedRoomType(roomType);
        
        // Safe conversion function
        const safeToString = (value: any): string => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return value.toString();
          if (typeof value === 'string') return value;
          return '';
        };
        
        setRoomTypeForm({
          name: roomType.name || '',
          description: roomType.description || '',
          price_per_night: safeToString(roomType.price_per_night),
          max_capacity: safeToString(roomType.max_capacity) || '4',
          quantity: safeToString(roomType.quantity) || '1',
          amenities: Array.isArray(roomType.amenities) ? roomType.amenities.join('\n') : '',
          is_active: roomType.is_active ?? true,
          extra_guest_price: safeToString(roomType.extra_guest_price),
          child_above_5_price: safeToString(roomType.child_above_5_price),
          gst_percentage: safeToString(roomType.gst_percentage) || '12',
          accommodation_details: roomType.accommodation_details || '',
          image_url: roomType.image_url || '',
          images: Array.isArray(roomType.images) && roomType.images.length > 0 ? roomType.images : [''],
          video_url: roomType.video_url || '', // Add video URL
          floor: safeToString(roomType.floor),
          extra_mattress_price: safeToString(roomType.extra_mattress_price) || '200'
        });

        // Load existing room images if editing
        if (roomType.images && roomType.images.length > 0) {
          // Images are now stored directly in the room data
        }
      } else {
        setSelectedRoomType(null);
        setRoomTypeForm({ 
          name: '', 
          description: '', 
          price_per_night: '', 
          max_capacity: '4',
          quantity: '1',
          amenities: '', 
          is_active: true, 
          extra_guest_price: '', 
          child_above_5_price: '',
          gst_percentage: '12',
          accommodation_details: '',
          image_url: '', 
          images: [''],
          video_url: '', // Add video URL
          floor: '',
          extra_mattress_price: '200'
        });
        setImagePreview('');
      }
      
      // Use setTimeout to ensure state updates are processed before opening modal
      setTimeout(() => {
        setIsModalOpen(true);
      }, 0);
      
    } catch (error) {
      toast.error('Error opening room type details. Please try again.');
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
    <>
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Room Type Management</h1>
            <button
              onClick={() => openRoomTypeModal('add')}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Room Type
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Night (Couple)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number of Rooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomTypes.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={room.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80'}
                              alt={room.name}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{room.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{room.price_per_night?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {room.quantity || 1} {(room.quantity || 1) === 1 ? 'room' : 'rooms'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {room.images?.length || 1} image{(room.images?.length || 1) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              openRoomTypeModal('view', room);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              openRoomTypeModal('edit', room);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleRoomStatus(room.id, room.is_active)}
                            className={`${
                              room.is_active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {room.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Visible only on mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {roomTypes.map((room) => (
                <div key={room.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3 mb-3">
                    <img
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      src={room.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80'}
                      alt={room.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{room.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-1 font-semibold text-gray-900">₹{room.price_per_night.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Guests:</span>
                      <span className="ml-1 font-semibold text-gray-900">{room.max_occupancy}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rooms:</span>
                      <span className="ml-1 font-semibold text-gray-900">{room.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Images:</span>
                      <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {room.images?.length || 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => handleToggleActive(room.id, room.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        room.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {room.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openModal(room, 'view')}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openModal(room, 'edit')}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(room.id, room.is_active)}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                    >
                      {room.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.name)}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {(() => {
                    let title = 'Room Type Details'; // Default
                    if (roomTypeModalMode === 'add') {
                      title = 'Add New Room Type';
                    } else if (roomTypeModalMode === 'edit') {
                      title = 'Edit Room Type';
                    } else if (roomTypeModalMode === 'view') {
                      title = 'View Room Type';
                    }
                    return title;
                  })()}
                </h2>
                                 <div className="flex items-center space-x-2">
                   <button
                     onClick={closeModal}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
              </div>
            </div>

            <form 
              onSubmit={handleAddRoomType} 
              className="p-6 space-y-6"
            >
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={roomTypeForm.name}
                      onChange={handleRoomTypeFormChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                        fieldErrors.name 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="e.g., Deluxe Suite, Premium Room"
                      required
                      disabled={roomTypeModalMode === 'view'}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-xs text-red-600">This field is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={roomTypeForm.description}
                      onChange={handleRoomTypeFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter room description"
                      disabled={roomTypeModalMode === 'view'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Night (Couple) *
                      </label>
                      <input
                        type="number"
                        name="price_per_night"
                        value={roomTypeForm.price_per_night}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                          fieldErrors.price_per_night 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="0"
                        disabled={roomTypeModalMode === 'view'}
                        required
                      />
                      {fieldErrors.price_per_night && (
                        <p className="mt-1 text-xs text-red-600">Valid price is required</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Base price for couple (2 adults)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Capacity *
                      </label>
                      <input
                        type="number"
                        name="max_capacity"
                        value={roomTypeForm.max_capacity}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                          fieldErrors.max_capacity 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="4"
                        disabled={roomTypeModalMode === 'view'}
                        required
                        min="1"
                      />
                      {fieldErrors.max_capacity && (
                        <p className="mt-1 text-xs text-red-600">Max capacity is required</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Maximum guests allowed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Rooms *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={roomTypeForm.quantity}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                          fieldErrors.quantity 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="1"
                        disabled={roomTypeModalMode === 'view'}
                        required
                        min="1"
                      />
                      {fieldErrors.quantity && (
                        <p className="mt-1 text-xs text-red-600">At least 1 room is required</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">How many rooms of this type?</p>
                    </div>
                  </div>

                  {/* Additional Charges */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Charges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Extra Guest Price
                        </label>
                        <input
                          type="number"
                          name="extra_guest_price"
                          value={roomTypeForm.extra_guest_price}
                          onChange={handleRoomTypeFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="0"
                          disabled={roomTypeModalMode === 'view'}
                          min="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">Per extra adult per night</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Child Above 5 Years
                        </label>
                        <input
                          type="number"
                          name="child_above_5_price"
                          value={roomTypeForm.child_above_5_price}
                          onChange={handleRoomTypeFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="0"
                          disabled={roomTypeModalMode === 'view'}
                          min="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">Per child per night</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST %
                        </label>
                        <input
                          type="number"
                          name="gst_percentage"
                          value={roomTypeForm.gst_percentage}
                          onChange={handleRoomTypeFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="12"
                          disabled={roomTypeModalMode === 'view'}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <p className="mt-1 text-xs text-gray-500">GST percentage (default: 12%)</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Mattress Price
                      </label>
                      <input
                        type="number"
                        name="extra_mattress_price"
                        value={roomTypeForm.extra_mattress_price}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="200"
                        disabled={roomTypeModalMode === 'view'}
                        min="0"
                      />
                      <p className="mt-1 text-xs text-gray-500">Per mattress per night (default: ₹200)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accommodation Details
                      </label>
                      <textarea
                        name="accommodation_details"
                        value={roomTypeForm.accommodation_details || ''}
                        onChange={handleRoomTypeFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g., Accommodation: Extra Mattress for ₹200"
                        disabled={roomTypeModalMode === 'view'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor
                      </label>
                      <input
                        type="number"
                        name="floor"
                        value={roomTypeForm.floor}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="1"
                        disabled={roomTypeModalMode === 'view'}
                      />
                    </div>
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (one per line)
                    </label>
                    <textarea
                      name="amenities"
                      value={roomTypeForm.amenities}
                      onChange={handleRoomTypeFormChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Wi-Fi&#10;AC&#10;TV&#10;River View"
                      disabled={roomTypeModalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={roomTypeForm.is_active}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={roomTypeModalMode === 'view'}
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Image Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Room Images *
                    </label>
                    {roomTypeModalMode !== 'view' && (
                      <button
                        type="button"
                        onClick={addImageField}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Add Image
                      </button>
                    )}
                  </div>
                  
                  {/* Image URL Fields */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-2">
                      {roomTypeForm.images.filter(img => img.trim()).length} valid image(s) ready to save
                    </div>
                    {roomTypeForm.images.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-500">Image {index + 1}</span>
                            {image.trim() && validateImageUrl(image) && (
                              <span className="text-xs text-green-600">✓ Valid</span>
                            )}
                            {roomTypeModalMode !== 'view' && index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index - 1)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                ↑
                              </button>
                            )}
                            {roomTypeModalMode !== 'view' && index < roomTypeForm.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index + 1)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                ↓
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateImage(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                              image.trim() && !validateImageUrl(image) 
                                ? 'border-red-300 focus:ring-red-500' 
                                : image.trim() && validateImageUrl(image)
                                ? 'border-green-300 focus:ring-green-500'
                                : 'border-gray-300'
                            }`}
                            placeholder="https://example.com/image.jpg"
                            disabled={roomTypeModalMode === 'view'}
                          />
                          {image.trim() && !validateImageUrl(image) && (
                            <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
                          )}
                        </div>
                        {roomTypeModalMode !== 'view' && roomTypeForm.images.length > 1 && (
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
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image Preview:</label>
                      <div className="w-full bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(imagePreview, '_blank')}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                          }}
                        />
                        <div className="text-center py-1 text-xs text-gray-500 bg-gray-100">
                          Click to view full size
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* All Images Preview */}
                  {roomTypeForm.images.filter(img => img.trim()).length > 1 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">All Images Preview:</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {roomTypeForm.images.filter(img => img.trim()).map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(image, '_blank')}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                              }}
                            />
                                                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                             <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                               Click to view
                             </span>
                           </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-2 text-xs text-gray-500">
                        Click any image to view full size
                      </div>
                    </div>
                  )}
                </div>

                {/* Video URL Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={roomTypeForm.video_url}
                    onChange={(e) => setRoomTypeForm({ ...roomTypeForm, video_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="https://res.cloudinary.com/your-cloud/video/upload/..."
                    disabled={roomTypeModalMode === 'view'}
                  />
                  <p className="text-xs text-gray-500">
                    Upload your video to Cloudinary and paste the URL here. Supports MP4, WebM formats.
                  </p>
                  {roomTypeForm.video_url && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video Preview:</label>
                      <video
                        src={roomTypeForm.video_url}
                        controls
                        className="w-full max-h-64 rounded-lg"
                        onError={(e) => {
                          console.error('Video failed to load');
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {roomTypeModalMode === 'view' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoomTypeModalMode('edit');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Room
                  </button>
                )}
                {roomTypeModalMode !== 'view' && (
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {roomTypeModalMode === 'edit' ? 'Update Room' : 'Add Room'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRooms; 

