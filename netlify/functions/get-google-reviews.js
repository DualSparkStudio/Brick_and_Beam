exports.handler = async (event, context) => {
  // Enable CORS with cache control
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Google Places API key not configured',
          success: false
        })
      }
    }

    // Search for the place by name
    const placeName = 'Brick and Beam'
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&key=${apiKey}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Place not found',
          success: false
        })
      }
    }

    // Get the first result's place_id
    const placeId = searchData.results[0].place_id

    // Get place details with reviews
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address&key=${apiKey}`
    
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (detailsData.status !== 'OK') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to fetch place details',
          success: false
        })
      }
    }

    const place = detailsData.result
    
    // Format reviews
    const reviews = (place.reviews || []).map(review => ({
      author_name: review.author_name,
      author_url: review.author_url,
      profile_photo_url: review.profile_photo_url,
      rating: review.rating,
      relative_time_description: review.relative_time_description,
      text: review.text,
      time: review.time
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        place: {
          name: place.name,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          formatted_address: place.formatted_address
        },
        reviews: reviews.slice(0, 10), // Return latest 10 reviews
        cached_at: new Date().toISOString() // Add timestamp for debugging
      })
    }

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Google reviews',
        details: error.message,
        success: false
      })
    }
  }
}
