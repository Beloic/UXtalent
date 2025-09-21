import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './env.production' });

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const cleanupOrphanedAuthUsers = async () => {
  console.log('🧹 NETTOYAGE DES UTILISATEURS AUTH ORPHELINS');
  console.log('==========================================\n');
  
  try {
    // 1. Récupérer tous les utilisateurs Auth
    console.log('📋 1. Récupération des utilisateurs Supabase Auth...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs Auth:', authError.message);
      return;
    }
    
    console.log(`✅ ${authUsers.users.length} utilisateurs trouvés dans Supabase Auth\n`);
    
    // 2. Récupérer tous les emails des candidats
    console.log('👤 2. Récupération des emails des candidats...');
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .select('email');
    
    if (candidatesError) {
      console.error('❌ Erreur lors de la récupération des candidats:', candidatesError.message);
      return;
    }
    
    const candidateEmails = new Set(candidates.map(c => c.email));
    console.log(`✅ ${candidates.length} candidats trouvés\n`);
    
    // 3. Récupérer tous les emails des recruteurs (si la table existe)
    console.log('🏢 3. Récupération des emails des recruteurs...');
    let recruiterEmails = new Set();
    
    try {
      const { data: recruiters, error: recruitersError } = await supabaseAdmin
        .from('recruiters')
        .select('email');
      
      if (!recruitersError && recruiters) {
        recruiterEmails = new Set(recruiters.map(r => r.email));
        console.log(`✅ ${recruiters.length} recruteurs trouvés\n`);
      } else {
        console.log('⚠️  Table recruiters non trouvée ou vide\n');
      }
    } catch (error) {
      console.log('⚠️  Table recruiters non accessible\n');
    }
    
    // 4. Identifier les utilisateurs Auth orphelins
    console.log('🔍 4. Identification des utilisateurs Auth orphelins...');
    const orphanedUsers = [];
    const validUsers = [];
    
    for (const user of authUsers.users) {
      const email = user.email;
      const isCandidate = candidateEmails.has(email);
      const isRecruiter = recruiterEmails.has(email);
      
      if (!isCandidate && !isRecruiter) {
        orphanedUsers.push(user);
      } else {
        validUsers.push(user);
      }
    }
    
    console.log(`✅ ${validUsers.length} utilisateurs Auth valides`);
    console.log(`⚠️  ${orphanedUsers.length} utilisateurs Auth orphelins trouvés\n`);
    
    // 5. Afficher les détails des utilisateurs orphelins
    if (orphanedUsers.length > 0) {
      console.log('📋 UTILISATEURS AUTH ORPHELINS:');
      console.log('===============================');
      
      orphanedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Créé le: ${user.created_at}`);
        console.log(`   - Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);
        console.log(`   - Dernière connexion: ${user.last_sign_in_at || 'Jamais'}`);
        console.log('');
      });
      
      // 6. Demander confirmation pour la suppression
      console.log('⚠️  ATTENTION: Ces utilisateurs seront supprimés de Supabase Auth');
      console.log('💡 Cela permettra de libérer leurs emails pour de nouvelles inscriptions\n');
      
      // Pour un script automatisé, on peut ajouter un paramètre --force
      const shouldDelete = process.argv.includes('--force');
      
      if (shouldDelete) {
        console.log('🚀 Suppression automatique activée (--force)\n');
        await deleteOrphanedUsers(orphanedUsers);
      } else {
        console.log('💡 Pour supprimer automatiquement, relancez avec: node cleanup-orphaned-auth-users.js --force');
        console.log('💡 Ou modifiez le script pour activer la suppression automatique\n');
      }
    } else {
      console.log('🎉 Aucun utilisateur Auth orphelin trouvé !');
      console.log('✅ Tous les utilisateurs Auth ont un profil correspondant dans les tables métier');
    }
    
    // 7. Résumé final
    console.log('\n📊 RÉSUMÉ:');
    console.log('==========');
    console.log(`🔐 Utilisateurs Auth totaux: ${authUsers.users.length}`);
    console.log(`✅ Utilisateurs Auth valides: ${validUsers.length}`);
    console.log(`⚠️  Utilisateurs Auth orphelins: ${orphanedUsers.length}`);
    console.log(`👤 Candidats en base: ${candidates.length}`);
    console.log(`🏢 Recruteurs en base: ${recruiterEmails.size}`);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
};

const deleteOrphanedUsers = async (orphanedUsers) => {
  console.log('🗑️ SUPPRESSION DES UTILISATEURS ORPHELINS');
  console.log('========================================\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of orphanedUsers) {
    try {
      console.log(`🗑️ Suppression de ${user.email}...`);
      
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (error) {
        console.error(`❌ Erreur pour ${user.email}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${user.email} supprimé avec succès`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Erreur inattendue pour ${user.email}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 RÉSULTATS DE LA SUPPRESSION:');
  console.log('===============================');
  console.log(`✅ Suppressions réussies: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Nettoyage terminé ! Les emails sont maintenant disponibles pour de nouvelles inscriptions.');
  }
};

// Exécuter le nettoyage
cleanupOrphanedAuthUsers();
