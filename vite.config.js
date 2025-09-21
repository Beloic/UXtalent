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
    sourcemap: false,
    // Optimisations de build
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer React et ses dépendances
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Séparer les bibliothèques UI
          'ui-vendor': ['framer-motion', 'lucide-react', '@dnd-kit/core', '@dnd-kit/sortable'],
          // Séparer les bibliothèques de données
          'data-vendor': ['@supabase/supabase-js', 'recharts'],
          // Séparer les bibliothèques de drag & drop
          'dnd-vendor': ['@hello-pangea/dnd', '@caldwell619/react-kanban']
        }
      }
    },
    // Compression et optimisation - SEULEMENT en production
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    terserOptions: process.env.NODE_ENV === 'production' ? {
      compress: {
        drop_console: false,  // ← GARDER les console.log même en production
        drop_debugger: true
      }
    } : {},
    // Limiter la taille des chunks
    chunkSizeWarningLimit: 1000
  },
  define: {
    // Utiliser l'URL locale en développement, production en build
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://ux-jobs-pro-backend.onrender.com'
        : 'http://localhost:3001'
    )
  }
})
