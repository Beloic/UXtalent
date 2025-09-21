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
    
    console.log(`📊 ${authUsers.users.length} utilisateurs Auth trouvés\n`);
    
    // 2. Récupérer tous les emails des candidats
    console.log('👤 2. Récupération des candidats...');
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .select('email');
    
    if (candidatesError) {
      console.error('❌ Erreur lors de la récupération des candidats:', candidatesError.message);
      return;
    }
    
    const candidateEmails = new Set(candidates.map(c => c.email));
    console.log(`👤 ${candidates.length} candidats trouvés\n`);
    
    // 3. Récupérer tous les emails des recruteurs
    console.log('🏢 3. Récupération des recruteurs...');
    const { data: recruiters, error: recruitersError } = await supabaseAdmin
      .from('recruiters')
      .select('email');
    
    if (recruitersError) {
      console.error('❌ Erreur lors de la récupération des recruteurs:', recruitersError.message);
      return;
    }
    
    const recruiterEmails = new Set(recruiters.map(r => r.email));
    console.log(`🏢 ${recruiters.length} recruteurs trouvés\n`);
    
    // 4. Identifier les utilisateurs orphelins
    console.log('🔍 4. Identification des utilisateurs orphelins...');
    const orphanedUsers = authUsers.users.filter(user => {
      const email = user.email;
      return !candidateEmails.has(email) && !recruiterEmails.has(email);
    });
    
    console.log(`⚠️  ${orphanedUsers.length} utilisateurs orphelins identifiés\n`);
    
    if (orphanedUsers.length === 0) {
      console.log('✅ Aucun utilisateur orphelin trouvé !');
      return;
    }
    
    // 5. Afficher les détails des orphelins
    console.log('📋 5. Détails des utilisateurs orphelins :');
    orphanedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      - ID: ${user.id}`);
      console.log(`      - Créé: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`      - Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log('');
    });
    
    // 6. Demander confirmation pour la suppression
    const shouldDelete = process.argv.includes('--force');
    
    if (!shouldDelete) {
      console.log('⚠️  MODE ANALYSE SEULEMENT');
      console.log('Pour supprimer les utilisateurs orphelins, utilisez: node cleanup-orphaned-auth-users.js --force');
      return;
    }
    
    console.log('🗑️  6. Suppression des utilisateurs orphelins...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const user of orphanedUsers) {
      try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (error) {
          console.error(`❌ Erreur lors de la suppression de ${user.email}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ ${user.email} supprimé`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${user.email}:`, error.message);
        errorCount++;
      }
    }
    
    // 7. Rapport final
    console.log('\n📊 RAPPORT FINAL');
    console.log('================');
    console.log(`📊 Utilisateurs Auth: ${authUsers.users.length}`);
    console.log(`👤 Candidats: ${candidates.length}`);
    console.log(`🏢 Recruteurs: ${recruiters.length}`);
    console.log(`⚠️  Orphelins identifiés: ${orphanedUsers.length}`);
    console.log(`✅ Supprimés avec succès: ${deletedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    
    if (deletedCount > 0) {
      console.log('\n🎉 Nettoyage terminé !');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

// Exécuter le nettoyage
cleanupOrphanedAuthUsers();
