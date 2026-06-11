import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8766,
    host: true,
    strictPort: true,
    // Forward API calls to Netlify Dev (run `npm run dev` — open http://localhost:8765)
    proxy: {
      '/.netlify': {
        target: 'http://127.0.0.1:8765',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Permissions-Policy': 'unload=()',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
