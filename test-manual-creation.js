import { supabaseAdmin } from './src/config/supabase.js';

async function testManualCreation() {
  try {
    const email = 'be.loic23+28@gmail.com';
    console.log(`🔄 Test de création manuelle du profil pour: ${email}`);
    
    // Vérifier d'abord si le profil existe
    const { data: existingCandidate, error: checkError } = await supabaseAdmin
      .from('candidates')
      .select('id, name, email, status')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }
    
    if (existingCandidate) {
      console.log('✅ Profil existe déjà:', existingCandidate);
      return;
    }
    
    console.log('❌ Profil n\'existe pas, création...');
    
    // Créer le profil candidat avec statut 'new'
    const candidateData = {
      name: 'Nouveau Candidat',
      email: email,
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
    
    console.log('📤 Données à insérer:', candidateData);
    
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .insert([candidateData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      return;
    }
    
    console.log('✅ Profil créé avec succès:', data);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

testManualCreation();
