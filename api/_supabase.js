import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://khbtdpewrtkrzafrpebn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYnRkcGV3cnRrcnphZnJwZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzU2MTksImV4cCI6MjA0MTcxMTYxOX0.7qG1FCZxtM_OHe4H6e_2f_y5aLRLKqhfyR8VCj2mP8g';

// Créer et exporter le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
