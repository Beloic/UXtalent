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
    // Compression et optimisation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Limiter la taille des chunks
    chunkSizeWarningLimit: 1000
  },
  define: {
    // Force l'utilisation de l'URL de production
    'process.env.VITE_API_URL': JSON.stringify('https://ux-jobs-pro-backend.onrender.com')
  }
})
