import { createClient } from '@supabase/supabase-js'

// Configuration Supabase centralisée - Utilisation des variables d'environnement
// Côté serveur: utiliser process.env uniquement
// Côté client: import.meta.env sera disponible via Vite
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : process.env.VITE_SUPABASE_ANON_KEY

// SUPABASE_SERVICE_KEY n'est disponible que côté serveur (sécurisé)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes:')
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl, supabaseUrl ? '(définie)' : '(manquante)')
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey, supabaseAnonKey ? '(définie)' : '(manquante)')
  console.error('')
  console.error('🔧 CONFIGURATION REQUISE SUR RENDER:')
  console.error('1. Allez dans votre service Render → Environment')
  console.error('2. Ajoutez ces variables:')
  console.error('   - VITE_SUPABASE_URL=https://ktfdrwpvofxuktnunukv.supabase.co')
  console.error('   - VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase')
  console.error('   - SUPABASE_SERVICE_KEY=votre_clé_service_supabase')
  console.error('3. Redéployez le service')
  console.error('')
  throw new Error('Configuration Supabase incomplète - Variables d\'environnement manquantes sur Render')
}

// Note: SUPABASE_SERVICE_KEY n'est pas disponible côté client (c'est normal et sécurisé)

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
