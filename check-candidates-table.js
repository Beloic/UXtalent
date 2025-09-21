import { supabaseAdmin } from './src/config/supabase.js';

async function checkCandidatesTable() {
  console.log('🔍 Vérification de la structure de la table candidates...\n');

  try {
    // Vérifier la structure de la table
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('📋 Colonnes disponibles dans la table candidates:');
      console.log(Object.keys(columns[0]));
      
      // Vérifier si user_id existe
      if ('user_id' in columns[0]) {
        console.log('✅ Colonne user_id trouvée');
      } else {
        console.log('❌ Colonne user_id manquante');
        console.log('📝 Colonnes disponibles:', Object.keys(columns[0]));
      }
    } else {
      console.log('📝 Table candidates vide, vérification de la structure...');
      
      // Essayer d'insérer un enregistrement de test pour voir la structure
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        status: 'new'
      };
      
      const { data: insertResult, error: insertError } = await supabaseAdmin
        .from('candidates')
        .insert([testData])
        .select()
        .single();
        
      if (insertError) {
        console.log('❌ Erreur lors de l\'insertion de test:', insertError.message);
      } else {
        console.log('✅ Structure de la table:');
        console.log(Object.keys(insertResult));
        
        // Supprimer l'enregistrement de test
        await supabaseAdmin
          .from('candidates')
          .delete()
          .eq('id', insertResult.id);
        console.log('🧹 Enregistrement de test supprimé');
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkCandidatesTable();
