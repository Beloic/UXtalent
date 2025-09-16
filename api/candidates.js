import { supabase } from '../src/lib/supabase';

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
      let query = supabase
        .from('candidates')
        .select('*', { count: 'exact' });

      // Gérer les paramètres de requête
      const { sortBy, search, remote, experience, availability, location, salaryRange } = req.query;

      if (search) {
        query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,bio.ilike.%${search}%`);
      }

      if (remote && remote.length > 0) {
        query = query.in('remote', remote);
      }

      if (experience && experience.length > 0) {
        query = query.in('experience', experience);
      }

      if (availability && availability.length > 0) {
        query = query.in('availability', availability);
      }

      if (location && location.length > 0) {
        query = query.in('location', location);
      }

      if (salaryRange && salaryRange.length > 0) {
        // Logique pour les gammes de salaire
        const salaryConditions = salaryRange.map(range => {
          switch(range) {
            case '0-30k': return 'annual_salary.lte.30000';
            case '30k-50k': return 'annual_salary.gte.30000.annual_salary.lte.50000';
            case '50k-80k': return 'annual_salary.gte.50000.annual_salary.lte.80000';
            case '80k+': return 'annual_salary.gte.80000';
            default: return null;
          }
        }).filter(Boolean);
        
        if (salaryConditions.length > 0) {
          query = query.or(salaryConditions.join(','));
        }
      }

      // Tri
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.status(200).json({
        candidates: data || [],
        total: count || 0
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
