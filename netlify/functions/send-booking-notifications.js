import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // Add detailed logging
  
  try {
    const requestData = JSON.parse(event.body)
    
    const { booking, room, adminEmail, paymentDetails } = requestData

    // Validate required data
    if (!booking || !room) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Missing required booking data',
        }),
      }
    }

    // Log payment details

    // Get admin email from database if not provided
    let finalAdminEmail = adminEmail
    if (!adminEmail) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        
        // Get the first admin user's email
        const { data: adminUser, error } = await supabase
          .from('admin')
          .select('email')
          .limit(1)
          .single()
        
        if (!error && adminUser?.email) {
          finalAdminEmail = adminUser.email
        } else {
        }
      } catch (error) {
      }
    }

    // Log environment variables (without sensitive data)

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    })

    // Calculate nights
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

    // Format dates
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Customer Email Template
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - Resort Booking System</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; background: #f8fafc; }
          .greeting { font-size: 18px; margin-bottom: 25px; color: #1f2937; }
          .booking-details { background: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .booking-details h3 { margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; }
          .detail-row { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #6b7280; font-size: 14px; }
          .detail-value { color: #111827; font-weight: 500; font-size: 14px; }
          .status-confirmed { background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .status-paid { background: #dbeafe; color: #1e40af; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .important-info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .important-info h4 { margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600; }
          .important-info ul { margin: 0; padding-left: 20px; }
          .important-info li { margin: 8px 0; color: #92400e; }
          .contact-info { background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 25px 0; }
          .contact-info h4 { margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600; }
          .contact-info p { margin: 8px 0; color: #374151; }
          .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .payment-info { background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6; }
          .payment-info h4 { margin: 0 0 15px 0; color: #1e40af; font-size: 16px; font-weight: 600; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; height: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Resort Booking System</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <h2>Dear ${booking.first_name} ${booking.last_name},</h2>
              <p>Your booking has been successfully confirmed and payment received! We're excited to welcome you to Resort Booking System for an unforgettable experience.</p>
            </div>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-confirmed">${booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="status-paid">${booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-in Date:</span>
                <span class="detail-value">${formatDate(booking.check_in_date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-out Date:</span>
                <span class="detail-value">${formatDate(booking.check_out_date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Nights:</span>
                <span class="detail-value">${nights} night${nights > 1 ? 's' : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Guests:</span>
                <span class="detail-value">${booking.num_guests} guest${booking.num_guests > 1 ? 's' : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₹${booking.total_amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="booking-details">
              <h3>🏠 Room Details</h3>
              <div class="detail-row">
                <span class="detail-label">Room Name:</span>
                <span class="detail-value">${room.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Room Number:</span>
                <span class="detail-value">${room.room_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Price per Night:</span>
                <span class="detail-value">₹${room.price_per_night.toLocaleString()}</span>
              </div>
            </div>
            
            ${paymentDetails ? `
            <div class="payment-info">
              <h4>💳 Payment Receipt</h4>
              <div class="detail-row">
                <span class="detail-label">Payment Gateway:</span>
                <span class="detail-value">${paymentDetails.gateway.charAt(0).toUpperCase() + paymentDetails.gateway.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="status-paid">${paymentDetails.status.charAt(0).toUpperCase() + paymentDetails.status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">₹${paymentDetails.amount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Currency:</span>
                <span class="detail-value">${paymentDetails.currency}</span>
              </div>
              ${paymentDetails.paymentId ? `
              <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">${paymentDetails.paymentId}</span>
              </div>
              ` : ''}
              ${paymentDetails.orderId ? `
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${paymentDetails.orderId}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date(paymentDetails.timestamp).toLocaleString('en-IN')}</span>
              </div>
            </div>
            ` : ''}
            
            ${booking.special_requests ? `
            <div class="booking-details">
              <h3>📝 Special Requests</h3>
              <p style="margin: 0; color: #374151; line-height: 1.6;">${booking.special_requests}</p>
            </div>
            ` : ''}
            
            <div class="important-info">
              <h4>⚠️ Important Information</h4>
              <ul>
                <li><strong>Check-in Time:</strong> ${booking.check_in_time || '1:00 PM'} onwards (flexible depending on other bookings)</li>
                <li><strong>Check-out Time:</strong> ${booking.check_out_time || '10:00 AM'} (flexible depending on other bookings)</li>
                <li>Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.</li>
                <li>Please bring a valid government-issued ID for check-in</li>
                <li>Please inform us at least 24 hours in advance for any changes</li>
                <li>Free cancellation up to 24 hours before check-in</li>
              </ul>
            </div>
            
            <div class="contact-info">
              <h4>📞 Contact Information</h4>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>WhatsApp:</strong> +91 98765 43210</p>
              <p><strong>Email:</strong> ${finalAdminEmail || 'Not configured'}</p>
              <p><strong>Address:</strong> Resort Booking System, Ratnagiri, Maharashtra, India</p>
            </div>
            
            <div class="footer">
              <p><strong>Thank you for choosing Resort Booking System!</strong></p>
              <p>We look forward to providing you with an exceptional stay experience.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This is an automated confirmation email. Please save this for your records.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Admin Email Template
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification - Resort Booking System</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; background: #f8fafc; }
          .greeting { font-size: 18px; margin-bottom: 25px; color: #1f2937; }
          .booking-details { background: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .booking-details h3 { margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; }
          .detail-row { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #6b7280; font-size: 14px; }
          .detail-value { color: #111827; font-weight: 500; font-size: 14px; }
          .status-confirmed { background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .status-paid { background: #dbeafe; color: #1e40af; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .guest-info { background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6; }
          .guest-info h3 { margin: 0 0 20px 0; color: #1e40af; font-size: 18px; font-weight: 600; }
          .payment-info { background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #059669; }
          .payment-info h3 { margin: 0 0 20px 0; color: #059669; font-size: 18px; font-weight: 600; }
          .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .action-buttons { text-align: center; margin: 30px 0; }
          .action-button { display: inline-block; padding: 12px 24px; margin: 0 10px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .action-button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Booking Received!</h1>
            <p>Resort Booking System - Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <h2>New Booking Confirmed</h2>
              <p>A new booking has been successfully made and payment has been received. Please review the details below.</p>
            </div>
            
            <div class="booking-details">
              <h3>📋 Booking Information</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-confirmed">${booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="status-paid">${booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-in Date:</span>
                <span class="detail-value">${formatDate(booking.check_in_date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-out Date:</span>
                <span class="detail-value">${formatDate(booking.check_out_date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Nights:</span>
                <span class="detail-value">${nights} night${nights > 1 ? 's' : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₹${booking.total_amount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking Source:</span>
                <span class="detail-value">${booking.booking_source || 'Website'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking Date:</span>
                <span class="detail-value">${formatDate(booking.created_at || new Date().toISOString())}</span>
              </div>
            </div>
            
            <div class="guest-info">
              <h3>👤 Guest Information</h3>
              <div class="detail-row">
                <span class="detail-label">Guest Name:</span>
                <span class="detail-value">${booking.first_name} ${booking.last_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${booking.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${booking.phone || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Guests:</span>
                <span class="detail-value">${booking.num_guests} guest${booking.num_guests > 1 ? 's' : ''}</span>
              </div>
              ${booking.special_requests ? `
              <div class="detail-row">
                <span class="detail-label">Special Requests:</span>
                <span class="detail-value">${booking.special_requests}</span>
              </div>
              ` : ''}
            </div>
            
            ${paymentDetails ? `
            <div class="payment-info">
              <h3>💳 Payment Receipt</h3>
              <div class="detail-row">
                <span class="detail-label">Payment Gateway:</span>
                <span class="detail-value">${paymentDetails.gateway.charAt(0).toUpperCase() + paymentDetails.gateway.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="status-paid">${paymentDetails.status.charAt(0).toUpperCase() + paymentDetails.status.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Received:</span>
                <span class="detail-value">₹${paymentDetails.amount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Currency:</span>
                <span class="detail-value">${paymentDetails.currency}</span>
              </div>
              ${paymentDetails.paymentId ? `
              <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">${paymentDetails.paymentId}</span>
              </div>
              ` : ''}
              ${paymentDetails.orderId ? `
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${paymentDetails.orderId}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date(paymentDetails.timestamp).toLocaleString('en-IN')}</span>
              </div>
            </div>
            ` : ''}
            
            <div class="booking-details">
              <h3>🏠 Room Information</h3>
              <div class="detail-row">
                <span class="detail-label">Room Name:</span>
                <span class="detail-value">${room.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Room Number:</span>
                <span class="detail-value">${room.room_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Price per Night:</span>
                <span class="detail-value">₹${room.price_per_night.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Room Type:</span>
                <span class="detail-value">${room.room_type || 'Standard'}</span>
              </div>
            </div>
            
            <div class="action-buttons">
              <a href="${process.env.APP_URL || 'http://localhost:5173'}/admin/bookings" class="action-button">View All Bookings</a>
              <a href="${process.env.APP_URL || 'http://localhost:5173'}/admin/dashboard" class="action-button">Admin Dashboard</a>
            </div>
            
            <div class="footer">
              <p><strong>This is an automated notification from Resort Booking System.</strong></p>
              <p>Please log into the admin dashboard for more details and management options.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                Booking ID: #${booking.id} | Generated: ${new Date().toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Send customer email
    const customerMailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
      to: booking.email,
      subject: `Booking Confirmation #${booking.id} - Resort Booking System`,
      html: customerEmailHtml,
    }

    // Send admin email
    const adminMailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
      to: finalAdminEmail,
      subject: `New Booking #${booking.id} - Resort Booking System`,
      html: adminEmailHtml,
    }

    // Send both emails
    
    const [customerResult, adminResult] = await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions)
    ])


    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        customerEmailId: customerResult.messageId,
        adminEmailId: adminResult.messageId,
        message: 'Booking notifications sent successfully'
      }),
    }
  } catch (error) {
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to send booking notifications',
        details: error.message,
      }),
    }
  }
} 