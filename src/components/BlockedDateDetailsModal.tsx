import React from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/supabase';

interface BlockedDateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedDate: {
    id: number;
    room_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    notes?: string;
    source: string;
    roomName?: string;
  } | null;
  onUnblockSuccess?: () => void;
}

const BlockedDateDetailsModal: React.FC<BlockedDateDetailsModalProps> = ({
  isOpen,
  onClose,
  blockedDate,
  onUnblockSuccess
}) => {
  if (!isOpen || !blockedDate) return null;

  const handleUnblock = async () => {
    try {
      
      await api.deleteBlockedDate(blockedDate.id);
      
      toast.success('Dates unblocked successfully');
      onUnblockSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to unblock dates');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSourceDisplay = (source: string) => {
    switch (source) {
      case 'manual':
        return 'Manual (Admin Panel)';
      default:
        return source;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'manual':
        return '🔧';
      default:
        return '📅';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2">🚫</span>
              Blocked Date Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <span className="mr-2">{getSourceIcon(blockedDate.source)}</span>
                <span className="text-sm text-gray-900">{getSourceDisplay(blockedDate.source)}</span>
              </div>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <div className="p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-900">{blockedDate.roomName || 'Unknown Room'}</span>
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocked Dates
              </label>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm text-gray-900 ml-2">{formatDate(blockedDate.start_date)}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="text-sm text-gray-900 ml-2">{formatDate(blockedDate.end_date)}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <div className="p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-900">{blockedDate.reason || 'No reason specified'}</span>
              </div>
            </div>

            {/* Notes */}
            {blockedDate.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-900">{blockedDate.notes}</span>
                </div>
              </div>
            )}

          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            {blockedDate.source === 'manual' && (
              <button
                type="button"
                onClick={handleUnblock}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Unblock Dates
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedDateDetailsModal;
