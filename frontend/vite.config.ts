import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // CampusFlow Docker maps host 8090 → container 8080. Host :8080 is often another app.
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
})
