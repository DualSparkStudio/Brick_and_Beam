import { XCircleIcon, HomeIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { useNavigate } from 'react-router-dom'

interface RoomUnavailableModalProps {
  isOpen: boolean
  onClose: () => void
  roomName?: string
}

const RoomUnavailableModal: React.FC<RoomUnavailableModalProps> = ({
  isOpen,
  onClose,
  roomName
}) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleGoToRooms = () => {
    navigate('/rooms')
    onClose()
  }

  const handleGoHome = () => {
    navigate('/')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 rounded-full bg-red-100 mr-4">
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Room Not Available</h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          This room is currently not available for booking.
          <br />
          <br />
          Please check back later or browse our other available rooms.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoToRooms}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
          >
            Browse Other Rooms
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go Home
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomUnavailableModal

