import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createCandidateMapping() {
  try {
    console.log('🔍 Création d\'une table de correspondance candidat_id_mapping...');
    
    // Créer la table de correspondance
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS candidate_id_mapping (
          id SERIAL PRIMARY KEY,
          auth_uuid UUID NOT NULL UNIQUE,
          candidate_id INTEGER NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.log('⚠️ Table peut-être déjà existante ou erreur:', createError.message);
    } else {
      console.log('✅ Table candidate_id_mapping créée');
    }
    
    // Insérer la correspondance pour Loic Bernard
    const loicUUID = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
    const loicId = 26;
    
    console.log('🔄 Insertion de la correspondance pour Loic Bernard...');
    
    const { data: mapping, error: insertError } = await supabaseAdmin
      .from('candidate_id_mapping')
      .upsert({
        auth_uuid: loicUUID,
        candidate_id: loicId
      })
      .select();
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion:', insertError);
      return;
    }
    
    console.log('✅ Correspondance créée:', mapping);
    
    // Vérifier que la correspondance existe
    const { data: verifyMapping, error: verifyError } = await supabaseAdmin
      .from('candidate_id_mapping')
      .select('*')
      .eq('auth_uuid', loicUUID);
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }
    
    console.log('✅ Vérification réussie:', verifyMapping);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createCandidateMapping()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
