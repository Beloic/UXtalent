import { createClient } from '@supabase/supabase-js';

// Configuration Supabase directement dans l'API pour éviter les problèmes d'import
// Utiliser les vraies valeurs hardcodées pour éviter les problèmes de variables d'environnement
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      // Ajouter un timeout de 10 secondes pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});

console.log('🔧 [API] Configuration Supabase:', {
  url: supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey?.length
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Récupérer un profil par email
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      console.log('🔍 [API] Recherche du profil pour email:', email);
      console.log('🔧 [API] Test de connexion Supabase avant requête...');

      // Rechercher le candidat par email
      console.log('🔧 [API] Exécution de la requête Supabase...');
      
      let candidate, error;
      try {
        const result = await supabaseAdmin
          .from('candidates')
          .select('*')
          .eq('email', email)
          .single();
        
        candidate = result.data;
        error = result.error;
      } catch (fetchError) {
        console.error('❌ [API] Erreur de fetch:', fetchError);
        return res.status(500).json({ 
          error: 'Network error',
          details: fetchError.message,
          type: 'fetch_failed'
        });
      }
      
      console.log('🔧 [API] Résultat Supabase:', { 
        hasData: !!candidate, 
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message 
      });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🔍 [API] Profil non trouvé (404) pour email:', email);
          return res.status(404).json({ error: 'Profile not found' });
        }
        console.error('❌ [API] Erreur lors de la recherche:', error);
        console.error('❌ [API] Détails de l\'erreur:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return res.status(500).json({ 
          error: 'Database error',
          details: error.message,
          code: error.code
        });
      }

      console.log('✅ [API] Profil trouvé:', { id: candidate.id, status: candidate.status });
      return res.status(200).json(candidate);

    } else if (req.method === 'POST') {
      // Créer un nouveau candidat
      const candidateData = req.body;
      
      console.log('🆕 [API] Création d\'un nouveau candidat:', candidateData.email);

      const { data: newCandidate, error } = await supabaseAdmin
        .from('candidates')
        .insert([candidateData])
        .select()
        .single();

      if (error) {
        console.error('❌ [API] Erreur lors de la création:', error);
        return res.status(500).json({ error: 'Failed to create candidate' });
      }

      console.log('✅ [API] Candidat créé:', { id: newCandidate.id, status: newCandidate.status });
      return res.status(201).json(newCandidate);

    } else if (req.method === 'PUT') {
      // Mettre à jour un candidat existant
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Candidate ID is required' });
      }

      console.log('🔄 [API] Mise à jour du candidat:', id);

      const { data: updatedCandidate, error } = await supabaseAdmin
        .from('candidates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [API] Erreur lors de la mise à jour:', error);
        return res.status(500).json({ error: 'Failed to update candidate' });
      }

      console.log('✅ [API] Candidat mis à jour:', { id: updatedCandidate.id, status: updatedCandidate.status });
      return res.status(200).json(updatedCandidate);

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('❌ [API] Erreur inattendue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
