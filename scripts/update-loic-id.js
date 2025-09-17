import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (valeurs hardcodées pour le script)
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function updateLoicBernardId() {
  try {
    console.log('🔍 Recherche de Loic Bernard dans la base de données...');
    
    // Chercher Loic Bernard par nom
    const { data: candidates, error: searchError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .ilike('name', '%Loic%Bernard%');
    
    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError);
      return;
    }
    
    if (!candidates || candidates.length === 0) {
      console.log('❌ Aucun candidat nommé Loic Bernard trouvé');
      
      // Chercher par email si le nom ne fonctionne pas
      const { data: candidatesByEmail, error: emailError } = await supabaseAdmin
        .from('candidates')
        .select('*')
        .ilike('email', '%loic%');
      
      if (emailError) {
        console.error('❌ Erreur lors de la recherche par email:', emailError);
        return;
      }
      
      if (!candidatesByEmail || candidatesByEmail.length === 0) {
        console.log('❌ Aucun candidat avec email contenant "loic" trouvé');
        return;
      }
      
      console.log('✅ Candidat trouvé par email:', candidatesByEmail[0]);
      candidates = candidatesByEmail;
    }
    
    const loicBernard = candidates[0];
    console.log('✅ Candidat trouvé:', {
      id: loicBernard.id,
      name: loicBernard.name,
      email: loicBernard.email
    });
    
    // Vérifier si l'ID est déjà 26
    if (loicBernard.id === 26) {
      console.log('✅ Loic Bernard a déjà l\'ID 26');
      return;
    }
    
    console.log('🔄 Mise à jour de l\'ID de Loic Bernard vers 26...');
    
    // Mettre à jour l'ID vers 26
    const { data: updatedCandidate, error: updateError } = await supabaseAdmin
      .from('candidates')
      .update({ id: 26 })
      .eq('id', loicBernard.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      
      // Si l'erreur est due à un conflit d'ID, essayer de supprimer l'ancien et créer le nouveau
      if (updateError.message.includes('duplicate key') || updateError.message.includes('unique constraint')) {
        console.log('🔄 Tentative de suppression et recréation...');
        
        // Supprimer l'ancien candidat
        const { error: deleteError } = await supabaseAdmin
          .from('candidates')
          .delete()
          .eq('id', loicBernard.id);
        
        if (deleteError) {
          console.error('❌ Erreur lors de la suppression:', deleteError);
          return;
        }
        
        // Créer le nouveau candidat avec l'ID 26
        const { data: newCandidate, error: insertError } = await supabaseAdmin
          .from('candidates')
          .insert([{ ...loicBernard, id: 26 }])
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Erreur lors de l\'insertion:', insertError);
          return;
        }
        
        console.log('✅ Candidat recréé avec l\'ID 26:', newCandidate);
      }
    } else {
      console.log('✅ ID mis à jour avec succès:', updatedCandidate);
    }
    
    // Vérifier que la mise à jour a fonctionné
    const { data: verifyCandidate, error: verifyError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', 26)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }
    
    console.log('✅ Vérification réussie - Loic Bernard a maintenant l\'ID 26:', {
      id: verifyCandidate.id,
      name: verifyCandidate.name,
      email: verifyCandidate.email
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
updateLoicBernardId()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
