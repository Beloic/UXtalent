import { supabaseAdmin } from './src/config/supabase.js';

async function migrateStatusConstraint() {
  try {
    console.log('🔄 Migration de la contrainte de vérification pour la colonne status...');
    
    // 1. Supprimer l'ancienne contrainte
    console.log('🗑️ Suppression de l\'ancienne contrainte check_status...');
    const { error: dropError } = await supabaseAdmin.rpc('exec', {
      sql: 'ALTER TABLE candidates DROP CONSTRAINT IF EXISTS check_status;'
    });
    
    if (dropError) {
      console.error('❌ Erreur lors de la suppression de l\'ancienne contrainte:', dropError);
      return;
    }
    
    console.log('✅ Ancienne contrainte supprimée');
    
    // 2. Ajouter la nouvelle contrainte
    console.log('➕ Ajout de la nouvelle contrainte qui accepte "new", "pending", "approved", "rejected"...');
    const { error: addError } = await supabaseAdmin.rpc('exec', {
      sql: `ALTER TABLE candidates ADD CONSTRAINT check_status 
            CHECK (status IN ('new', 'pending', 'approved', 'rejected'));`
    });
    
    if (addError) {
      console.error('❌ Erreur lors de l\'ajout de la nouvelle contrainte:', addError);
      return;
    }
    
    console.log('✅ Nouvelle contrainte ajoutée');
    
    // 3. Tester la nouvelle contrainte
    console.log('🧪 Test de la nouvelle contrainte avec un profil de test...');
    
    const testData = {
      name: 'Test Constraint',
      email: 'test-constraint@example.com',
      bio: 'Test de la nouvelle contrainte',
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
      console.error('❌ Erreur lors du test avec statut "new":', insertError);
    } else {
      console.log('✅ Test réussi ! Profil créé avec statut "new":', insertData);
      
      // Supprimer le test
      await supabaseAdmin
        .from('candidates')
        .delete()
        .eq('id', insertData.id);
      console.log('🗑️ Profil de test supprimé');
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('📋 La colonne status accepte maintenant: "new", "pending", "approved", "rejected"');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    console.log('\n📋 Alternative: Exécutez le script SQL directement dans Supabase Dashboard');
    console.log('1. Allez sur https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans "SQL Editor"');
    console.log('4. Copiez et exécutez le contenu du fichier update-status-constraint.sql');
  }
}

migrateStatusConstraint();
