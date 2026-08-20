import http from 'http'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const require = createRequire(import.meta.url)

dotenv.config({ path: join(rootDir, '.env') })

const PORT = Number(process.env.FUNCTIONS_PORT || 8888)

const handlers = {
  'simple-login': () => require(join(rootDir, 'netlify/functions/simple-login.js')).handler,
  'send-booking-confirmation': () => require(join(rootDir, 'netlify/functions/send-booking-confirmation.js')).handler,
  'create-razorpay-order': () => require(join(rootDir, 'netlify/functions/create-razorpay-order.js')).handler,
  'calendar-feed': () => require(join(rootDir, 'netlify/functions/calendar-feed.js')).handler,
  'send-contact-email': () => require(join(rootDir, 'netlify/functions/send-contact-email.js')).handler,
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders)
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const parts = url.pathname.split('/').filter(Boolean)
  const functionName = parts[parts.length - 1] || parts[0]

  const getHandler = handlers[functionName]
  if (!getHandler) {
    res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `Function not found: ${functionName}` }))
    return
  }

  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', async () => {
    try {
      const handler = getHandler()
      const result = await handler(
        {
          httpMethod: req.method,
          body,
          headers: req.headers,
          path: url.pathname,
          queryStringParameters: Object.fromEntries(url.searchParams),
        },
        {}
      )

      const headers = { ...corsHeaders, ...(result.headers || {}), 'Content-Type': 'application/json' }
      res.writeHead(result.statusCode || 200, headers)
      res.end(result.body || '')
    } catch (error) {
      console.error(`[functions] ${functionName} failed:`, error)
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: error.message || 'Function execution failed', success: false }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`Local Netlify functions server running at http://localhost:${PORT}`)
})
