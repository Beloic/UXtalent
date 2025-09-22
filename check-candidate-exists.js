// Script pour vérifier si le candidat ID 1 existe
import { supabase } from './src/lib/supabase.js';

async function checkCandidateExists() {
  console.log('🔍 Vérification de l\'existence du candidat ID 1...');
  
  try {
    // Lister quelques candidats pour voir les IDs disponibles
    console.log('📋 Candidats disponibles:');
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, email')
      .limit(10)
      .order('id', { ascending: true });
    
    if (candidatesError) {
      console.error('❌ Erreur lors de la récupération des candidats:', candidatesError);
      return;
    }
    
    if (candidates && candidates.length > 0) {
      candidates.forEach(candidate => {
        console.log(`- ID: ${candidate.id}, Nom: ${candidate.name}, Email: ${candidate.email}`);
      });
    } else {
      console.log('❌ Aucun candidat trouvé');
    }
    
    // Lister quelques candidats pour voir les IDs disponibles
    console.log('\n📋 Quelques candidats disponibles:');
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, email')
      .limit(5)
      .order('id', { ascending: true });
    
    if (candidatesError) {
      console.error('❌ Erreur lors de la récupération des candidats:', candidatesError);
      return;
    }
    
    candidates.forEach(candidate => {
      console.log(`- ID: ${candidate.id}, Nom: ${candidate.name}, Email: ${candidate.email}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkCandidateExists();
