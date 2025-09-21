import { supabaseAdmin } from '../../../src/config/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    console.log('🔍 [API] Recherche du profil pour:', email);

    // Rechercher le candidat par email
    const { data: candidate, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('🔍 [API] Profil non trouvé (404) pour:', email);
        return res.status(404).json({ error: 'Profile not found' });
      }
      console.error('❌ [API] Erreur lors de la recherche:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('✅ [API] Profil trouvé:', { id: candidate.id, status: candidate.status });
    return res.status(200).json(candidate);

  } catch (error) {
    console.error('❌ [API] Erreur inattendue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
