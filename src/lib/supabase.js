import { createClient } from '@supabase/supabase-js'

// Configuration Supabase centralisée - Utilisation des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes:')
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  throw new Error('Configuration Supabase incomplète - vérifiez vos variables d\'environnement')
}

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_KEY manquante - certaines fonctionnalités admin peuvent ne pas fonctionner')
}

// Client Supabase principal (pour le frontend avec auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Client Supabase admin (pour les opérations serveur)
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Export des configurations pour compatibilité
export { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
