import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTU4NDAsImV4cCI6MjA3MzE3MTg0MH0.v6886_P_zJuTv-fsZZRydSaVfQ0qLqY56SQJgWePpY8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
