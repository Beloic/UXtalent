import { supabaseAdmin } from './src/config/supabase.js';

async function debugSignup() {
  try {
    console.log('🔍 Vérification des utilisateurs récents dans auth.users...');
    
    // Récupérer les utilisateurs récents
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      return;
    }
    
    // Trier par date de création (plus récents en premier)
    const recentUsers = data.users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    console.log('📋 Les 5 utilisateurs les plus récents:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Créé le: ${user.created_at}`);
      console.log(`   Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`   Rôle: ${user.user_metadata?.role || 'Non défini'}`);
      console.log(`   Métadonnées:`, user.user_metadata);
      console.log('');
    });
    
    // Vérifier les candidats récents
    console.log('🔍 Vérification des candidats récents...');
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .select('id, name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (candidatesError) {
      console.error('❌ Erreur lors de la récupération des candidats:', candidatesError);
      return;
    }
    
    console.log('📋 Les 5 candidats les plus récents:');
    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email})`);
      console.log(`   ID: ${candidate.id} | Statut: ${candidate.status} | Créé: ${candidate.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

debugSignup();
