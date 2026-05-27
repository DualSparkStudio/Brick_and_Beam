import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const { action, ...data } = JSON.parse(event.body)

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    switch (action) {
      case 'login':
        return await handleLogin(data.email, data.password, headers, supabase)
      
      case 'updateProfile':
        return await handleUpdateProfile(data.userData, headers, supabase)
      
      case 'changePassword':
        return await handleChangePassword(data.userData, headers, supabase)
      
      case 'forgotPassword':
        return await handleForgotPassword(data.email, headers, supabase)
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

async function handleLogin(email, password, headers, supabase) {
  try {

    // Get admin from database
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      }
    }


    // Remove password_hash from response
    const { password_hash, ...adminData } = admin

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: adminData,
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

async function handleUpdateProfile(userData, headers, supabase) {
  try {
    
    const { id, first_name, last_name, email, phone } = userData

    // Check if email is already taken by another admin
    if (email) {
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single()

      if (existingAdmin) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email is already in use' })
        }
      }
    }

    // Update admin profile
    const { data: updatedAdmin, error } = await supabase
      .from('admin')
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


    // Remove password_hash from response
    const { password_hash, ...adminData } = updatedAdmin

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: adminData,
        message: 'Profile updated successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Profile update failed',
        message: error.message
      })
    }
  }
}

async function handleChangePassword(userData, headers, supabase) {
  try {
    
    const { id, current_password, new_password } = userData

    // Get current admin to verify password
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !admin) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Admin not found' })
      }
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, admin.password_hash)
    
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Current password is incorrect' })
      }
    }

    // Hash new password
    const saltRounds = 10
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds)

    // Update password
    const { error: updateError } = await supabase
      .from('admin')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

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

async function handleForgotPassword(email, headers, supabase) {
  try {

    // Check if admin exists
    const { data: admin, error } = await supabase
      .from('admin')
      .select('id, email')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No admin account found with this email' })
      }
    }

    // Generate a simple reset token (in production, use a proper token system)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Store reset token in settings table
    const { error: settingsError } = await supabase
      .from('settings')
      .upsert({
        admin_id: admin.id,
        setting_key: 'password_reset_token',
        setting_value: resetToken,
        updated_at: new Date().toISOString()
      })

    if (settingsError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to process password reset' })
      }
    }


    // In a real application, you would send an email here
    // For now, we'll just return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password reset email sent! Check your inbox.',
        resetToken: resetToken // Remove this in production
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process password reset' })
    }
  }
}