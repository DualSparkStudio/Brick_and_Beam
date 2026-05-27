import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../lib/supabase'

interface AvailabilityCalendarProps {
  roomId: number
  onDateSelect?: (startDate: string, endDate: string) => void
  selectedStartDate?: string
  selectedEndDate?: string
  isHover?: boolean
  onMonthChange?: () => void
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  roomId,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  isHover = false,
  onMonthChange
}) => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [roomName, setRoomName] = useState<string>('')
  const [roomQuantity, setRoomQuantity] = useState<number>(1)
  const [selectionMode, setSelectionMode] = useState<'none' | 'start' | 'end'>('none')

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        try {
          await loadAvailabilityData();
        } catch (error) {
          // Silently handle errors if component unmounted
          if (isMounted) {
            console.error('Error loading availability data:', error);
          }
        }
      }
    };
    
    loadData();
    
    // Cleanup: Prevent state updates if component unmounts during fetch
    return () => {
      isMounted = false;
    };
  }, [roomId, selectedStartDate, selectedEndDate])


  const loadAvailabilityData = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings, blocked dates, and room information
      const [bookingsData, blockedDatesData, roomsData] = await Promise.all([
        api.getBookings(),
        api.getBlockedDates(roomId), // Get blocked dates for this specific room
        api.getRooms() // Get all rooms to find the room name
      ])
      
      console.log('🔍 Blocked dates fetched:', blockedDatesData)
      console.log('🔍 Room ID:', roomId)
      
      // Find the room name and quantity
      const room = roomsData?.find(r => r.id === roomId)
      const currentRoomName = room ? (room.is_deleted ? `${room.name} (Deleted)` : room.name) : 'Unknown Room'
      const currentRoomQuantity = room?.quantity || 1
      setRoomName(currentRoomName)
      setRoomQuantity(currentRoomQuantity)
      
      // Filter bookings for this room only (only website bookings)
      const roomBookings = bookingsData?.filter(booking => {
        if (booking.room_id !== roomId) return false
        
        // Only show website bookings
        return !booking.booking_source || booking.booking_source === 'website' || booking.booking_source === 'Website'
      }) || []
      
      // Filter blocked dates (only manual blocked dates)
      const filteredBlockedDates = blockedDatesData?.filter(blocked => {
        // Only show manual blocked dates
        return blocked.source === 'manual'
      }) || []
      
      console.log('🔍 Filtered blocked dates:', filteredBlockedDates)
      
      // Create FullCalendar events for the calendar
      const calendarEvents: any[] = []
      
      // Add database bookings as calendar events (only website bookings)
      roomBookings.forEach(booking => {
        calendarEvents.push({
          id: `booking-${booking.id}`,
          title: '–',
          start: booking.check_in_date,
          end: booking.check_out_date,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          textColor: '#717171',
          allDay: true,
          extendedProps: {
            type: 'booking',
            source: 'Website',
            roomId: roomId,
            booking: booking,
            booking_status: booking.booking_status,
            roomInfo: currentRoomName
          }
        })
      })
      
      // Add database blocked dates as calendar events (only manual blocked dates)
      filteredBlockedDates.forEach(blocked => {
        calendarEvents.push({
          id: `blocked-${blocked.id}`,
          title: '–',
          start: blocked.start_date,
          end: blocked.end_date,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderColor: 'transparent',
          textColor: '#717171',
          allDay: true,
          extendedProps: {
            type: 'blocked',
            source: 'Manual',
            roomId: roomId,
            blockedDate: blocked,
            roomInfo: currentRoomName
          }
        })
      })
      
      
      setEvents(calendarEvents)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const isDateBlocked = (dateStr: string) => {
    
    return events.some(event => {
      if (event.extendedProps?.type === 'selected') {
        return false
      }
      
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const clicked = new Date(dateStr)
      
      // Check if the clicked date falls within the event range
      const isInRange = clicked >= eventStart && clicked < eventEnd
      
      
      // For blocked dates and confirmed bookings, always block
      if (event.extendedProps?.type === 'blocked' || 
          (event.extendedProps?.type === 'booking' && event.extendedProps?.booking?.booking_status === 'confirmed')) {
        return isInRange
      }
      
      // For pending bookings, we might want to allow selection (optional)
      // For now, we'll block pending bookings too
      if (isInRange) {
      }
      return isInRange
    })
  }

  const handleDateClick = (arg: any) => {
    const clickedDate = arg.dateStr
    
    
    // Check if the clicked date is already booked or blocked
    if (isDateBlocked(clickedDate)) {
      return // Don't allow selection of blocked dates
    }
    
    // Check if clicked date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const clicked = new Date(clickedDate)
    if (clicked < today) {
      return
    }
    
    
    // Enhanced selection logic
    if (!selectedStartDate) {
      // First click - set start date
      onDateSelect?.(clickedDate, '')
      setSelectionMode('start')
    } else if (!selectedEndDate) {
      // Second click - set end date
      const startDate = new Date(selectedStartDate)
      const endDate = new Date(clickedDate)
      
      if (endDate > startDate) {
        // Valid range
        onDateSelect?.(selectedStartDate, clickedDate)
        setSelectionMode('none')
      } else if (endDate.getTime() === startDate.getTime()) {
        // Same date clicked - clear selection
        onDateSelect?.('', '')
        setSelectionMode('none')
      } else {
        // End date before start date - swap them
        onDateSelect?.(clickedDate, selectedStartDate)
        setSelectionMode('none')
      }
    } else {
      // Both dates selected - start over with new start date
      onDateSelect?.(clickedDate, '')
      setSelectionMode('start')
    }
  }

  const handleDateRangeSelect = (arg: any) => {
    const startDate = arg.startStr
    const endDate = arg.endStr
    
    
    // FullCalendar end date is exclusive, but we want to keep it as is for consistency
    // Don't subtract one day - keep the visual selection matching the input
    const endDateStr = endDate
    
    // Check if the selected range conflicts with any existing bookings or blocked dates
    const conflictingEvents = events.filter(event => {
      if (event.extendedProps?.type === 'selected') return false
      
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const rangeStart = new Date(startDate)
      const rangeEnd = new Date(endDateStr)
      
      // Check for any overlap
      return (rangeStart < eventEnd && rangeEnd > eventStart)
    })
    
    if (conflictingEvents.length > 0) {
      // Find blocked dates specifically
      const blockedConflicts = conflictingEvents.filter(event => event.extendedProps?.type === 'blocked')
      
      if (blockedConflicts.length > 0) {
        toast.error('Cannot book this date range because it includes blocked dates. Please select a different range.')
        return
      } else {
        toast.error('Cannot book this date range because it conflicts with existing bookings. Please select a different range.')
        return
      }
    }
    
    // Check if start date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate)
    if (start < today) {
      toast.error('Cannot book dates in the past. Please select future dates.')
      return
    }
    
    onDateSelect?.(startDate, endDateStr)
    setSelectionMode('none')
  }

  const handleSelectAllow = (selectInfo: any) => {
    const start = new Date(selectInfo.start)
    const end = new Date(selectInfo.end)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    
    // Don't allow selection in the past
    if (start < today) {
      return false
    }
    
    // Check if any date in the range is blocked (including blocked dates in the middle)
    const current = new Date(start)
    const blockedDates = []
    
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0]
      if (isDateBlocked(dateStr)) {
        
        // Find which event is blocking this date
        const blockingEvent = events.find(event => {
          if (event.extendedProps?.type === 'selected') return false
          
          const eventStart = new Date(event.start)
          const eventEnd = new Date(event.end)
          const currentDate = new Date(dateStr)
          
          return (currentDate >= eventStart && currentDate < eventEnd)
        })
        
        if (blockingEvent) {
          blockedDates.push({
            date: dateStr,
            reason: blockingEvent.extendedProps?.type === 'blocked' ? 'blocked date' : 'existing booking',
            eventTitle: blockingEvent.title
          })
        }
      }
      current.setDate(current.getDate() + 1)
    }
    
    if (blockedDates.length > 0) {
      return false
    }
    
    return true
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  return (
    <div className={`calendar-container ${isHover ? 'w-80' : 'w-full'}`}>
      <style>{`
        /* Calendar styling */
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #e0e0e0;
        }
        
        .fc-daygrid-day {
          position: relative;
        }
        
        .fc-daygrid-day-number {
          color: #222222;
          font-weight: 500;
          padding: 8px;
        }
        
        .fc-daygrid-day.fc-day-today {
          background-color: #f7f7f7;
        }
        
        .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #222222;
          font-weight: 600;
        }
        
        .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
          color: #b0b0b0;
        }
        
        .fc-daygrid-day:hover {
          background-color: #f7f7f7;
        }
        
        .fc-event {
          border: none !important;
          background: transparent !important;
        }
        
        .fc-event-title {
          display: none !important;
        }
        
        /* Custom dash styling for blocked dates */
        .blocked-date-dash {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 500;
          color: #717171;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          margin: 2px;
          z-index: 1;
        }
      `}</style>
      <div className="calendar-header p-0">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Select Dates</h3>
        <p className="text-xs text-gray-500 mt-0">
          {!selectedStartDate 
            ? 'Click a date to select check-in' 
            : !selectedEndDate 
              ? `Check-in: ${new Date(selectedStartDate).toLocaleDateString()} - Click another date to select check-out` 
              : `Selected: ${new Date(selectedStartDate).toLocaleDateString()} - ${new Date(selectedEndDate).toLocaleDateString()}`
          }
        </p>
      </div>
      
      <div className="p-0">
        <CalendarComponent
          roomId={roomId}
          onDateSelect={onDateSelect}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          calendarData={events}
          roomQuantity={roomQuantity}
        />
      </div>
      
    </div>
  )
}

// Calendar component
interface CalendarComponentProps {
  roomId: number
  onDateSelect?: (startDate: string, endDate: string) => void
  selectedStartDate?: string
  selectedEndDate?: string
  calendarData: any[]
  roomQuantity: number
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  roomId,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  calendarData,
  roomQuantity
}) => {
  // ============================================
  // SOLUTION: Single atomic state for month + year
  // ============================================
  // Parse date string manually (avoid Date constructor UTC shifts)
  const parseDateStr = (dateStr: string): { month: number; year: number } => {
    const parts = dateStr.split('-')
    return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 }
  }

  const getInitialView = (): { month: number; year: number } => {
    if (selectedStartDate) return parseDateStr(selectedStartDate)
    const now = new Date()
    return { month: now.getMonth(), year: now.getFullYear() }
  }
  
  const [view, setView] = useState<{ month: number; year: number }>(getInitialView)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // Update calendar month when selectedStartDate changes
  useEffect(() => {
    if (selectedStartDate) {
      setView(parseDateStr(selectedStartDate))
    }
  }, [selectedStartDate])

  // Get current month/year from atomic state
  const currentMonth = view.month
  const currentYear = view.year

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Helper function to check if date is blocked
  const isDateBlocked = (dateStr: string) => {
    const result = calendarData.some(event => {
      if (event.extendedProps?.type === 'blocked') {
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)
        const checkDate = new Date(dateStr)
        
        // For blocked dates, include the end date
        const isBlocked = checkDate >= startDate && checkDate < endDate
        if (isBlocked) {
        }
        return isBlocked
      }
      return false
    })
    return result
  }

  // Helper function to check if date is fully booked (all rooms booked)
  const isDateBooked = (dateStr: string) => {
    // If roomQuantity not loaded yet, default to 1
    const quantity = roomQuantity || 1
    
    // Count how many bookings overlap with this date
    const bookingsOnDate = calendarData.filter(event => {
      if (event.extendedProps?.type === 'booking') {
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)
        const checkDate = new Date(dateStr)
        
        // For bookings, exclude the checkout date
        const isBooked = checkDate >= startDate && checkDate < endDate
        return isBooked
      }
      return false
    })
    
    // Date is only "booked" (blocked) if number of bookings >= room quantity
    const isFullyBooked = bookingsOnDate.length >= quantity
    
    return isFullyBooked
  }

  // Helper function to check if date is selected
  const isDateSelected = (dateStr: string) => {
    if (!selectedStartDate) return false
    if (!selectedEndDate) return dateStr === selectedStartDate
    
    const startDate = new Date(selectedStartDate)
    const endDate = new Date(selectedEndDate)
    const checkDate = new Date(dateStr)
    
    return checkDate >= startDate && checkDate <= endDate
  }

  // Helper function to check if date is in the past
  const isDateInPast = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(dateStr)
    return checkDate < today
  }

  // Handle date click
  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day)
    
    if (isDateInPast(dateStr) || isDateBlocked(dateStr) || isDateBooked(dateStr)) {
      return // Don't allow selection of past, blocked, or booked dates
    }

    if (!selectedStartDate) {
      // First date selection
      onDateSelect?.(dateStr, '')
    } else if (!selectedEndDate) {
      // Second date selection
              const startDate = new Date(selectedStartDate)
      const endDate = new Date(dateStr)
      
      if (endDate < startDate) {
        // If end date is before start date, make it the new start date
        onDateSelect?.(dateStr, '')
      } else {
        // Set the end date
        onDateSelect?.(selectedStartDate, dateStr)
      }
    } else {
      // Reset selection
      onDateSelect?.(dateStr, '')
    }
  }

  // Navigation functions - Atomic updates
  const goToPreviousMonth = () => {
    setView(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 }
      return { month: prev.month - 1, year: prev.year }
    })
  }

  const goToNextMonth = () => {
    setView(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 }
      return { month: prev.month + 1, year: prev.year }
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="calendar">
      <style>{`
        .calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }
        
        .calendar-title {
          font-size: 18px;
          font-weight: 600;
          color: #222;
        }
        
        .nav-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #222;
          transition: background-color 0.2s;
        }
        
        .nav-button:hover {
          background-color: #f3f4f6;
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: white;
        }
        
        .day-header {
          padding: 12px 8px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #717171;
          background: #f9f9f9;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .calendar-day {
          position: relative;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
          font-size: 14px;
          font-weight: 400;
          color: #222222;
        }
        
        .calendar-day:last-child {
          border-right: none;
        }
        
        .calendar-day.empty {
          background: #f9f9f9;
          cursor: default;
        }
        
        .calendar-day.past {
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        .calendar-day.blocked {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .calendar-day.booked {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .calendar-day.selected {
          background: #222;
          color: white;
        }
        
        .calendar-day.selected-start {
          background: #222;
          color: white;
          border-radius: 4px 0 0 4px;
        }
        
        .calendar-day.selected-end {
          background: #222;
          color: white;
          border-radius: 0 4px 4px 0;
        }
        
        .calendar-day.selected-range {
          background: #222;
          color: white;
        }
        
        .calendar-day:hover:not(.past):not(.blocked):not(.booked):not(.empty) {
          background: #f3f4f6;
        }
        
        .calendar-day.today {
          font-weight: 600;
          background: #fef3c7 !important;
          color: #92400e !important;
          border: 2px solid #f59e0b !important;
        }
        
        .calendar-day.today:not(.selected):not(.blocked):not(.booked) {
          color: #92400e !important;
        }
        
        .blocked-date {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }
        
        .blocked-date .number {
          font-size: 14px;
          font-weight: 400;
          color: #9ca3af;
          line-height: 1;
        }
        
        .blocked-date .dash {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 18px;
          font-weight: 300;
          color: #6b7280;
          line-height: 1;
          z-index: 2;
        }
        
        @media (max-width: 640px) {
          .calendar-day {
            min-height: 40px;
            font-size: 12px;
          }
          
          .calendar-header {
            padding: 12px 16px;
          }
          
          .calendar-title {
            font-size: 16px;
          }
          
          .blocked-date .dash {
            font-size: 16px;
            font-weight: 300;
          }
          
          .blocked-date .number {
            font-size: 12px;
          }
        }
      `}</style>
      
      {/* Calendar Header */}
      <div className="calendar-header">
        <button 
          className="nav-button" 
          onClick={goToPreviousMonth}
          disabled={view.month === new Date().getMonth() && view.year === new Date().getFullYear()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        <div className="calendar-title">
          {monthNames[currentMonth]} {currentYear}
      </div>
      
        <button className="nav-button" onClick={goToNextMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
            </div>
      
      {/* Day Headers */}
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-header">
            {day}
            </div>
        ))}
            </div>
      
      {/* Calendar Days */}
      <div className="calendar-grid" key={`${currentYear}-${currentMonth}`}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>
          }
          
          const dateStr = formatDate(currentYear, currentMonth, day)
          const isToday = dateStr === new Date().toISOString().split('T')[0]
          const isPast = isDateInPast(dateStr)
          const isBlocked = isDateBlocked(dateStr)
          const isBooked = isDateBooked(dateStr)
          const isSelected = isDateSelected(dateStr)
          
          // Debug logging for specific dates
          if (day <= 5) { // Only log first few days to avoid spam
          }
          
          let dayClass = 'calendar-day'
          if (isPast) dayClass += ' past'
          if (isBlocked) dayClass += ' blocked'
          if (isBooked) dayClass += ' booked'
          if (isToday) dayClass += ' today'
          if (isSelected) {
            if (selectedStartDate && selectedEndDate) {
              if (dateStr === selectedStartDate) dayClass += ' selected-start'
              else if (dateStr === selectedEndDate) dayClass += ' selected-end'
              else dayClass += ' selected-range'
            } else {
              dayClass += ' selected'
            }
          }
          
          return (
            <div
              key={`${currentYear}-${currentMonth}-${day}`}
              className={dayClass}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {isBlocked || isBooked ? (
                <div className="blocked-date">
                  <div className="number">{day}</div>
                  <div className="dash">—</div>
            </div>
              ) : (
                day
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AvailabilityCalendar 
