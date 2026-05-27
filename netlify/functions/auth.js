import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
let supabase
try {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  supabase = createClient(supabaseUrl, supabaseKey)
} catch (error) {
  supabase = null
}

export const handler = async (event, context) => {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
  })

  // Check if Supabase client is initialized
  if (!supabase) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database'
      })
    }
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body)
    
    const { action, email, password, userData } = body

    switch (action) {
      case 'login':
        return await handleLogin(email, password, headers)
      
      case 'register':
        return await handleRegister(userData, headers)
      
      case 'updateProfile':
        return await handleUpdateProfile(userData, headers)
      
      case 'changePassword':
        return await handleChangePassword(userData, headers)
      
      case 'forgotPassword':
        return await handleForgotPassword(email, headers)
      
      case 'resetPassword':
        return await handleResetPassword(userData.token, userData.newPassword, headers)
      
      case 'getUser':
        return await handleGetUser(email, headers)
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        }
    }
  } catch (error) {
    // Sanitize error messages to prevent information leakage
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error'
      })
    }
  }
}

async function handleLogin(email, password, headers) {
  try {
    
    // Use Supabase's built-in authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (authError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      }
    }

    if (!authData.user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      }
    }

    // Get additional user data from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError) {
      // Still allow login if auth succeeded but profile fetch failed
    }

    // Combine auth data with profile data
    const userData = {
      id: authData.user.id,
      email: authData.user.email,
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      phone: userProfile?.phone || '',
      is_admin: userProfile?.is_admin || false,
      created_at: authData.user.created_at,
      updated_at: userProfile?.updated_at || authData.user.updated_at
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userData,
        message: 'Login successful'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' })
    }
  }
}

async function handleRegister(userData, headers) {
  try {
    
    const { email, password, first_name, last_name, phone } = userData

    // Use Supabase's built-in authentication to create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (authError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: authError.message })
      }
    }

    if (!authData.user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Registration failed' })
      }
    }

    // Create user profile in our users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: first_name || '',
        last_name: last_name || '',
        phone: phone || '',
        is_admin: false, // Default to regular user
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      // Try to clean up the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create user profile' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: profileData,
        message: 'Registration successful'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Registration failed' })
    }
  }
}

async function handleUpdateProfile(userData, headers) {
  try {
    
    const { id, first_name, last_name, email, phone } = userData

    // Validate required fields
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID is required' })
      }
    }

    // First, get the current user from auth to check if email is changing
    const { data: currentAuthUser, error: getUserError } = await supabase.auth.admin.getUserById(id)
    
    if (getUserError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to get current user data' })
      }
    }

    const isEmailChanging = currentAuthUser.user.email !== email

    // Update user profile in our users table
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        email,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Profile update failed',
          details: error.message
        })
      }
    }

    // Sync changes to Supabase authentication
    try {
      
      const updateData = {
        user_metadata: {
          first_name: first_name,
          last_name: last_name,
          phone: phone
        }
      }

      // Only update email if it's actually changing
      if (isEmailChanging) {
        updateData.email = email
      }

      const { data: authUpdateData, error: authError } = await supabase.auth.admin.updateUserById(id, updateData)

      if (authError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Profile updated in database but failed to sync with authentication. Please try logging in with your old email.',
            details: authError.message
          })
        }
      } else {
        if (isEmailChanging) {
        }
      }
    } catch (authSyncError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Profile updated in database but failed to sync with authentication. Please try logging in with your old email.',
          details: authSyncError.message
        })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: updatedUser,
        message: isEmailChanging ? 
          'Profile updated successfully. You can now login with your new email.' : 
          'Profile updated successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Profile update failed',
        message: error.message,
        stack: error.stack
      })
    }
  }
}

async function handleChangePassword(userData, headers) {
  try {
    
    const { id, current_password, new_password } = userData

    // Get current user from auth to verify current password
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id)
    
    if (authError || !authUser.user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.user.email,
      password: current_password
    })

    if (signInError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Current password is incorrect' })
      }
    }

    // Update password in Supabase auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
      password: new_password
    })

    if (updateError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Password change failed' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password changed successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Password change failed' })
    }
  }
}

async function handleGetUser(email, headers) {
  try {
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get user' })
    }
  }
}

async function handleForgotPassword(email, headers) {
  try {
    
    // Check if user exists in auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to process password reset request' })
      }
    }

    const authUser = authUsers.users.find(user => user.email === email)
    
    if (!authUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found with this email address' })
      }
    }

    // Generate password reset link using Supabase auth
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email
    })

    if (resetError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to process password reset request' })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password reset email sent successfully',
        resetLink: resetData.properties.action_link // This would be sent via email in production
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process password reset request' })
    }
  }
}

async function handleResetPassword(token, newPassword, headers) {
  try {
    
    // Verify and update password using the token
    const { data: resetData, error: resetError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    })

    if (resetError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired reset token' })
      }
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(resetData.user.id, {
      password: newPassword
    })

    if (updateError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update password' })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password reset successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to reset password' })
    }
  }
}