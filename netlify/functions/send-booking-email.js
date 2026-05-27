import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Debug environment variables

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const { 
      bookingId, 
      guestEmail, 
      guestName, 
      roomName, 
      checkInDate, 
      checkOutDate, 
      totalAmount, 
      paymentStatus,
      adminEmail = process.env.ADMIN_EMAIL 
    } = JSON.parse(event.body);

    if (!bookingId || !guestEmail || !guestName || !roomName || !checkInDate || !checkOutDate || !totalAmount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required booking details' }),
      };
    }

    // Email to guest
    const guestEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmation - Resort Booking System</h2>
        <p>Dear ${guestName},</p>
        <p>Your booking has been confirmed! Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <p><strong>Booking ID:</strong> #${bookingId}</p>
          <p><strong>Room:</strong> ${roomName}</p>
          <p><strong>Check-in Date:</strong> ${new Date(checkInDate).toLocaleDateString()}</p>
          <p><strong>Check-out Date:</strong> ${new Date(checkOutDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>
        
        <p>We look forward to welcoming you at Resort Booking System!</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>Resort Booking System Team</p>
      </div>
    `;

    // Email to admin
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Booking Received - Resort Booking System</h2>
        <p>A new booking has been made:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <p><strong>Booking ID:</strong> #${bookingId}</p>
          <p><strong>Guest Name:</strong> ${guestName}</p>
          <p><strong>Guest Email:</strong> ${guestEmail}</p>
          <p><strong>Room:</strong> ${roomName}</p>
          <p><strong>Check-in Date:</strong> ${new Date(checkInDate).toLocaleDateString()}</p>
          <p><strong>Check-out Date:</strong> ${new Date(checkOutDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>
        
        <p>Please review and confirm this booking.</p>
      </div>
    `;

    // Send email to guest
    const guestMailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
      to: guestEmail,
      subject: 'Booking Confirmation - Resort Booking System',
      html: guestEmailContent,
    };

    // Send email to admin
    const adminMailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
      to: adminEmail,
      subject: `New Booking #${bookingId} - Resort Booking System`,
      html: adminEmailContent,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(guestMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Booking confirmation emails sent successfully',
      }),
    };
  } catch (error) {
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send booking email',
        details: error.message,
      }),
    };
  }
}; 