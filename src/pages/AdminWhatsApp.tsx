import {
    ChatBubbleLeftRightIcon,
    ClockIcon,
    PaperAirplaneIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { WhatsAppMessage, WhatsAppSession } from '../lib/supabase'
import { api } from '../lib/supabase'

const AdminWhatsApp: React.FC = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([])
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id)
    }
  }, [selectedSession])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await api.getWhatsAppSessions()
      setSessions(data)
    } catch (error) {
      toast.error('Failed to load WhatsApp sessions')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (sessionId: number) => {
    try {
      const data = await api.getWhatsAppMessages(sessionId)
      setMessages(data)
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession || !newMessage.trim()) return

    try {
      setSending(true)
      await api.createWhatsAppMessage({
        session_id: selectedSession.id,
        message_text: newMessage.trim(),
        sender_type: 'admin',
        is_read: true
      })
      
      // Update session's last message time
      await api.updateWhatsAppSession(selectedSession.id, {
        last_message_at: new Date().toISOString()
      })

      setNewMessage('')
      loadMessages(selectedSession.id)
      loadSessions() // Refresh sessions to update last message time
      toast.success('Message sent successfully')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Chat Management</h1>
        <p className="mt-2 text-gray-600">Manage guest conversations and support</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Sessions</h3>
          <p className="text-3xl font-bold text-blue-600">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <p className="text-3xl font-bold text-green-600">{sessions.filter(s => s.session_status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Messages</h3>
          <p className="text-3xl font-bold text-purple-600">{messages.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Unread Messages</h3>
          <p className="text-3xl font-bold text-orange-600">{messages.filter(m => !m.is_read && m.sender_type === 'guest').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Chat Sessions
              </h2>
              <p className="text-gray-600 text-sm mt-1">{sessions.length} conversations</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {sessions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedSession?.id === session.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.guest_name || 'Unknown Guest'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {session.guest_phone}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.session_status)}`}>
                              {session.session_status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(session.last_message_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No chat sessions</h3>
                  <p className="text-gray-500">No WhatsApp conversations yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow h-96 flex flex-col">
            {selectedSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedSession.guest_name || 'Unknown Guest'}
                        </h3>
                        <p className="text-sm text-gray-500">{selectedSession.guest_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(selectedSession.session_status)}`}>
                        {selectedSession.session_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_type === 'admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message_text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a chat session from the list to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => loadSessions()}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Refresh Sessions
            </button>
            <button
              onClick={() => {
                if (selectedSession) {
                  loadMessages(selectedSession.id)
                }
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Refresh Messages
            </button>
            <button
              onClick={() => {
                setSelectedSession(null)
                setMessages([])
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminWhatsApp 
