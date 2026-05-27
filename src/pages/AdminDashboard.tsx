import {
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import {
  CalendarIcon as CalendarSolidIcon,
  CheckCircleIcon as CheckSolidIcon,
  CurrencyRupeeIcon as CurrencySolidIcon
} from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/supabase'

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    totalRooms: 0,
    confirmedBookings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings()
      ])
      setStats({
        totalUsers: statsData?.totalUsers ?? 0,
        totalBookings: statsData?.totalBookings ?? 0,
        totalRevenue: (statsData as any)?.totalRevenue ?? 0,
        activeBookings: (statsData as any)?.activeBookings ?? 0,
        totalRooms: statsData?.totalRooms ?? 0,
        confirmedBookings: statsData?.confirmedBookings ?? 0
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    solidIcon: React.ElementType
    color: string
    bgColor: string
    trend?: string
    trendUp?: boolean
  }> = ({ title, value, solidIcon: SolidIcon, color, bgColor, trend, trendUp }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className={`flex items-center text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowTrendingUpIcon 
                className={`h-4 w-4 mr-1 ${trendUp ? '' : 'rotate-180'}`} 
              />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`relative ${bgColor} rounded-full p-4`}>
          <SolidIcon className={`h-8 w-8 ${color}`} />
          <div className="absolute inset-0 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  const QuickActionCard: React.FC<{
    title: string
    description: string
    icon: React.ElementType
    href: string
    color: string
    bgColor: string
  }> = ({ title, description, icon: Icon, href, color, bgColor }) => (
    <Link
      to={href}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200"
    >
      <div className="flex items-start">
        <div className={`${bgColor} rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="mt-3 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
            <span>Manage now</span>
            <ArrowTrendingUpIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening at Resort Booking System today</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Website
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            solidIcon={CalendarSolidIcon}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend="+12% this month"
            trendUp={true}
          />
          <StatCard
            title="Revenue Generated"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            solidIcon={CurrencySolidIcon}
            color="text-green-600"
            bgColor="bg-green-100"
            trend="+8% this month"
            trendUp={true}
          />
          <StatCard
            title="Active Bookings"
            value={stats.confirmedBookings}
            solidIcon={CheckSolidIcon}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend="2 pending"
            trendUp={false}
          />
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            solidIcon={BuildingOfficeIcon}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Manage your resort operations efficiently</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActionCard
                title="Manage Bookings"
                description="View, update, and track all guest reservations"
                icon={CalendarIcon}
                href="/admin/bookings"
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <QuickActionCard
                title="Room Management"
                description="Update room details, availability, and pricing"
                icon={BuildingOfficeIcon}
                href="/admin/rooms"
                color="text-green-600"
                bgColor="bg-green-100"
              />
              <QuickActionCard
                title="Guest Reviews"
                description="Monitor and respond to customer feedback"
                icon={StarIcon}
                href="/admin/reviews"
                color="text-yellow-600"
                bgColor="bg-yellow-100"
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Booking Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stats.confirmedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stats.activeBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stats.totalBookings - stats.confirmedBookings - stats.activeBookings}</span>
                </div>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Today's Priority
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-800">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Check new bookings
                </div>
                <div className="flex items-center text-sm text-blue-800">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Review room availability
                </div>
                <div className="flex items-center text-sm text-blue-800">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Respond to reviews
                </div>

              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Website Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking System</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Gateway</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 
