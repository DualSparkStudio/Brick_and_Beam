import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import React, { useCallback, useMemo, useState } from 'react';
import type { Booking, Room } from '../lib/supabase';
import BlockedDateDetailsModal from './BlockedDateDetailsModal';
import BookingDetailsModal from './BookingDetailsModal';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: any;
  allDay: boolean;
}

interface EnhancedCalendarProps {
  bookings: Booking[];
  rooms: Room[];
  blockedDates?: any[];
  onDateSelect?: (selectInfo: any) => void;
  selectedRoom?: number;
  refreshTrigger?: number;
  onRefreshData?: () => void;
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  bookings,
  rooms,
  blockedDates = [],
  onDateSelect,
  selectedRoom,
  refreshTrigger = 0,
  onRefreshData
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockedDate, setSelectedBlockedDate] = useState<any>(null);
  const [isBlockedDateModalOpen, setIsBlockedDateModalOpen] = useState(false);

  // Convert database bookings to calendar events (only website bookings)
  const convertDatabaseBookingsToEvents = useCallback((bookings: Booking[]): CalendarEvent[] => {
    // Only show website bookings
    const websiteBookings = bookings.filter(booking => 
      !booking.booking_source || booking.booking_source === 'website' || booking.booking_source === 'Website'
    );
    
    return websiteBookings.map(booking => {
      const room = rooms.find(r => r.id === booking.room_id);
      const roomName = room ? (room.is_deleted ? `${room.name} (Deleted)` : room.name) : 'Unknown Room';
        
      let backgroundColor = '#ef4444'; // Red for confirmed bookings
      let borderColor = '#dc2626';
      let title = `${booking.first_name} ${booking.last_name} (${roomName})`;
        
      if (booking.booking_status === 'cancelled') {
        backgroundColor = '#6b7280'; // Gray for cancelled
        borderColor = '#4b5563';
        title = `${title} - Cancelled`;
      } else if (booking.booking_status === 'pending') {
        backgroundColor = '#f59e0b'; // Yellow for pending
        borderColor = '#d97706';
        title = `${title} - Pending`;
      }
        
      return {
        id: `db-${booking.id}`,
        title: title,
        start: booking.check_in_date,
        end: booking.check_out_date,
        backgroundColor,
        borderColor,
        textColor: '#FFFFFF',
        extendedProps: {
          source: 'Website' as const,
          roomId: booking.room_id,
          guestName: `${booking.first_name} ${booking.last_name}`,
          numGuests: booking.num_guests,
          phone: booking.phone,
          email: booking.email,
          isReadOnly: false,
          booking: booking,
          type: 'booking' as const,
          bookingStatus: booking.booking_status,
          paymentStatus: booking.payment_status,
          platform: 'Website',
          roomInfo: roomName,
          totalAmount: booking.total_amount,
          room: room,
          bookingSource: 'database',
          originalBookingSource: booking.booking_source
        },
        allDay: true
      };
    });
  }, [rooms]);

  // Convert blocked dates to calendar events (only manual blocked dates)
  const convertBlockedDatesToEvents = useCallback((blockedDates: any[]): CalendarEvent[] => {
    // Only show manual blocked dates
    const manualBlockedDates = blockedDates.filter(blocked => blocked.source === 'manual');
    
    return manualBlockedDates.map(blocked => {
      const room = rooms.find(r => r.id === blocked.room_id);
      const roomName = room ? (room.is_deleted ? `${room.name} (Deleted)` : room.name) : 'Unknown Room';
      
      return {
        id: `blocked-${blocked.id}`,
        title: `🚫 Manual Block - ${roomName}`,
        start: blocked.start_date,
        end: blocked.end_date,
        backgroundColor: '#3b82f6', // Blue for manual blocked dates
        borderColor: '#2563eb',
        textColor: '#FFFFFF',
        extendedProps: {
          source: 'Manual' as const,
          roomId: blocked.room_id,
          isReadOnly: true,
          type: 'blocked' as const,
          reason: blocked.reason,
          notes: blocked.notes,
          platform: 'Manual',
          roomInfo: roomName,
          blockedSource: 'manual'
        },
        allDay: true
      };
    });
  }, [rooms]);

  // Check for double booking conflicts and show warnings
  React.useEffect(() => {
    const checkForDoubleBookings = () => {
      const websiteEvents = convertDatabaseBookingsToEvents(bookings);
      const roomBookings = new Map<number, any[]>();
      
      // Group bookings by room
      websiteEvents.forEach(event => {
        if (event.extendedProps.type === 'booking') {
          const roomId = event.extendedProps.roomId;
          if (!roomBookings.has(roomId)) {
            roomBookings.set(roomId, []);
          }
          roomBookings.get(roomId)!.push(event);
        }
      });
      
      // Check each room for conflicts
      roomBookings.forEach((bookings, roomId) => {
        if (bookings.length > 1) {
          // Check for overlapping bookings
          for (let i = 0; i < bookings.length; i++) {
            for (let j = i + 1; j < bookings.length; j++) {
              const booking1 = bookings[i];
              const booking2 = bookings[j];
              
              const start1 = new Date(booking1.start);
              const end1 = new Date(booking1.end);
              const start2 = new Date(booking2.start);
              const end2 = new Date(booking2.end);
              
              if (start1 < end2 && end1 > start2) {
                // Overlapping bookings detected
                const roomName = rooms.find(r => r.id === roomId)?.name || `Room ${roomId}`;
                console.warn(`Double booking detected in ${roomName}!`);
              }
            }
          }
        }
      });
    };
    
    checkForDoubleBookings();
  }, [bookings, rooms, convertDatabaseBookingsToEvents]);

  // Calculate booking stats (only website bookings)
  const bookingStats = useMemo(() => {
    const websiteBookings = bookings.filter(b => 
      !b.booking_source || b.booking_source === 'website' || b.booking_source === 'Website'
    );
    
    const confirmed = websiteBookings.filter(b => b.booking_status === 'confirmed').length;
    const pending = websiteBookings.filter(b => b.booking_status === 'pending').length;
    const cancelled = websiteBookings.filter(b => b.booking_status === 'cancelled').length;
    
    return {
      confirmed,
      pending,
      cancelled,
      total: websiteBookings.length
    };
  }, [bookings]);

  // Get all events for the calendar (memoized for performance)
  const getAllEvents = useCallback((): CalendarEvent[] => {
    // Only show website bookings and manual blocked dates
    const websiteEvents = convertDatabaseBookingsToEvents(bookings);
    const manualBlockedEvents = convertBlockedDatesToEvents(blockedDates);

    // Combine website bookings and manual blocked dates
    const allEvents = [...websiteEvents, ...manualBlockedEvents];
    
    // Advanced deduplication that prevents double bookings while allowing bookings and blocked dates to coexist
    const uniqueEvents = allEvents.filter((event, index, self) => {
      // Check for exact duplicates (same ID)
      const exactDuplicate = self.findIndex(e => e.id === event.id);
      if (exactDuplicate !== index) return false;
      
      // Check for overlapping events on the same room (including partial overlaps)
      const overlappingEvents = self.filter(e => {
        if (e.extendedProps.roomId !== event.extendedProps.roomId) return false;
        
        // Check for date range overlap
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const eStart = new Date(e.start);
        const eEnd = new Date(e.end);
        
        // Check if date ranges overlap
        return (eventStart < eEnd && eventEnd > eStart);
      });
      
      if (overlappingEvents.length > 1) {
        // Allow bookings and blocked dates to coexist and display simultaneously
        const isCurrentEventBooking = event.extendedProps.type === 'booking';
        
        // If current event is a booking, check for conflicts with other bookings
        if (isCurrentEventBooking) {
          const otherBookings = overlappingEvents.filter(e => 
            e.id !== event.id && e.extendedProps.type === 'booking'
          );
          
          if (otherBookings.length > 0) {
            // There are conflicting bookings - this is a double booking scenario
            // Keep the first booking found
            const firstBooking = overlappingEvents.find(e => e.extendedProps.type === 'booking');
            return event.id === firstBooking?.id;
          }
          
          // No conflicting bookings, keep this booking
          return true;
        }
      }
      
      // Check for duplicates based on start, end, roomId, and source
      const duplicateByDateAndRoom = self.findIndex(e => 
        e.start === event.start && 
        e.end === event.end && 
        e.extendedProps.roomId === event.extendedProps.roomId &&
        e.extendedProps.source === event.extendedProps.source &&
        e.extendedProps.type === event.extendedProps.type
      );
      if (duplicateByDateAndRoom !== index) return false;
      
      return true;
    });
    
    // Final deduplication step - remove any remaining duplicates using a unique key
    const finalEvents = uniqueEvents.filter((event, index, self) => {
      const uniqueKey = `${event.start}-${event.end}-${event.extendedProps.roomId}-${event.extendedProps.source}-${event.title}`;
      const duplicate = self.findIndex(e => {
        const eKey = `${e.start}-${e.end}-${e.extendedProps.roomId}-${e.extendedProps.source}-${e.title}`;
        return eKey === uniqueKey;
      });
      return duplicate === index;
    });
    
    // Group events by date and room to show booking counts
    const eventGroups = new Map<string, CalendarEvent[]>();
    
    finalEvents.forEach(event => {
      const key = `${event.start}-${event.extendedProps.roomId}`;
      if (!eventGroups.has(key)) {
        eventGroups.set(key, []);
      }
      eventGroups.get(key)!.push(event);
    });
    
    // Add booking count to events that have multiple bookings on the same date
    const eventsWithCounts = finalEvents.map(event => {
      const key = `${event.start}-${event.extendedProps.roomId}`;
      const group = eventGroups.get(key) || [];
      const bookingEvents = group.filter(e => e.extendedProps.type === 'booking');
      
      if (bookingEvents.length > 1) {
        return {
          ...event,
          extendedProps: {
            ...event.extendedProps,
            bookingCount: bookingEvents.length
          }
        };
      }
      return event;
    });
    
    if (selectedRoom) {
      const filteredEvents = eventsWithCounts.filter(event => event.extendedProps.roomId === selectedRoom);
      return filteredEvents;
    }
    
    return eventsWithCounts;
  }, [bookings, blockedDates, convertDatabaseBookingsToEvents, convertBlockedDatesToEvents, selectedRoom]);

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    
    // Check if this is a blocked date event
    const isBlockedDate = event.extendedProps?.type === 'blocked' || 
                         event.title?.includes('🚫') || 
                         event.title?.includes('Blocked');
    
    if (isBlockedDate) {
      // For blocked dates, show the blocked date details modal
      const blockedDateData = {
        id: parseInt(event.id.replace('blocked-', '')),
        room_id: event.extendedProps?.roomId,
        start_date: event.startStr,
        end_date: event.endStr,
        reason: event.extendedProps?.reason || 'No reason specified',
        notes: event.extendedProps?.notes,
        source: event.extendedProps?.blockedSource || event.extendedProps?.source || 'manual',
        roomName: event.extendedProps?.roomInfo || 'Unknown Room'
      };
      
      
      setSelectedBlockedDate(blockedDateData);
      setIsBlockedDateModalOpen(true);
      return;
    }
    
    // For actual bookings, show the booking details modal
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps,
      allDay: event.allDay
    };
    
    setSelectedEvent(calendarEvent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseBlockedDateModal = () => {
    setIsBlockedDateModalOpen(false);
    setSelectedBlockedDate(null);
  };

  const handleUnblockSuccess = () => {
    // Refresh the calendar data after successful unblock
    onRefreshData?.();
  };

  const eventClassNames = () => {
    return [];
  };

  const eventContent = (arg: any) => {
    // Show the full title with room names for blocked dates
    let displayText = arg.event.title;
    let sourceText = arg.event.extendedProps.source;
    
    // For blocked dates, show the full title (which includes room name)
    if (arg.event.extendedProps.type === 'blocked') {
      displayText = arg.event.title; // Keep the full title with room name
      sourceText = arg.event.extendedProps.source || 'Blocked';
    }
    
    return (
      <div className="relative">
        <div className="text-xs text-white font-medium truncate" title={displayText}>
          {displayText}
        </div>
        <div className="text-xs opacity-75">
          {sourceText}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Booking Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{bookingStats.confirmed}</div>
          <div className="text-sm text-blue-700">Confirmed Bookings</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{bookingStats.cancelled}</div>
          <div className="text-sm text-gray-700">Cancelled</div>
        </div>
      </div>
        
      {/* Calendar Legend */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Calendar Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Bookings</h4>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Confirmed Bookings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Pending Bookings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm text-gray-600">Cancelled Bookings</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Blocked Dates</h4>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Manual Block - [Room Name]</span>
            </div>
          </div>
        </div>
      </div>
        
      {/* Calendar */}
      <div className="bg-white rounded-lg shadow">
          <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next'
            }}
            events={getAllEvents()}
          eventClick={handleEventClick}
          dateClick={(arg) => {
            onDateSelect?.(arg);
          }}
          select={(arg) => {
            onDateSelect?.(arg);
          }}
            selectable={true}
          selectMirror={true}
          dayMaxEvents={false}
          weekends={true}
          eventClassNames={eventClassNames}
          eventContent={eventContent}
            height={600}
            eventDisplay="block"
            eventTimeFormat={{
            hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
        />
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Blocked Date Details Modal */}
      <BlockedDateDetailsModal
        isOpen={isBlockedDateModalOpen}
        onClose={handleCloseBlockedDateModal}
        blockedDate={selectedBlockedDate}
        onUnblockSuccess={handleUnblockSuccess}
      />
    </div>
  );
};

export default EnhancedCalendar; 
