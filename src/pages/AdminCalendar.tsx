import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import EnhancedCalendar from '../components/EnhancedCalendar'
import type { Booking, Room } from '../lib/supabase'
import { api } from '../lib/supabase'
import LogoLoader from '../components/LogoLoader'

const AdminCalendar: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | 'all'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnblockMode, setIsUnblockMode] = useState(false);
  const [selectedBlockedDate, setSelectedBlockedDate] = useState<any>(null);
  const [blockForm, setBlockForm] = useState({
    room_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData()
  }, [])

  // Reload data when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadData()
    }
  }, [refreshTrigger])


  const loadData = async () => {
    try {
      setLoading(true)
      const [bookingsData, roomsData, blockedDatesData] = await Promise.all([
        api.getBookings(),
        api.getRooms(),
        api.getBlockedDates()
      ])
      
      // Show all blocked dates
      const filteredBlockedDates = blockedDatesData || []

      setBookings(bookingsData || [])
      setRooms(roomsData || [])
      setBlockedDates(filteredBlockedDates)

    } catch (error) {
      setBookings([])
      setRooms([])
      setBlockedDates([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    // Check if there's an existing blocked date for this selection
    const existingBlockedDate = blockedDates.find(blocked => 
      blocked.start_date === selectInfo.startStr && 
      blocked.end_date === selectInfo.endStr &&
      blocked.source === 'manual' // Only allow unblocking manual blocked dates
    )

    if (existingBlockedDate) {
      // Show unblock modal
      setSelectedBlockedDate(existingBlockedDate)
      setIsUnblockMode(true)
      setBlockForm({
        room_id: existingBlockedDate.room_id.toString(),
        start_date: existingBlockedDate.start_date,
        end_date: existingBlockedDate.end_date,
        reason: existingBlockedDate.reason,
        notes: existingBlockedDate.notes || ''
      })
    } else {
      // Show block modal for new dates
      const startDate = selectInfo.startStr
      let endDate = selectInfo.endStr
      
      // Validate dates
      if (!startDate || isNaN(new Date(startDate).getTime())) {
        return;
      }
      
      // If it's a single date selection (start and end are the same), 
      // set end date to the next day for proper blocking
      if (startDate === endDate) {
        const nextDay = new Date(startDate)
        if (!isNaN(nextDay.getTime())) {
          nextDay.setDate(nextDay.getDate() + 1)
          endDate = nextDay.toISOString().split('T')[0]
        }
      }
      
      setBlockForm({
        room_id: '', // Leave room selection empty for user to choose
        start_date: startDate,
        end_date: endDate,
        reason: '',
        notes: ''
      })
      setIsUnblockMode(false)
      setSelectedBlockedDate(null)
    }
    setIsBlockModalOpen(true)
  }

  const handleBlockDates = async () => {
    try {
      if (!blockForm.room_id || !blockForm.start_date || !blockForm.end_date) {
        toast.error('Please fill in all required fields')
        return
      }

      // Check if blocking for all rooms
      if (blockForm.room_id === 'all') {
        // Block dates for all rooms
        const blockPromises = rooms.map(room => {
          const blockDataWithSource = {
            room_id: room.id.toString(),
            start_date: blockForm.start_date,
            end_date: blockForm.end_date,
            reason: blockForm.reason,
            notes: blockForm.notes,
            source: 'manual' // Explicitly mark as manual blocked date
          }
          return api.blockDates(blockDataWithSource)
        })

        await Promise.all(blockPromises)
        toast.success(`Dates blocked successfully for all ${rooms.length} rooms`)
      } else {
        // Block dates for single room
        const blockDataWithSource = {
          ...blockForm,
          source: 'manual' // Explicitly mark as manual blocked date
        }

        await api.blockDates(blockDataWithSource)
        toast.success('Dates blocked successfully')
      }
      
      setIsBlockModalOpen(false)
      setBlockForm({
        room_id: '',
        start_date: '',
        end_date: '',
        reason: '',
        notes: ''
      })
      loadData()
    } catch (error) {
      toast.error('Failed to block dates')
    }
  }

  const handleUnblockDates = async () => {
    try {
      if (!selectedBlockedDate) {
        toast.error('No blocked date selected')
        return
      }

      // Check if unblocking for all rooms
      if (blockForm.room_id === 'all') {
        // Find all blocked dates for the same date range across all rooms
        const blockedDatesToRemove = blockedDates.filter(blocked => 
          blocked.start_date === blockForm.start_date && 
          blocked.end_date === blockForm.end_date &&
          blocked.source === 'manual'
        )

        const unblockPromises = blockedDatesToRemove.map(blocked => 
          api.deleteBlockedDate(blocked.id)
        )

        await Promise.all(unblockPromises)
        toast.success(`Dates unblocked successfully for ${blockedDatesToRemove.length} rooms`)
      } else {
        // Unblock single room
        await api.deleteBlockedDate(selectedBlockedDate.id)
        toast.success('Dates unblocked successfully')
      }
      
      setIsBlockModalOpen(false)
      setBlockForm({
        room_id: '',
        start_date: '',
        end_date: '',
        reason: '',
        notes: ''
      })
      setSelectedBlockedDate(null)
      setIsUnblockMode(false)
      loadData()
    } catch (error) {
      toast.error('Failed to unblock dates')
    }
  }









  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LogoLoader size="lg" text="Loading calendar..." />
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
            <p className="mt-2 text-gray-600">Manage bookings and block dates for your resort</p>
          </div>
          
        </div>

        {/* Room Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Room
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
            disabled={loading}
          >
            <option value="all">All Rooms</option>
            {loading ? (
              <option value="" disabled>Loading rooms...</option>
            ) : rooms && rooms.length > 0 ? (
              rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No rooms available</option>
            )}
          </select>
          {!loading && rooms && rooms.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              ⚠️ No rooms found. Please check your database connection.
            </p>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <EnhancedCalendar
              bookings={bookings}
              rooms={rooms}
              blockedDates={blockedDates}
              onDateSelect={(selectInfo) => {
                handleDateSelect(selectInfo);
              }}
              selectedRoom={selectedRoom === 'all' ? undefined : selectedRoom}
              refreshTrigger={refreshTrigger}
              onRefreshData={loadData}
            />
          </div>
        </div>

        {/* Block/Unblock Dates Modal */}
        {isBlockModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isUnblockMode ? 'Unblock Dates' : 'Block Dates'}
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); isUnblockMode ? handleUnblockDates() : handleBlockDates(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <select
                        value={blockForm.room_id}
                        onChange={(e) => setBlockForm({ ...blockForm, room_id: e.target.value })}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        disabled={loading || isUnblockMode}
                      >
                        <option value="">Select a room</option>
                        {!isUnblockMode && <option value="all">🏠 All Rooms</option>}
                        {loading ? (
                          <option value="" disabled>Loading rooms...</option>
                        ) : rooms && rooms.length > 0 ? (
                          rooms.map(room => (
                            <option key={room.id} value={room.id}>
                              {room.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No rooms available</option>
                        )}
                      </select>
                    </div>

                    {!isUnblockMode && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-800">
                              <strong>Pre-selected:</strong> Dates were automatically selected from your calendar click. You can modify them if needed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={blockForm.start_date}
                        onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        disabled={isUnblockMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={blockForm.end_date}
                        onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        disabled={isUnblockMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                        required
                        placeholder="e.g., Maintenance, Holiday"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        disabled={isUnblockMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={blockForm.notes}
                        onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                        rows={3}
                        placeholder="Additional notes..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        disabled={isUnblockMode}
                      />
                    </div>

                    {isUnblockMode && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Unblock Mode:</strong> This will remove the blocked dates and make them available for booking again.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBlockModalOpen(false)
                          setIsUnblockMode(false)
                          setSelectedBlockedDate(null)
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isUnblockMode 
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        }`}
                      >
                        {isUnblockMode ? 'Unblock Dates' : 'Block Dates'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminCalendar 
