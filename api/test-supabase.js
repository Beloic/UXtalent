import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Configuration Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://khbtdpewrtkrzafrpebn.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYnRkcGV3cnRrcnphZnJwZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzU2MTksImV4cCI6MjA0MTcxMTYxOX0.7qG1FCZxtM_OHe4H6e_2f_y5aLRLKqhfyR8VCj2mP8g';
    
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test simple - lister les tables
    const { data, error } = await supabase
      .from('jobs')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      return res.status(500).json({ 
        error: 'Supabase error', 
        details: error.message,
        code: error.code 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      jobsCount: data?.length || 0,
      message: 'Supabase connection successful' 
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Catch error', 
      message: error.message,
      stack: error.stack?.substring(0, 200) 
    });
  }
}
