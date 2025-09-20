import { supabaseAdmin } from './src/config/supabase.js';

async function checkStatusConstraint() {
  try {
    console.log('🔍 Vérification des statuts existants dans la table candidates...');
    
    // Récupérer tous les statuts uniques
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('status')
      .not('status', 'is', null);
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    // Extraire les statuts uniques
    const uniqueStatuses = [...new Set(data.map(candidate => candidate.status))];
    
    console.log('📋 Statuts acceptés dans la table candidates:');
    uniqueStatuses.forEach(status => {
      console.log(`   - "${status}"`);
    });
    
    // Tester avec 'pending' au lieu de 'new'
    console.log('\n🔄 Test avec le statut "pending"...');
    
    const testData = {
      name: 'Test Candidat',
      email: 'test@example.com',
      bio: 'Test de création',
      title: '',
      location: '',
      remote: 'hybrid',
      skills: [],
      portfolio: '',
      linkedin: '',
      github: '',
      daily_rate: null,
      annual_salary: null,
      status: 'pending' // Utiliser 'pending' au lieu de 'new'
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('candidates')
      .insert([testData])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur avec "pending":', insertError);
    } else {
      console.log('✅ Création réussie avec "pending":', insertData);
      
      // Supprimer le test
      await supabaseAdmin
        .from('candidates')
        .delete()
        .eq('id', insertData.id);
      console.log('🗑️ Test supprimé');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

checkStatusConstraint();
