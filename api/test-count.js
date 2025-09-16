import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://khbtdpewrtkrzafrpebn.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYnRkcGV3cnRrcnphZnJwZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzU2MTksImV4cCI6MjA0MTcxMTYxOX0.7qG1FCZxtM_OHe4H6e_2f_y5aLRLKqhfyR8VCj2mP8g';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test avec count seulement (comme l'API qui fonctionne)
    const { count: jobsCount, error: jobsError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' });
      
    const { count: candidatesCount, error: candidatesError } = await supabase
      .from('candidates') 
      .select('id', { count: 'exact' });
    
    res.status(200).json({
      jobsCount: jobsCount || 0,
      candidatesCount: candidatesCount || 0,
      jobsError: jobsError?.message || null,
      candidatesError: candidatesError?.message || null
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
