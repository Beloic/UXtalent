import { supabaseAdmin } from './src/config/supabase.js';

async function testSignupFlow() {
  try {
    console.log('🧪 Test du flux d\'inscription...');
    
    // Simuler un utilisateur qui vient de s'inscrire
    const testUser = {
      id: 'test-user-id',
      email: 'test-signup-flow@example.com',
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        role: 'candidate'
      }
    };
    
    console.log('🔄 Simulation de la création automatique du profil...');
    
    // Vérifier si le profil existe déjà
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('candidates')
      .select('id')
      .eq('email', testUser.email)
      .single()
    
    if (existingProfile) {
      console.log('✅ Profil candidat existe déjà');
      return;
    }
    
    if (checkError && checkError.code === 'PGRST116') {
      // Profil n'existe pas, on peut le créer
      console.log('🆕 Création automatique du profil candidat...');
      
      const candidateData = {
        name: testUser.user_metadata?.first_name && testUser.user_metadata?.last_name 
          ? `${testUser.user_metadata.first_name} ${testUser.user_metadata.last_name}`
          : testUser.email?.split('@')[0] || 'Nouveau Candidat',
        email: testUser.email,
        bio: 'Profil créé automatiquement lors de l\'inscription.',
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
      
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('candidates')
        .insert([candidateData])
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Erreur lors de la création:', createError);
      } else {
        console.log('✅ Profil candidat créé avec succès:', newProfile);
        
        // Supprimer le test
        await supabaseAdmin
          .from('candidates')
          .delete()
          .eq('id', newProfile.id);
        console.log('🗑️ Profil de test supprimé');
      }
    } else if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

testSignupFlow();
