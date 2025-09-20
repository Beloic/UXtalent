import { supabaseAdmin } from './src/config/supabase.js';

async function createMissingProfiles() {
  try {
    console.log('🔄 Création des profils manquants pour les utilisateurs récents...');
    
    // Liste des emails qui n'ont pas de profil candidat
    const emailsToCreate = [
      'be.loic23+28@gmail.com',
      'be.loic23+27@gmail.com',
      'be.loic23+26@gmail.com',
      'be.loic23+25@gmail.com'
    ];
    
    for (const email of emailsToCreate) {
      console.log(`\n🔄 Traitement de: ${email}`);
      
      // Vérifier si le profil existe déjà
      const { data: existingCandidate, error: checkError } = await supabaseAdmin
        .from('candidates')
        .select('id, name, email, status')
        .eq('email', email)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Erreur lors de la vérification pour ${email}:`, checkError);
        continue;
      }
      
      if (existingCandidate) {
        console.log(`✅ Profil existe déjà pour ${email}:`, existingCandidate);
        continue;
      }
      
      console.log(`❌ Profil manquant pour ${email}, création...`);
      
      // Créer le profil candidat avec statut 'pending'
      const candidateData = {
        name: email.split('@')[0], // Utiliser la partie avant @ comme nom
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
        status: 'pending'
      };
      
      const { data, error } = await supabaseAdmin
        .from('candidates')
        .insert([candidateData])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erreur lors de la création pour ${email}:`, error);
      } else {
        console.log(`✅ Profil créé avec succès pour ${email}:`, data);
      }
    }
    
    console.log('\n🎉 Traitement terminé !');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

createMissingProfiles();
