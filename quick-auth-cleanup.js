import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const quickCleanup = async () => {
  console.log('🧹 NETTOYAGE RAPIDE AUTH');
  console.log('========================\n');
  
  try {
    // Récupérer tous les utilisateurs Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    // Récupérer tous les emails des candidats
    const { data: candidates } = await supabaseAdmin
      .from('candidates')
      .select('email');
    
    const candidateEmails = new Set(candidates.map(c => c.email));
    
    // Identifier les orphelins
    const orphanedUsers = authUsers.users.filter(user => 
      !candidateEmails.has(user.email)
    );
    
    console.log(`📊 ${authUsers.users.length} utilisateurs Auth`);
    console.log(`👤 ${candidates.length} candidats`);
    console.log(`⚠️  ${orphanedUsers.length} utilisateurs orphelins\n`);
    
    if (orphanedUsers.length === 0) {
      console.log('✅ Aucun utilisateur orphelin trouvé !');
      return;
    }
    
    console.log('🗑️ Suppression des utilisateurs orphelins...\n');
    
    let deletedCount = 0;
    
    for (const user of orphanedUsers) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`✅ ${user.email} supprimé`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Erreur ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Nettoyage terminé ! ${deletedCount} utilisateurs supprimés.`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

quickCleanup();
