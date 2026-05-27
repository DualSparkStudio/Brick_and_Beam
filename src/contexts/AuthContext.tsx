import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { User } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setUser: (user: User | null) => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing session in localStorage
    const session = localStorage.getItem('resort_session')
    if (session) {
      try {
        const userData = JSON.parse(session)
        // Only set user if they are an admin (security check)
        if (userData && userData.is_admin === true) {
          setUser(userData)
        } else {
          // Clear invalid session (non-admin user)
          localStorage.removeItem('resort_session')
          setUser(null)
        }
      } catch (error) {
        localStorage.removeItem('resort_session')
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const callAuthAPI = async (action: string, data: any) => {
    try {
      // Use simple-login for all operations - FORCE REBUILD
      const functionName = 'simple-login'
      
      
      const response = await fetch(`/.netlify/functions/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'API call failed')
      }

      return result
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const [firstName, ...lastNameParts] = fullName.split(' ')
      const lastName = lastNameParts.join(' ') || ''
      
      const result = await callAuthAPI('register', {
        userData: {
          email,
          password,
          first_name: firstName,
          last_name: lastName
        }
      })

      setUser(result.user)
      localStorage.setItem('resort_session', JSON.stringify(result.user))
      toast.success('Account created successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Error creating account')
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await callAuthAPI('login', { email, password })
      
      // Security check: Only allow admin users to sign in
      if (!result.user || result.user.is_admin !== true) {
        localStorage.removeItem('resort_session')
        throw new Error('Access denied. Only administrators can access this panel.')
      }
      
      setUser(result.user)
      localStorage.setItem('resort_session', JSON.stringify(result.user))
      toast.success('Signed in successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Error signing in')
      throw error
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      localStorage.removeItem('resort_session')
      toast.success('Signed out successfully!')
      // Redirect to login page
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || 'Error signing out')
      throw error
    }
  }

  const updateUser = async () => {
    // Refresh user data from localStorage
    const session = localStorage.getItem('resort_session')
    if (session) {
      try {
        const userData = JSON.parse(session)
        setUser(userData)
      } catch (error) {
      }
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const result = await callAuthAPI('updateProfile', {
        userData: {
          id: user.id,
          ...updates
        }
      })

      const updatedUser = result.user
      setUser(updatedUser)
      localStorage.setItem('resort_session', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile')
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return

    try {
      await callAuthAPI('changePassword', {
        userData: {
          id: user.id,
          current_password: currentPassword,
          new_password: newPassword
        }
      })

      toast.success('Password changed successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Error changing password')
      throw error
    }
  }


  const refreshUserData = async () => {
    if (!user) return

    try {
      const result = await callAuthAPI('getUser', { id: user.id })
      const updatedUser = result.user
      setUser(updatedUser)
      localStorage.setItem('resort_session', JSON.stringify(updatedUser))
    } catch (error: any) {
      toast.error(error.message || 'Error refreshing user data')
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUser,
    updateProfile,
    changePassword,
    setUser,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 
