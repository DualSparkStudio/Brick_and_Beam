import { createClient } from '@supabase/supabase-js'

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


    // Check environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Missing environment variables',
          debug: { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey }
        })
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Handle different actions
    switch (action) {
      case 'updateProfile':
        return await handleUpdateProfile(data, headers, supabase)
      
      case 'changePassword':
        return await handleChangePassword(data, headers, supabase)
      
      case 'login':
        return await handleLogin(data, headers, supabase)
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` })
        }
    }

  } catch (error) {
    // Sanitize error messages to prevent information leakage
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Admin auth failed'
      })
    }
  }
}

async function handleUpdateProfile(data, headers, supabase) {
  try {
    const { userData } = data

    // Update admin user
    const { data: updatedAdmin, error } = await supabase
      .from('admin')
      .update({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)
      .select()
      .single()

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update profile' })
      }
    }

    
    const { password_hash, ...adminData } = updatedAdmin
    const userData = {
      ...adminData,
      is_admin: true
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userData,
        message: 'Profile updated successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Profile update failed' })
    }
  }
}

async function handleChangePassword(data, headers, supabase) {
  try {
    const { userData } = data
    const { current_password, new_password } = userData
    

    // Get current admin user
    const { data: admin, error: fetchError } = await supabase
      .from('admin')
      .select('*')
      .eq('id', userData.id)
      .single()

    if (fetchError || !admin) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    // Verify current password
    const bcrypt = await import('bcryptjs')
    const isValidPassword = await bcrypt.compare(current_password, admin.password_hash)
    
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Current password is incorrect' })
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10)

    // Update password
    const { error: updateError } = await supabase
      .from('admin')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)

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

async function handleLogin(data, headers, supabase) {
  try {
    const { email, password } = data

    // Get admin user
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

    if (!admin.password_hash) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      }
    }

    // Verify password
    const bcrypt = await import('bcryptjs')
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      }
    }

    
    const { password_hash, ...adminData } = admin
    const userData = {
      ...adminData,
      is_admin: true
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