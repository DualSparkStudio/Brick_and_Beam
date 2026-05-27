const nodemailer = require('nodemailer')

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { contactData, adminEmail, smtpConfig = {} } = JSON.parse(event.body)

    if (!contactData || !adminEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required data' })
      }
    }

    // Use dynamic SMTP config if provided, otherwise fall back to environment variables
    const mailUsername = smtpConfig.mail_username || process.env.MAIL_USERNAME
    const mailPassword = smtpConfig.mail_password || process.env.MAIL_PASSWORD
    const mailServer = smtpConfig.mail_server || process.env.MAIL_SERVER || 'smtp.gmail.com'
    const mailPort = smtpConfig.mail_port || process.env.MAIL_PORT || '587'
    
    // Use SMTP username as sender email (since they should be the same)
    const senderEmail = mailUsername

    console.log('SMTP Configuration:', {
      host: mailServer,
      port: mailPort,
      user: mailUsername ? '***' : 'NOT SET',
      pass: mailPassword ? '***' : 'NOT SET',
      senderEmail
    })

    // Validate email configuration
    if (!mailUsername || !mailPassword) {
      console.error('SMTP credentials missing:', {
        mailUsername: mailUsername ? 'Set' : 'Not set',
        mailPassword: mailPassword ? 'Set' : 'Not set',
        mailServer,
        mailPort
      })
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Email service not configured. Please configure SMTP settings in the admin panel or check environment variables.',
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
    try {
      await transporter.verify()
    } catch (verifyError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Email service configuration is invalid. Please check your SMTP settings.',
          details: verifyError.message
        }),
      }
    }

    // Email content
    const mailOptions = {
      from: senderEmail,
      to: adminEmail,
      subject: `New Contact Form Message: ${contactData.subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5530; border-bottom: 2px solid #2c5530; padding-bottom: 10px;">
            New Contact Form Message
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c5530; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${contactData.subject || 'General Inquiry'}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #2c5530; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
            <p>This message was sent from the Resort Booking System contact form.</p>
            <p>To reply to this message, please email: <a href="mailto:${contactData.email}" style="color: #2c5530;">${contactData.email}</a></p>
          </div>
        </div>
      `
    }

    console.log('Sending email to:', adminEmail)

    // Send email
    const result = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', result.messageId)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Contact form email sent successfully',
        success: true,
        messageId: result.messageId
      })
    }

  } catch (error) {
    console.error('Contact email error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send contact email',
        details: error.message,
        code: error.code
      })
    }
  }
} 