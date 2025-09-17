import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function updateApplicationsCandidateId() {
  try {
    console.log('🔍 Recherche des candidatures avec UUID candidate_id...');
    
    // UUID de Loic Bernard
    const loicUUID = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
    const loicId = 26;
    
    // Chercher toutes les candidatures avec l'UUID de Loic Bernard
    const { data: applications, error: searchError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('candidate_id', loicUUID);
    
    if (searchError) {
      console.error('❌ Erreur lors de la recherche des candidatures:', searchError);
      return;
    }
    
    if (!applications || applications.length === 0) {
      console.log('❌ Aucune candidature trouvée avec l\'UUID de Loic Bernard');
      return;
    }
    
    console.log(`✅ ${applications.length} candidature(s) trouvée(s) pour Loic Bernard`);
    
    // Afficher les candidatures trouvées
    applications.forEach((app, index) => {
      console.log(`📋 Candidature ${index + 1}:`, {
        id: app.id,
        job_id: app.job_id,
        candidate_id: app.candidate_id,
        first_name: app.first_name,
        last_name: app.last_name,
        applied_at: app.applied_at
      });
    });
    
    console.log('\n🔄 Mise à jour des candidate_id vers l\'ID 26...');
    
    // Mettre à jour toutes les candidatures
    const { data: updatedApplications, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ candidate_id: loicId })
      .eq('candidate_id', loicUUID)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return;
    }
    
    console.log(`✅ ${updatedApplications.length} candidature(s) mise(s) à jour avec succès`);
    
    // Vérifier que la mise à jour a fonctionné
    const { data: verifyApplications, error: verifyError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('candidate_id', loicId);
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }
    
    console.log('\n✅ Vérification réussie - Candidatures avec candidate_id = 26:');
    verifyApplications.forEach((app, index) => {
      console.log(`📋 Candidature ${index + 1}:`, {
        id: app.id,
        job_id: app.job_id,
        candidate_id: app.candidate_id,
        first_name: app.first_name,
        last_name: app.last_name,
        applied_at: app.applied_at
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
updateApplicationsCandidateId()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
