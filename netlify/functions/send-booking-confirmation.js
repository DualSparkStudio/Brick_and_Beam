 import nodemailer from 'nodemailer'

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { 
      type,
      booking, 
      room, 
      to,
      adminEmail = process.env.ADMIN_EMAIL || '',
      adminPhone = '', // Add admin phone parameter
      smtpConfig = {},
      notificationType = 'confirmation' // 'confirmation', 'update', 'cancellation'
    } = JSON.parse(event.body)

    // Handle test email
    if (type === 'test') {
      const mailUsername = smtpConfig.mail_username || process.env.MAIL_USERNAME
      const mailPassword = smtpConfig.mail_password || process.env.MAIL_PASSWORD
      const mailServer = smtpConfig.mail_server || process.env.MAIL_SERVER || 'smtp.gmail.com'
      const mailPort = smtpConfig.mail_port || process.env.MAIL_PORT || '587'

      if (!mailUsername || !mailPassword) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'SMTP configuration is incomplete',
            success: false
          }),
        }
      }

      // Configure test email transporter
      const transporter = nodemailer.createTransport({
        host: mailServer,
        port: parseInt(mailPort),
        secure: false,
        auth: {
          user: mailUsername,
          pass: mailPassword,
        },
      })

      // Verify SMTP connection
      try {
        await transporter.verify()
      } catch (verifyError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'SMTP connection failed: ' + verifyError.message,
            success: false,
            hint: 'Make sure you are using a Gmail App Password (not regular password) and 2-Step Verification is enabled.'
          }),
        }
      }

      // Send test email
      const testMailOptions = {
        from: mailUsername,
        to: to || mailUsername,
        subject: '✅ SMTP Test Email - Brick and Beam',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-box { background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ SMTP Test Successful!</h1>
              </div>
              <div class="content">
                <div class="success-box">
                  <h3>🎉 Congratulations!</h3>
                  <p>Your SMTP configuration is working correctly. You can now send booking confirmation emails.</p>
                </div>
                <p><strong>SMTP Server:</strong> ${mailServer}</p>
                <p><strong>SMTP Port:</strong> ${mailPort}</p>
                <p><strong>From Email:</strong> ${mailUsername}</p>
                <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">This is an automated test email from Brick and Beam.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }

      const result = await transporter.sendMail(testMailOptions)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId
        }),
      }
    }

    // Validate required data for booking emails
    if (!booking || !room) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required booking or room data',
        }),
      }
    }

    // Use dynamic SMTP config if provided, otherwise fall back to environment variables
    const mailUsername = smtpConfig.mail_username || process.env.MAIL_USERNAME
    const mailPassword = smtpConfig.mail_password || process.env.MAIL_PASSWORD
    const mailServer = smtpConfig.mail_server || process.env.MAIL_SERVER || 'smtp.gmail.com'
    const mailPort = smtpConfig.mail_port || process.env.MAIL_PORT || '587'
    
    // Use SMTP username as sender email (since they should be the same)
    const senderEmail = mailUsername

    // Validate email configuration
    console.log('📧 SMTP Configuration Check:', {
      mailUsername: mailUsername ? '✓ Set' : '✗ Not set',
      mailPassword: mailPassword ? '✓ Set' : '✗ Not set',
      mailServer,
      mailPort
    })

    if (!mailUsername || !mailPassword) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Email service not configured. Please configure SMTP settings in the admin panel.',
          details: {
            mailUsername: mailUsername ? 'Set' : 'Not set',
            mailPassword: mailPassword ? 'Set' : 'Not set'
          }
        }),
      }
    }


    // Configure email transporter with dynamic settings
    const transporter = nodemailer.createTransport({
      host: mailServer,
      port: parseInt(mailPort),
      secure: false,
      auth: {
        user: mailUsername,
        pass: mailPassword,
      },
    })

    // Test email configuration
    console.log('🔍 Verifying SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully!')
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Email service configuration error. Please check SMTP settings.',
          details: verifyError.message,
          hint: 'Make sure you are using a Gmail App Password (not regular password) and 2-Step Verification is enabled.'
        }),
      }
    }

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

    // Get notification subject and content based on type
    const getNotificationContent = (type) => {
      switch (type) {
        case 'confirmation':
          return {
            guestSubject: `Booking Confirmation #${booking.id} - Brick and Beam`,
            adminSubject: `New Booking Confirmed #${booking.id} - Brick and Beam`,
            guestTitle: '🎉 Booking Confirmed!',
            adminTitle: '📋 New Booking Confirmed',
            guestMessage: 'Your booking has been successfully confirmed! We\'re excited to welcome you to Brick and Beam.',
            adminMessage: 'A new booking has been confirmed and requires your attention.',
            statusClass: 'status-confirmed',
            statusText: 'Confirmed'
          }
        case 'update':
          return {
            guestSubject: `Booking Updated #${booking.id} - Brick and Beam`,
            adminSubject: `Booking Updated #${booking.id} - Brick and Beam`,
            guestTitle: '📝 Booking Updated',
            adminTitle: '📝 Booking Updated',
            guestMessage: 'Your booking has been updated. Please review the details below.',
            adminMessage: 'A booking has been updated. Please review the changes.',
            statusClass: 'status-updated',
            statusText: 'Updated'
          }
        case 'cancellation':
          return {
            guestSubject: `Booking Cancelled #${booking.id} - Brick and Beam`,
            adminSubject: `Booking Cancelled #${booking.id} - Brick and Beam`,
            guestTitle: '❌ Booking Cancelled',
            adminTitle: '❌ Booking Cancelled',
            guestMessage: 'Your booking has been cancelled. If you have any questions, please contact us.',
            adminMessage: 'A booking has been cancelled. Please review the details.',
            statusClass: 'status-cancelled',
            statusText: 'Cancelled'
          }
        default:
          return {
            guestSubject: `Booking Notification #${booking.id} - Brick and Beam`,
            adminSubject: `Booking Notification #${booking.id} - Brick and Beam`,
            guestTitle: '📋 Booking Notification',
            adminTitle: '📋 Booking Notification',
            guestMessage: 'You have received a booking notification from Brick and Beam.',
            adminMessage: 'A booking notification has been received.',
            statusClass: 'status-notification',
            statusText: 'Notification'
          }
      }
    }

    const notificationContent = getNotificationContent(notificationType)

    // Guest Email Template
    const guestEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notificationContent.guestSubject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .status-confirmed { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-updated { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-cancelled { background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-notification { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-paid { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .important-info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .contact-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notificationContent.guestTitle}</h1>
            <p>Thank you for choosing Brick and Beam</p>
          </div>
          
          <div class="content">
            <h2>Dear ${booking.first_name} ${booking.last_name},</h2>
            
            <p>${notificationContent.guestMessage}</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="${notificationContent.statusClass}">${notificationContent.statusText}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Room:</span>
                <span class="detail-value">${room.name}</span>
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
                <span class="detail-value">₹${booking.total_amount?.toLocaleString() || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="status-paid">${booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1) || 'Pending'}</span>
              </div>
              ${booking.special_requests ? `
              <div class="detail-row">
                <span class="detail-label">Special Requests:</span>
                <span class="detail-value">${booking.special_requests}</span>
              </div>
              ` : ''}
            </div>
            
            ${notificationType === 'confirmation' ? `
            <div class="important-info">
              <h4>📞 Important Information</h4>
              <p><strong>Check-in Time:</strong> 1:00 PM onwards (flexible depending on other bookings)</p>
              <p><strong>Check-out Time:</strong> 10:00 AM (flexible depending on other bookings)</p>
              <p><strong>Address:</strong> Brick and Beam, Ratnagiri, Maharashtra</p>
              <p><em>Note: Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.</em></p>
            </div>
            
            <div class="contact-info">
              <h4>📞 Contact Information</h4>
              ${adminPhone ? `<p><strong>Phone:</strong> ${adminPhone}</p>` : ''}
              ${adminEmail ? `<p><strong>Email:</strong> ${adminEmail}</p>` : ''}
              ${adminPhone ? `<p><strong>WhatsApp:</strong> ${adminPhone}</p>` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>This is an automated notification from Brick and Beam.</p>
              <p>If you have any questions, please contact us directly.</p>
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
        <title>${notificationContent.adminSubject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .status-confirmed { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-updated { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-cancelled { background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-notification { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-paid { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notificationContent.adminTitle}</h1>
            <p>Brick and Beam - Admin Notification</p>
          </div>
          
          <div class="content">
            <h2>${notificationContent.adminMessage}</h2>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guest Name:</span>
                <span class="detail-value">${booking.first_name} ${booking.last_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guest Email:</span>
                <span class="detail-value">${booking.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guest Phone:</span>
                <span class="detail-value">${booking.phone || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Room:</span>
                <span class="detail-value">${room.name}</span>
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
                <span class="detail-value">₹${booking.total_amount?.toLocaleString() || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking Status:</span>
                <span class="${notificationContent.statusClass}">${notificationContent.statusText}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="status-paid">${booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1) || 'Pending'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Gateway:</span>
                <span class="detail-value">${booking.payment_gateway || 'Direct'}</span>
              </div>
              ${booking.special_requests ? `
              <div class="detail-row">
                <span class="detail-label">Special Requests:</span>
                <span class="detail-value">${booking.special_requests}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Booking Date:</span>
                <span class="detail-value">${formatDate(booking.created_at)}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Brick and Beam.</p>
              <p>Please log into the admin dashboard for more details and management options.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Send guest email
    const guestMailOptions = {
      from: senderEmail,
      to: booking.email,
      subject: notificationContent.guestSubject,
      html: guestEmailHtml,
    }

    // Send admin email
    const adminMailOptions = {
      from: senderEmail,
      to: adminEmail,
      subject: notificationContent.adminSubject,
      html: adminEmailHtml,
    }

    // Send both emails
    console.log('📨 Sending emails...')
    console.log('  → Guest email to:', booking.email)
    console.log('  → Admin email to:', adminEmail)
    
    const [guestResult, adminResult] = await Promise.all([
      transporter.sendMail(guestMailOptions),
      transporter.sendMail(adminMailOptions)
    ])
    
    console.log('✅ Emails sent successfully!')
    console.log('  → Guest email ID:', guestResult.messageId)
    console.log('  → Admin email ID:', adminResult.messageId)


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        guestEmailId: guestResult.messageId,
        adminEmailId: adminResult.messageId,
        message: `Booking ${notificationType} emails sent successfully`,
        notificationType
      }),
    }
  } catch (error) {
    console.error('❌ Error in send-booking-confirmation function:', error)
    console.error('Error stack:', error.stack)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send booking confirmation emails',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    }
  }
} 