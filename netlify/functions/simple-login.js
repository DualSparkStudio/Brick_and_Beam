const { createClient } = require('@supabase/supabase-js')

// Helper function to verify admin authentication
async function verifyAdmin(data, supabase) {
  try {
    const { userId, email } = data
    
    if (!userId && !email) {
      return { isValid: false, error: 'Authentication required' }
    }

    // Check admin table first
    if (email) {
      const { data: admin } = await supabase
        .from('admin')
        .select('id, email, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single()
      
      if (admin) {
        return { isValid: true, admin }
      }
    }

    // Check users table for admin
    const query = supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('is_admin', true)
    
    if (userId) {
      query.eq('id', userId)
    } else if (email) {
      query.eq('email', email)
    }
    
    const { data: user } = await query.single()
    
    if (user && user.is_admin) {
      return { isValid: true, admin: user }
    }

    return { isValid: false, error: 'Admin access required' }
  } catch (error) {
    return { isValid: false, error: 'Authentication verification failed' }
  }
}

// Input validation helpers
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim()) && email.length <= 255
}

function validateString(str, maxLength = 1000) {
  return str && typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength
}

function validateNumber(num, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(num)
  return !isNaN(n) && n >= min && n <= max
}

function sanitizeString(str) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().replace(/[<>]/g, '')
}

// Get allowed origin from environment or default to wildcard (less secure but functional)
const getAllowedOrigin = () => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'
  return allowedOrigin
}

exports.handler = async (event, context) => {
  const allowedOrigin = getAllowedOrigin()
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Credentials': allowedOrigin !== '*' ? 'true' : 'false'
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


    // Check environment variables - try both naming conventions
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
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
      case 'login':
        return await handleLogin(data, headers, supabase)
      
      case 'register':
        return await handleRegister(data, headers, supabase)
      
      case 'updateProfile':
        return await handleUpdateProfile(data, headers, supabase)
      
      case 'changePassword':
        return await handleChangePassword(data, headers, supabase)
      
      case 'getUser':
        return await handleGetUser(data, headers, supabase)
      
      case 'createRoom':
        return await handleCreateRoom(data, headers, supabase)
      
      case 'getAllRooms':
        return await handleGetAllRooms(data, headers, supabase)
      
      case 'updateRoom':
        return await handleUpdateRoom(data, headers, supabase)
      
      case 'deleteRoom':
        return await handleDeleteRoom(data, headers, supabase)
      
      case 'submitContactForm':
        return await handleSubmitContactForm(data, headers, supabase)
      
      case 'getAdminEmail':
        return await handleGetAdminEmail(data, headers, supabase)
      
      case 'updateAdminEmail':
        return await handleUpdateAdminEmail(data, headers, supabase)
      
      case 'getAdminContactInfo':
        return await handleGetAdminContactInfo(data, headers, supabase)
      
      case 'checkEmail':
        return await handleCheckEmail(data, headers, supabase)
      
      case 'resetPassword':
        return await handleResetPassword(data, headers, supabase)
      
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
        error: 'An error occurred. Please try again later.'
      })
    }
  }
}

async function handleLogin(data, headers, supabase) {
  try {
    const { email, password } = data

    // Input validation
    if (!validateEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      }
    }

    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid password format' })
      }
    }

    // First, try to find user in admin table (preferred method)
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (admin && !adminError) {
      // Verify password
      const bcrypt = require('bcryptjs')
      const isValidPassword = await bcrypt.compare(password, admin.password_hash)
      
      if (isValidPassword) {
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
      }
    }

    // If not found in admin table, check users table but ONLY allow if is_admin is true
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_admin', true) // ONLY allow admin users
      .single()

    // If user exists, is admin, and password matches, allow login
    if (user && user.password_hash && user.is_admin) {
      const bcrypt = require('bcryptjs')
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      
      if (isValidPassword) {
        const { password_hash, ...userData } = user
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: userData,
            message: 'Login successful'
          })
        }
      }
    }

    // If email doesn't exist, password doesn't match, or user is not admin, deny access
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid admin credentials. Only administrators can access this panel.' })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' })
    }
  }
}

async function handleRegister(data, headers, supabase) {
  try {
    const { userData } = data
    const { email, password, first_name, last_name } = userData

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User already exists with this email' })
      }
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate username from email
    const username = email.split('@')[0]

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        username,
        password_hash: passwordHash,
        first_name,
        last_name,
        is_admin: false // Default to regular user
      }])
      .select()
      .single()

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create account' })
      }
    }

    
    const { password_hash, ...userDataClean } = newUser

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userDataClean,
        message: 'Account created successfully'
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

async function handleCreateRoom(data, headers, supabase) {
  try {
    // Verify admin authentication
    const authCheck = await verifyAdmin(data, supabase)
    if (!authCheck.isValid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      }
    }

    const { roomData } = data

    // Input validation
    if (!roomData || typeof roomData !== 'object') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid room data' })
      }
    }

    // Validate required fields
    if (!validateString(roomData.name, 200)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Room name is required and must be valid' })
      }
    }

    // Try to create room with images field first
    let { data: newRoom, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select()
      .single()

    // If images column doesn't exist, try without images
    if (error && error.message && error.message.includes('images')) {
      const { images, ...roomDataWithoutImages } = roomData
      const { data: newRoomWithoutImages, error: errorWithoutImages } = await supabase
        .from('rooms')
        .insert([roomDataWithoutImages])
        .select()
        .single()
      
      if (errorWithoutImages) {
        throw errorWithoutImages
      }
      
      newRoom = newRoomWithoutImages
      error = null
    }

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create room' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        room: newRoom,
        message: 'Room created successfully'
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Room creation failed' })
    }
  }
}

async function handleGetAllRooms(data, headers, supabase) {
  try {

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number')

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to get rooms' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        rooms: rooms || [],
        message: 'Rooms retrieved successfully'
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get rooms' })
    }
  }
}

async function handleUpdateRoom(data, headers, supabase) {
  try {
    // Verify admin authentication
    const authCheck = await verifyAdmin(data, supabase)
    if (!authCheck.isValid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      }
    }

    const { roomId, roomData } = data

    // Input validation
    if (!validateNumber(roomId, 1)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid room ID' })
      }
    }

    if (!roomData || typeof roomData !== 'object') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid room data' })
      }
    }

    // Try to update room with images field first
    let { data: updatedRoom, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', roomId)
      .select()
      .single()

    // If images column doesn't exist, try without images
    if (error && error.message && error.message.includes('images')) {
      const { images, ...roomDataWithoutImages } = roomData
      const { data: updatedRoomWithoutImages, error: errorWithoutImages } = await supabase
        .from('rooms')
        .update(roomDataWithoutImages)
        .eq('id', roomId)
        .select()
        .single()
      
      if (errorWithoutImages) {
        throw errorWithoutImages
      }
      
      updatedRoom = updatedRoomWithoutImages
      error = null
    }

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update room' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        room: updatedRoom,
        message: 'Room updated successfully'
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Room update failed' })
    }
  }
}

async function handleDeleteRoom(data, headers, supabase) {
  try {
    // Verify admin authentication
    const authCheck = await verifyAdmin(data, supabase)
    if (!authCheck.isValid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      }
    }

    const { roomId } = data

    // Input validation
    if (!validateNumber(roomId, 1)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid room ID' })
      }
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to delete room' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Room deleted successfully'
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Room deletion failed' })
    }
  }
}

async function handleUpdateProfile(data, headers, supabase) {
  try {
    const { userData } = data

    // Input validation
    if (!userData || !userData.id) {
      console.error('Invalid user data:', userData)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid user data - ID is required' })
      }
    }

    console.log('Updating profile for user ID:', userData.id)

    // First check if user exists and is admin
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('id', userData.id)
      .single()

    if (fetchError || !existingUser) {
      console.error('User not found:', fetchError)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    if (!existingUser.is_admin) {
      console.error('User is not admin:', existingUser)
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      }
    }

    // Validate email if provided
    if (userData.email && !validateEmail(userData.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      }
    }

    // Sanitize string inputs
    const updateData = {}
    if (userData.first_name) updateData.first_name = sanitizeString(userData.first_name)
    if (userData.last_name) updateData.last_name = sanitizeString(userData.last_name)
    if (userData.email) updateData.email = userData.email.trim()
    if (userData.phone) updateData.phone = sanitizeString(userData.phone)
    if (userData.address) updateData.address = sanitizeString(userData.address)

    console.log('Update data:', updateData)

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userData.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update profile: ' + error.message })
      }
    }

    console.log('Profile updated successfully')
    const { password_hash, ...userDataClean } = updatedUser

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userDataClean,
        message: 'Profile updated successfully'
      })
    }
  } catch (error) {
    console.error('Profile update exception:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Profile update failed: ' + error.message })
    }
  }
}

async function handleChangePassword(data, headers, supabase) {
  try {
    const { userData } = data

    // Input validation
    if (!userData || !userData.id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid user data' })
      }
    }

    const { current_password, new_password } = userData

    // Validate password requirements
    if (!current_password || typeof current_password !== 'string' || current_password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Current password is required' })
      }
    }

    if (!new_password || typeof new_password !== 'string' || new_password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'New password must be at least 8 characters long' })
      }
    }

    if (new_password.length > 128) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'New password is too long' })
      }
    }

    // Verify admin authentication
    const authCheck = await verifyAdmin({ userId: userData.id }, supabase)
    if (!authCheck.isValid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      }
    }

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .single()

    if (fetchError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    // Verify current password
    const bcrypt = require('bcryptjs')
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash)
    
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
      .from('users')
      .update({
        password_hash: newPasswordHash
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

async function handleGetUser(data, headers, supabase) {
  try {
    const { id } = data

    // Get user by ID
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    
    const { password_hash, ...userData } = user

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userData,
        message: 'User data retrieved successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get user data' })
    }
  }
}

async function handleCheckEmail(data, headers, supabase) {
  try {
    const { email } = data

    // Check if user exists with this email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to check email' })
      }
    }

    const exists = !!user


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        exists,
        message: exists ? 'Email found' : 'Email not found'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to check email' })
    }
  }
}

async function handleResetPassword(data, headers, supabase) {
  try {
    const { email, new_password } = data

    // Validate password
    if (!new_password || new_password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters long' })
      }
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    // Hash the new password
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(new_password, 10)

    // Update the password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email)

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

async function handleSubmitContactForm(data, headers, supabase) {
  try {
    const { contactData } = data

    // Input validation
    if (!contactData || typeof contactData !== 'object') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid contact form data' })
      }
    }

    // Validate required fields
    if (!validateString(contactData.name, 200)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name is required and must be valid' })
      }
    }

    if (!validateEmail(contactData.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid email is required' })
      }
    }

    if (!validateString(contactData.subject, 200)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Subject is required and must be valid' })
      }
    }

    if (!validateString(contactData.message, 5000)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required and must be valid' })
      }
    }

    // Sanitize inputs to prevent XSS
    const sanitizedContactData = {
      name: sanitizeString(contactData.name),
      email: contactData.email.trim().toLowerCase(),
      phone: contactData.phone ? sanitizeString(contactData.phone) : '',
      subject: sanitizeString(contactData.subject),
      message: sanitizeString(contactData.message)
    }

    // Get admin email from database
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('email, phone, first_name, last_name')
      .eq('is_admin', true)
      .single()

    if (adminError || !adminUser) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to get admin contact information' })
      }
    }

    // Send email to admin using nodemailer
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    })

    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission - Resort Booking System</h2>
        <p>A new contact form has been submitted:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Contact Details</h3>
          <p><strong>Name:</strong> ${sanitizedContactData.name}</p>
          <p><strong>Email:</strong> ${sanitizedContactData.email}</p>
          <p><strong>Phone:</strong> ${sanitizedContactData.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${sanitizedContactData.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${sanitizedContactData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p>Please respond to this inquiry as soon as possible.</p>
        
        <p>Best regards,<br>Resort Booking System Website</p>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
      to: adminUser.email,
      subject: `New Contact Form: ${sanitizedContactData.subject} - Resort Booking System`,
      html: adminEmailContent,
    }

    const result = await transporter.sendMail(mailOptions)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        messageId: result.messageId
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit contact form' })
    }
  }
}

async function handleGetAdminEmail(data, headers, supabase) {
  try {

    // Get admin email from database
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('email')
      .eq('is_admin', true)
      .single()

    if (error || !adminUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Admin email not found' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        adminEmail: adminUser.email,
        message: 'Admin email retrieved successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get admin email' })
    }
  }
}

async function handleUpdateAdminEmail(data, headers, supabase) {
  try {
    // Verify admin authentication
    const authCheck = await verifyAdmin(data, supabase)
    if (!authCheck.isValid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      }
    }

    const { email } = data

    // Input validation
    if (!validateEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      }
    }

    // Update admin email in database
    const { error } = await supabase
      .from('users')
      .update({ email: email.trim() })
      .eq('is_admin', true)

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update admin email' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Admin email updated successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update admin email' })
    }
  }
}

async function handleGetAdminContactInfo(data, headers, supabase) {
  try {

    // Get admin contact info from database
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('email, phone, first_name, last_name')
      .eq('is_admin', true)
      .single()

    if (error || !adminUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Admin contact info not found' })
      }
    }


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        contactInfo: {
          email: adminUser.email,
          phone: adminUser.phone,
          name: `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim()
        },
        message: 'Admin contact info retrieved successfully'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get admin contact info' })
    }
  }
} 