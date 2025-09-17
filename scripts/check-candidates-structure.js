import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkCandidatesStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table candidates...');
    
    // Récupérer tous les candidats pour voir la structure
    const { data: candidates, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }
    
    if (!candidates || candidates.length === 0) {
      console.log('❌ Aucun candidat trouvé');
      return;
    }
    
    console.log('✅ Structure de la table candidates:');
    console.log('📋 Champs disponibles:', Object.keys(candidates[0]));
    
    // Chercher spécifiquement Loic Bernard
    const { data: loic, error: loicError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', 26)
      .single();
    
    if (loicError) {
      console.error('❌ Erreur lors de la recherche de Loic:', loicError);
      return;
    }
    
    console.log('\n✅ Informations de Loic Bernard (ID 26):');
    console.log('📋 Tous les champs:', loic);
    
    // Vérifier s'il y a des champs liés à l'authentification
    const authFields = ['auth_id', 'user_id', 'auth_user_id', 'supabase_user_id'];
    console.log('\n🔍 Recherche de champs d\'authentification:');
    
    authFields.forEach(field => {
      if (loic[field]) {
        console.log(`✅ ${field}: ${loic[field]}`);
      } else {
        console.log(`❌ ${field}: non trouvé`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
checkCandidatesStructure()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
