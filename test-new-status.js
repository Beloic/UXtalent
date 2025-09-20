import { supabaseAdmin } from './src/config/supabase.js';

async function testNewStatus() {
  try {
    console.log('🧪 Test du statut "new" dans la table candidates...');
    
    const testData = {
      name: 'Test New Status',
      email: 'test-new-status@example.com',
      bio: 'Test du statut new',
      title: '',
      location: '',
      remote: 'hybrid',
      skills: [],
      portfolio: '',
      linkedin: '',
      github: '',
      daily_rate: null,
      annual_salary: null,
      status: 'new'
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('candidates')
      .insert([testData])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Le statut "new" n\'est pas accepté:', insertError.message);
      console.log('\n📋 Vous devez exécuter le script SQL dans Supabase Dashboard:');
      console.log('1. Allez sur https://supabase.com/dashboard');
      console.log('2. Sélectionnez votre projet');
      console.log('3. Allez dans "SQL Editor"');
      console.log('4. Exécutez:');
      console.log('   ALTER TABLE candidates DROP CONSTRAINT IF EXISTS check_status;');
      console.log('   ALTER TABLE candidates ADD CONSTRAINT check_status CHECK (status IN (\'new\', \'pending\', \'approved\', \'rejected\'));');
    } else {
      console.log('✅ Le statut "new" est accepté ! Profil créé:', insertData);
      
      // Supprimer le test
      await supabaseAdmin
        .from('candidates')
        .delete()
        .eq('id', insertData.id);
      console.log('🗑️ Profil de test supprimé');
      
      console.log('\n🎉 La contrainte a été mise à jour avec succès !');
      console.log('📋 La colonne status accepte maintenant: "new", "pending", "approved", "rejected"');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

testNewStatus();
