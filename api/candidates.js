// Configuration Supabase pour API REST directe
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://khbtdpewrtkrzafrpebn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYnRkcGV3cnRrcnphZnJwZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzU2MTksImV4cCI6MjA0MTcxMTYxOX0.7qG1FCZxtM_OHe4H6e_2f_y5aLRLKqhfyR8VCj2mP8g';

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Version simplifiée avec fetch direct - récupérer tous les candidats triés par date
      const { sortBy } = req.query;
      const orderParam = sortBy === 'name' ? 'name.asc' : 'created_at.desc';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/candidates?order=${orderParam}`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const count = response.headers.get('content-range')?.split('/')[1] || data.length;

      res.status(200).json({
        candidates: data || [],
        total: parseInt(count) || 0
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
