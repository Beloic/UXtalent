import { supabaseAdmin } from '../../src/config/supabase.js';

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
    if (req.method === 'POST') {
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
