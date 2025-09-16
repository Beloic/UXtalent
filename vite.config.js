import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // Force l'utilisation de l'URL de production
    'process.env.VITE_API_URL': JSON.stringify('https://ux-jobs-pro-backend.onrender.com')
  }
})
