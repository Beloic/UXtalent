import { supabaseAdmin } from './src/config/supabase.js';

async function checkRecentCandidates() {
  try {
    console.log('🔍 Vérification des candidats récents...');
    
    // Récupérer les 5 derniers candidats créés
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('id, name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📋 Les 5 derniers candidats créés:');
    data.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email})`);
      console.log(`   ID: ${candidate.id} | Statut: ${candidate.status} | Créé: ${candidate.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

checkRecentCandidates();
