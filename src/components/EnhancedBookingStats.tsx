import {
    ArrowTrendingUpIcon,
    CalendarIcon,
    ChartBarIcon,
    CurrencyRupeeIcon,
    HomeIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';
import type { Booking } from '../lib/supabase';

interface EnhancedBookingStatsProps {
  bookings: Booking[];
  rooms: any[];
}

const EnhancedBookingStats: React.FC<EnhancedBookingStatsProps> = ({ 
  bookings, 
  rooms
}) => {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const currentMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.check_in_date)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    })
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const previousMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.check_in_date)
      return bookingDate.getMonth() === previousMonth && bookingDate.getFullYear() === previousYear
    })
    
    const historicalBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.check_in_date)
      return bookingDate < new Date(currentYear, currentMonth, 1)
    })
    
    const websiteBookings = bookings.filter(b => b.booking_status === 'confirmed')
    const otherBookings = bookings.filter(b => b.booking_status !== 'confirmed')
    
    const confirmedBookings = bookings.filter(b => b.booking_status === 'confirmed')
    const pendingBookings = bookings.filter(b => b.booking_status === 'pending')
    const cancelledBookings = bookings.filter(b => b.booking_status === 'cancelled')
    
    const paidBookings = bookings.filter(b => b.payment_status === 'paid')
    const unpaidBookings = bookings.filter(b => b.payment_status === 'pending')
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    const confirmedRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    const currentMonthRevenue = currentMonthBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    
    
    // Room-specific breakdowns
    const roomStats = rooms.map(room => {
      const roomBookings = bookings.filter(b => b.room_id === room.id)
      const roomCurrentMonth = currentMonthBookings.filter(b => b.room_id === room.id)
      const roomConfirmed = roomBookings.filter(b => b.booking_status === 'confirmed')
      
      return {
        room,
        totalBookings: roomBookings.length,
        currentMonthBookings: roomCurrentMonth.length,
        confirmedBookings: roomConfirmed.length,
        occupancyRate: roomBookings.length > 0 ? (roomConfirmed.length / roomBookings.length) * 100 : 0
      }
    })
    
    // Calculate monthly trends for the last 6 months
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1)
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.check_in_date)
        return bookingDate.getMonth() === month.getMonth() && bookingDate.getFullYear() === month.getFullYear()
      })
      monthlyTrends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      })
    }
    
    return {
      currentMonthBookings,
      previousMonthBookings,
      historicalBookings,
      websiteBookings,
      otherBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      paidBookings,
      unpaidBookings,
      totalRevenue,
      confirmedRevenue,
      currentMonthRevenue,
      totalBookings: bookings.length,
      roomStats,
      monthlyTrends
    }
  }, [bookings, rooms])

  return (
    <div className="space-y-6">
      {/* Current Month Highlight Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Current Month Overview</h2>
              <p className="text-blue-100">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.currentMonthBookings.length}</div>
            <div className="text-blue-100">Total Bookings</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <HomeIcon className="h-5 w-5" />
              <span className="font-medium">Website</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.websiteBookings.length}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <CurrencyRupeeIcon className="h-5 w-5" />
              <span className="font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              ₹{stats.currentMonthRevenue.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-5 w-5" />
              <span className="font-medium">Confirmed</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.currentMonthBookings.filter(b => b.booking_status === 'confirmed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All-Time Statistics */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">All-Time Statistics</h3>
              <p className="text-sm text-gray-600">Complete booking history</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700">Total Bookings</span>
              <span className="font-bold text-gray-900">{stats.totalBookings}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
              <span className="text-gray-700">Confirmed</span>
              <span className="font-bold text-green-600">{stats.confirmedBookings.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
              <span className="text-gray-700">Pending</span>
              <span className="font-bold text-yellow-600">{stats.pendingBookings.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <span className="text-gray-700">Cancelled</span>
              <span className="font-bold text-red-600">{stats.cancelledBookings.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-gray-700">Total Revenue</span>
              <span className="font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <HomeIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Platform Breakdown</h3>
              <p className="text-sm text-gray-600">Booking sources analysis</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                <span className="text-gray-700">Website</span>
              </div>
              <span className="font-bold text-emerald-600">{stats.websiteBookings.length}</span>
            </div>
            
            {stats.otherBookings.length > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-700">Other Platforms</span>
                </div>
                <span className="font-bold text-gray-600">{stats.otherBookings.length}</span>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Website %</span>
                <span className="font-bold text-gray-900">
                  {stats.totalBookings > 0 ? ((stats.websiteBookings.length / stats.totalBookings) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Historical vs Current */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Historical Analysis</h3>
              <p className="text-sm text-gray-600">Past vs current performance</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-gray-700">Historical Bookings</span>
              <span className="font-bold text-blue-600">{stats.historicalBookings.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
              <span className="text-gray-700">Current Month</span>
              <span className="font-bold text-green-600">{stats.currentMonthBookings.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
              <span className="text-gray-700">Previous Month</span>
              <span className="font-bold text-purple-600">{stats.previousMonthBookings.length}</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Month-over-Month</span>
                <span className={`font-bold ${stats.currentMonthBookings.length >= stats.previousMonthBookings.length ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.previousMonthBookings.length > 0 
                    ? (((stats.currentMonthBookings.length - stats.previousMonthBookings.length) / stats.previousMonthBookings.length) * 100).toFixed(1)
                    : 0}%
                  {stats.currentMonthBookings.length >= stats.previousMonthBookings.length ? ' ↗' : ' ↘'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
            </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">6-Month Trends</h3>
            <p className="text-sm text-gray-600">Monthly booking and revenue patterns</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {stats.monthlyTrends.map((trend, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{trend.month}</div>
                <div className="text-xl font-bold text-gray-900 mb-1">{trend.bookings}</div>
                <div className="text-xs text-gray-500">bookings</div>
                <div className="text-sm font-semibold text-blue-600 mt-2">
                  ₹{trend.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room-Specific Statistics */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <HomeIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Room Performance</h3>
            <p className="text-sm text-gray-600">Individual room statistics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.roomStats.map((roomStat) => (
            <div key={roomStat.room.id} className="bg-gradient-to-r from-gray-50 to-teal-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <HomeIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{roomStat.room.room_number}</h4>
                  <p className="text-xs text-gray-600">{roomStat.room.name}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{roomStat.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Month:</span>
                  <span className="font-semibold text-blue-600">{roomStat.currentMonthBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmed:</span>
                  <span className="font-semibold text-green-600">{roomStat.confirmedBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupancy:</span>
                  <span className="font-semibold text-purple-600">{roomStat.occupancyRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingStats; 
