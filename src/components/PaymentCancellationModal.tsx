import { ArrowPathIcon, HomeIcon, PhoneIcon, XCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'

interface PaymentCancellationModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  onGoHome: () => void
  onContactSupport: () => void
  cancellationType: 'cancelled' | 'failed'
}

const PaymentCancellationModal: React.FC<PaymentCancellationModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onGoHome,
  onContactSupport,
  cancellationType
}) => {
  if (!isOpen) return null

  const isCancelled = cancellationType === 'cancelled'
  const title = isCancelled ? 'Payment Cancelled' : 'Payment Failed'
  const message = isCancelled 
    ? 'Your payment was cancelled. Would you like to try again or go back to browse more rooms?'
    : 'Your payment could not be processed. Please check your payment details and try again.'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className={`p-3 rounded-full ${isCancelled ? 'bg-orange-100' : 'bg-red-100'} mr-4`}>
            <XCircleIcon className={`h-8 w-8 ${isCancelled ? 'text-orange-500' : 'text-red-500'}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            {isCancelled ? 'Try Again' : 'Retry Payment'}
          </button>

          <button
            onClick={onGoHome}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go Home
          </button>

          <button
            onClick={onContactSupport}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
          >
            <PhoneIcon className="h-5 w-5 mr-2" />
            Contact Support
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            If you're experiencing issues with payment, our support team is here to help. 
            You can contact us via phone, email, or WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancellationModal 
