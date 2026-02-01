import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8009',
      '/auth': 'http://127.0.0.1:8009',
      '/token': 'http://127.0.0.1:8009',
      '/iot': 'http://127.0.0.1:8009',
      '/ws': {
        target: 'ws://127.0.0.1:8009',
        ws: true
      }
    }
  }
})
