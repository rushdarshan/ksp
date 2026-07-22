import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mockServerPlugin from './mock-server-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mockServerPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons-vendor': ['react-icons'],
          'toast-vendor': ['react-hot-toast'],
          'graph-vendor': ['react-force-graph-2d'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
