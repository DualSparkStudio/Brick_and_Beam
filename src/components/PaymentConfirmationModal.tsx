import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  roomName: string
  guestName: string
  guestCount: number
  checkIn: string
  checkOut: string
  totalAmount: number
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  roomName,
  guestName,
  guestCount,
  checkIn,
  checkOut,
  totalAmount
}) => {
  const [isChecked, setIsChecked] = useState(false)

  if (!isOpen) return null

  const handleProceed = () => {
    if (isChecked) {
      onProceed()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Confirm Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Important Note */}
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                Please Review Your Booking Details
              </h3>
              <p className="text-sm text-yellow-700">
                Please check all the details before making payment like room, personal details and guest count.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details Summary */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Room:</span>
              <span className="font-medium text-gray-900">{roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guest Name:</span>
              <span className="font-medium text-gray-900">{guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Guests:</span>
              <span className="font-medium text-gray-900">{guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium text-gray-900">{new Date(checkIn).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium text-gray-900">{new Date(checkOut).toLocaleDateString()}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information Note */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Important Information
              </h3>
              <p className="text-sm text-blue-700">
                The booking confirmation page might take a few seconds to display. Please do not take any action (refresh, close tab, or click back) until the confirmation page appears.
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              I have reviewed all the booking details (room, personal information, guest count, dates, and total amount) and confirm they are correct. I understand that the confirmation page may take a few seconds to load.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!isChecked}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
              isChecked
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentConfirmationModal

