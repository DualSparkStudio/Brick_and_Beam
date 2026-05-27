import {
    KeyIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/supabase'

const AdminProfile: React.FC = () => {
  const { user, updateProfile, changePassword, refreshUserData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    email_notifications: true,
    sms_notifications: false,
    dashboard_alerts: true,
    mail_username: '',
    mail_password: '',
    mail_server: 'smtp.gmail.com',
    mail_port: '587'
  })

  const [testEmailRecipient, setTestEmailRecipient] = useState('')

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
  }, [user])

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true)
        const smtpConfig = await api.getSmtpConfig()
        setSettingsForm(prev => ({
          ...prev,
          mail_username: smtpConfig.mail_username || '',
          mail_password: smtpConfig.mail_password || '',
          mail_server: smtpConfig.mail_server || 'smtp.gmail.com',
          mail_port: smtpConfig.mail_port || '587'
        }))
      } catch (error) {
      } finally {
        setSettingsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('User not found')
      return
    }

    try {
      setLoading(true)
      
      await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address
      })
      
      await refreshUserData()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setLoading(true)
      
      await changePassword(passwordForm.current_password, passwordForm.new_password)
      
      // Reset form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }


  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      // Validate SMTP configuration
      if (!settingsForm.mail_username || !settingsForm.mail_password) {
        toast.error('Please provide both SMTP username (email) and password')
        return
      }

      if (!settingsForm.mail_server || !settingsForm.mail_port) {
        toast.error('Please provide both SMTP server and port')
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(settingsForm.mail_username)) {
        toast.error('Please provide a valid email address for SMTP username')
        return
      }

      // Validate port number
      const port = parseInt(settingsForm.mail_port)
      if (isNaN(port) || port < 1 || port > 65535) {
        toast.error('Please provide a valid SMTP port number (1-65535)')
        return
      }
      
      // Update SMTP configuration
      await api.updateSmtpConfig({
        mail_username: settingsForm.mail_username,
        mail_password: settingsForm.mail_password,
        mail_server: settingsForm.mail_server,
        mail_port: settingsForm.mail_port
      })
      
      toast.success('SMTP configuration updated successfully! You can now send booking confirmation emails.')
    } catch (error: any) {
      console.error('Failed to update SMTP settings:', error)
      toast.error(error.message || 'Failed to update SMTP settings. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true)
      
      // Validate SMTP configuration first
      if (!settingsForm.mail_username || !settingsForm.mail_password) {
        toast.error('Please configure SMTP settings before testing')
        return
      }

      // Validate test email recipient
      if (!testEmailRecipient) {
        toast.error('Please enter a test email recipient')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(testEmailRecipient)) {
        toast.error('Please enter a valid email address')
        return
      }

      toast.loading('Sending test email...', { id: 'test-smtp' })
      
      // Send test email using the email service
      const response = await fetch('/.netlify/functions/send-booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          to: testEmailRecipient,
          smtpConfig: {
            mail_username: settingsForm.mail_username,
            mail_password: settingsForm.mail_password,
            mail_server: settingsForm.mail_server,
            mail_port: settingsForm.mail_port
          }
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast.success(`Test email sent successfully to ${testEmailRecipient}! Check the inbox.`, { 
          id: 'test-smtp',
          duration: 5000 
        })
      } else {
        throw new Error(result.error || 'Failed to send test email')
      }
    } catch (error: any) {
      console.error('SMTP test failed:', error)
      toast.error(`SMTP test failed: ${error.message || 'Unknown error'}. Please check your configuration.`, { 
        id: 'test-smtp',
        duration: 5000 
      })
    } finally {
      setTestingSmtp(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="h-5 w-5 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <KeyIcon className="h-5 w-5 inline mr-2" />
                Password
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <p className="mt-1 text-sm text-gray-500">Changing email may require verification</p>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>

                {/* Account Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Account Type:</span>
                      <span className="ml-2 text-gray-600">{user?.is_admin ? 'Administrator' : 'User'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Member Since:</span>
                      <span className="ml-2 text-gray-600">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Password Management</h2>
                
                {/* Change Password Form */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current_password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new_password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">Password must be at least 8 characters long</p>
                    </div>
                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Forgot Password Option */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Forgot Password?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you've forgotten your current password, you can reset it using the forgot password feature.
                  </p>
                  <button
                    onClick={() => window.location.href = '/forgot-password'}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset Password via Email
                  </button>
                </div>

              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">SMTP Settings</h2>
                    <p className="text-gray-600 text-sm mt-1">Configure email service</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testingSmtp || !settingsForm.mail_username || !settingsForm.mail_password}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {testingSmtp ? 'Testing...' : 'Test Email'}
                  </button>
                </div>
                
                {settingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSettingsUpdate} className="space-y-6">
                    {/* Email Configuration Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                          <p className="text-sm text-gray-600">Google Workspace SMTP</p>
                        </div>
                        {settingsForm.mail_username && settingsForm.mail_password ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm font-medium">SMTP Configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm font-medium">Not Configured</span>
                          </div>
                        )}
                      </div>

                      {settingsForm.mail_username && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Provider:</span> Google Workspace SMTP
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="from_email" className="block text-sm font-medium text-gray-700 mb-2">
                            From Email
                          </label>
                          <input
                            type="email"
                            id="from_email"
                            value={settingsForm.mail_username}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label htmlFor="test_email_recipient" className="block text-sm font-medium text-gray-700 mb-2">
                            Test Email Recipient
                          </label>
                          <input
                            type="email"
                            id="test_email_recipient"
                            value={testEmailRecipient}
                            onChange={(e) => setTestEmailRecipient(e.target.value)}
                            placeholder="Enter email to receive test"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SMTP Configuration Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP Configuration</h3>
                      
                      {/* Help Box */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-2">📧 How to Set Up Gmail SMTP:</h4>
                        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                          <li>Go to your <strong>Google Account → Security</strong></li>
                          <li>Enable <strong>2-Step Verification</strong> (required)</li>
                          <li>Go to <strong>Security → App passwords</strong></li>
                          <li>Generate a new app password for "Mail"</li>
                          <li>Copy the <strong>16-character password</strong> (no spaces)</li>
                          <li>Use your Gmail address as <strong>SMTP Username</strong></li>
                          <li>Use the app password as <strong>SMTP Password</strong></li>
                        </ol>
                        <p className="text-xs text-blue-700 mt-2">
                          ⚠️ <strong>Important:</strong> Use the App Password, NOT your regular Gmail password!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="mail_username" className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Username (Your Email) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="mail_username"
                            value={settingsForm.mail_username}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mail_username: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="your-email@gmail.com"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="mail_password" className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Password (App Password) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            id="mail_password"
                            value={settingsForm.mail_password}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mail_password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="16-character app password"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="mail_server" className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Server
                          </label>
                          <input
                            type="text"
                            id="mail_server"
                            value={settingsForm.mail_server}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mail_server: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        <div>
                          <label htmlFor="mail_port" className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Port
                          </label>
                          <input
                            type="text"
                            id="mail_port"
                            value={settingsForm.mail_port}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mail_port: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile 
