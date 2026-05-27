const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { fetchAndParseAirbnbBookings } = require('./services/airbnbService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Resort Booking API'
  });
});

// Airbnb bookings API endpoint
app.get('/api/airbnb-bookings', async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.query;
    
    // Get calendar URLs from environment
    const calendarUrls = process.env.AIRBNB_CALENDAR_URLS 
      ? JSON.parse(process.env.AIRBNB_CALENDAR_URLS)
      : [];

    if (calendarUrls.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No Airbnb calendar URLs configured'
      });
    }


    // Fetch and parse all Airbnb bookings
    const allBookings = await fetchAndParseAirbnbBookings(calendarUrls, {
      roomId: roomId ? parseInt(roomId) : null,
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: allBookings,
      count: allBookings.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Airbnb bookings',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get specific room's Airbnb bookings
app.get('/api/airbnb-bookings/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    // Get calendar URL for specific room
    const roomCalendarUrls = process.env[`AIRBNB_CALENDAR_URL_ROOM_${roomId}`] 
      ? [process.env[`AIRBNB_CALENDAR_URL_ROOM_${roomId}`]]
      : [];

    if (roomCalendarUrls.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: `No calendar URL configured for room ${roomId}`
      });
    }

    const bookings = await fetchAndParseAirbnbBookings(roomCalendarUrls, {
      roomId: parseInt(roomId),
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: bookings,
      count: bookings.length,
      roomId: parseInt(roomId)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room Airbnb bookings',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
});

module.exports = app; 