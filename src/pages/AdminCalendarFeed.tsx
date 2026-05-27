import { ArrowTopRightOnSquareIcon, CalendarIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const AdminCalendarFeed: React.FC = () => {
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the current domain
    const currentDomain = window.location.origin;
    const feedUrl = `${currentDomain}/calendar/feed.ics`;
    setCalendarUrl(feedUrl);
    setIsLoading(false);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Calendar URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const testCalendarFeed = async () => {
    try {
      const response = await fetch(calendarUrl);
      if (response.ok) {
        const content = await response.text();
        if (content.includes('BEGIN:VCALENDAR')) {
          toast.success('✅ Calendar feed is working correctly!');
        } else {
          toast.error('❌ Calendar feed returned invalid content');
        }
      } else {
        toast.error(`❌ Calendar feed returned error: ${response.status}`);
      }
    } catch (error) {
      toast.error('❌ Failed to test calendar feed');
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-green-800 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Calendar Feed Export</h1>
            <p className="text-white/80">
              Export your website bookings to external calendar applications
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Calendar Feed URL */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Calendar Feed URL</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Public .ics Calendar Feed:</p>
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 rounded w-3/4"></div>
                    ) : (
                      <code className="text-sm bg-white px-3 py-2 rounded border block break-all">
                        {calendarUrl}
                      </code>
                    )}
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(calendarUrl)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={testCalendarFeed}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Test Feed"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use This Calendar Feed</h2>
              
              <div className="space-y-6">
                {/* Other Calendar Apps */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Other Calendar Applications</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>You can also subscribe to this calendar in:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Google Calendar:</strong> Add by URL → Paste the calendar URL</li>
                      <li><strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste URL</li>
                      <li><strong>Outlook:</strong> Add calendar → From internet → Paste URL</li>
                      <li><strong>Any iCal-compatible app:</strong> Use the URL above</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Calendar Details</h4>
                    <ul className="space-y-1 text-blue-800">
                      <li><strong>Name:</strong> Resort Booking System - Availability</li>
                      <li><strong>Type:</strong> iCal (.ics) format</li>
                      <li><strong>Update Frequency:</strong> Every 5 minutes</li>
                      <li><strong>Timezone:</strong> Asia/Kolkata</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">What's Included</h4>
                    <ul className="space-y-1 text-blue-800">
                      <li>✅ Website bookings (confirmed & pending)</li>
                      <li>✅ Manually blocked dates</li>
                      <li>❌ Cancelled bookings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-medium text-yellow-900 mb-2">Common Issues</h4>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p><strong>Calendar not updating:</strong> Some apps cache calendar feeds. Wait 5-10 minutes or manually refresh.</p>
                  <p><strong>Import not working:</strong> Make sure you're using the exact URL and selecting the correct import type in your calendar application.</p>
                  <p><strong>Wrong timezone:</strong> The calendar uses Asia/Kolkata timezone. Adjust your calendar app settings if needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarFeed;
