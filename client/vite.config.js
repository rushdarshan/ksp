import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mockServerPlugin from './mock-server-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mockServerPlugin(),
  ],
})
