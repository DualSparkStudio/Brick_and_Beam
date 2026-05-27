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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

    switch (action) {
      case 'login':
        return await handleLogin(data.email, data.password, headers, supabase, supabaseAdmin)
      
      case 'updateProfile':
        return await handleUpdateProfile(data.userData, headers, supabase, supabaseAdmin)
      
      case 'changePassword':
        return await handleChangePassword(data.userData, headers, supabase, supabaseAdmin)
      
      case 'forgotPassword':
        return await handleForgotPassword(data.email, headers, supabase, supabaseAdmin)
      
      case 'migrateToAdmin':
        return await handleMigrateToAdmin(data.email, headers, supabase, supabaseAdmin)
      
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

async function handleLogin(email, password, headers, supabase, supabaseAdmin) {
  try {

    // First, try the new admin table
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (admin && !adminError) {
      
      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, admin.password_hash)
      
      if (isValidPassword) {
        
        // Remove password_hash from response
        const { password_hash, ...adminData } = admin
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: adminData,
            message: 'Login successful (new system)',
            authType: 'admin_table'
          })
        }
      }
    }

    // If not found in admin table or password wrong, try old Supabase auth
    if (supabaseAdmin) {
      
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
          email: email,
          password: password
        })

        if (authError) {
        } else if (authData.user) {
          // Get user profile from users table
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

          if (profileError) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ error: 'Invalid email or password' })
            }
          }

          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: userProfile,
              message: 'Login successful (legacy system)',
              authType: 'supabase_auth'
            })
          }
        }
      } catch (supabaseError) {
      }
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid email or password' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' })
    }
  }
}

async function handleUpdateProfile(userData, headers, supabase, supabaseAdmin) {
  try {
    
    const { id, first_name, last_name, email, phone } = userData

    // Check if this is an admin table user
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('id', id)
      .single()

    if (admin && !adminError) {
      
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
          message: 'Profile updated successfully (admin table)'
        })
      }
    } else {
      // This is a legacy user, update both users table and Supabase auth
      
      // Update users table
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

      // Try to update Supabase auth if service key is available
      if (supabaseAdmin) {
        try {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            email: email,
            user_metadata: {
              first_name: first_name,
              last_name: last_name,
              phone: phone
            }
          })

          if (authError) {
            // Don't fail the request, but log the error
          } else {
          }
        } catch (authSyncError) {
        }
      }


      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: updatedUser,
          message: 'Profile updated successfully (legacy system)'
        })
      }
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

async function handleChangePassword(userData, headers, supabase, supabaseAdmin) {
  try {
    
    const { id, current_password, new_password } = userData

    // Check if this is an admin table user
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('id', id)
      .single()

    if (admin && !adminError) {
      
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
          message: 'Password changed successfully (admin table)'
        })
      }
    } else {
      // This is a legacy user
      
      if (!supabaseAdmin) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Password change not available for legacy users' })
        }
      }

      // Get current user from auth to verify current password
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(id)
      
      if (authError || !authUser.user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' })
        }
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
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
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
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
          message: 'Password changed successfully (legacy system)'
        })
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Password change failed' })
    }
  }
}

async function handleForgotPassword(email, headers, supabase, supabaseAdmin) {
  try {

    // Check if admin exists in new table
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('id, email')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (admin && !adminError) {
      
      // Generate a simple reset token
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


      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent! Check your inbox.',
          resetToken: resetToken // Remove this in production
        })
      }
    } else {
      // Try legacy system
      
      if (!supabaseAdmin) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Password reset not available for legacy users' })
        }
      }

      // Check if user exists in auth
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to process password reset' })
        }
      }

      const user = users.users.find(u => u.email === email)
      
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'No account found with this email' })
        }
      }

      // Generate password reset link
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email
      })

      if (resetError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to process password reset' })
        }
      }


      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent! Check your inbox.',
          resetLink: resetData.properties.action_link // Remove this in production
        })
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process password reset' })
    }
  }
}

async function handleMigrateToAdmin(email, headers, supabase, supabaseAdmin) {
  try {

    // Find existing user
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_admin', true)
      .single()

    if (userError || !existingUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No admin user found with this email' })
      }
    }

    // Create new admin entry
    const { data: newAdmin, error: adminError } = await supabase
      .from('admin')
      .insert({
        email: existingUser.email,
        password_hash: '$2a$10$temp_hash_placeholder', // Will be updated
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        phone: existingUser.phone
      })
      .select()
      .single()

    if (adminError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to migrate user' })
      }
    }

    // Update existing data to use new admin_id
    const updates = [
      supabase.from('bookings').update({ admin_id: newAdmin.id }).eq('user_id', existingUser.id),
      supabase.from('reviews').update({ admin_id: newAdmin.id }).eq('user_id', existingUser.id),
      supabase.from('blocked_dates').update({ admin_id: newAdmin.id }).eq('user_id', existingUser.id),
      supabase.from('calendar_syncs').update({ admin_id: newAdmin.id }).eq('user_id', existingUser.id),
      supabase.from('settings').update({ admin_id: newAdmin.id }).eq('user_id', existingUser.id)
    ]

    for (const update of updates) {
      const { error } = await update
      if (error) {
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User migrated to admin table successfully',
        newAdminId: newAdmin.id
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Migration failed' })
    }
  }
}