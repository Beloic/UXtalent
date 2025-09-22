// Script pour vérifier les données dans profile_tracking
import { supabase } from './src/lib/supabase.js';

async function checkProfileTracking() {
  console.log('🔍 Vérification des données profile_tracking...');
  
  try {
    // Récupérer toutes les données
    const { data, error } = await supabase
      .from('profile_tracking')
      .select('*')
      .order('viewed_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log(`📊 Total de ${data.length} vues trouvées:`);
    data.forEach((view, index) => {
      console.log(`${index + 1}. Candidat ID: ${view.candidate_id}, Vue: ${view.viewed_at}`);
    });
    
    // Vérifier spécifiquement pour le candidat ID 1
    const { data: candidate1Views, error: candidate1Error } = await supabase
      .from('profile_tracking')
      .select('*')
      .eq('candidate_id', 1);
    
    if (candidate1Error) {
      console.error('❌ Erreur pour candidat 1:', candidate1Error);
      return;
    }
    
    console.log(`\n🎯 Vues pour le candidat ID 1: ${candidate1Views.length}`);
    candidate1Views.forEach((view, index) => {
      console.log(`${index + 1}. ${view.viewed_at}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkProfileTracking();
