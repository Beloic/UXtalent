import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'be.loic23@gmail.com';

const debugUserRole = async () => {
  console.log(`🔍 DEBUG DU RÔLE UTILISATEUR: ${TARGET_EMAIL}`);
  console.log('==========================================\n');

  try {
    // 1. Récupérer tous les utilisateurs Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const targetUser = authUsers.users.find(user => user.email === TARGET_EMAIL);

    if (!targetUser) {
      console.log(`❌ Utilisateur ${TARGET_EMAIL} non trouvé dans Supabase Auth.`);
      return;
    }

    console.log('👤 Utilisateur Auth trouvé :');
    console.log(`   - ID: ${targetUser.id}`);
    console.log(`   - Email: ${targetUser.email}`);
    console.log(`   - Créé: ${new Date(targetUser.created_at).toLocaleString('fr-FR')}`);
    console.log(`   - Email confirmé: ${targetUser.email_confirmed_at ? 'Oui' : 'Non'}`);
    console.log(`   - Banni: ${targetUser.banned_until ? 'Oui' : 'Non'}`);
    console.log(`   - Dernière connexion: ${targetUser.last_sign_in_at ? new Date(targetUser.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}\n`);

    // 2. Vérifier les métadonnées utilisateur
    console.log('📋 Métadonnées utilisateur :');
    if (targetUser.user_metadata) {
      console.log('   - user_metadata:', JSON.stringify(targetUser.user_metadata, null, 2));
      console.log(`   - Rôle: ${targetUser.user_metadata.role || 'NON DÉFINI'}`);
    } else {
      console.log('   - Aucune métadonnée utilisateur');
    }

    // 3. Vérifier le profil recruteur
    console.log('\n🏢 Profil recruteur :');
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('email', TARGET_EMAIL)
      .single();

    if (recruiterError && recruiterError.code !== 'PGRST116') throw recruiterError;

    if (recruiter) {
      console.log('   - Profil recruteur trouvé :');
      console.log(`     * ID: ${recruiter.id}`);
      console.log(`     * Plan: ${recruiter.plan_type}`);
      console.log(`     * Statut: ${recruiter.subscription_status}`);
      console.log(`     * Créé: ${new Date(recruiter.created_at).toLocaleString('fr-FR')}`);
    } else {
      console.log('   - Aucun profil recruteur trouvé');
    }

    // 4. Test de l'API /api/recruiters/me
    console.log('\n🔌 Test de l\'API /api/recruiters/me :');
    try {
      // Créer une session temporaire pour tester l'API
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: TARGET_EMAIL,
        options: {
          redirectTo: 'http://localhost:3000'
        }
      });

      if (sessionError) {
        console.log(`   - Erreur génération lien: ${sessionError.message}`);
      } else {
        console.log('   - Lien magique généré avec succès');
        console.log(`   - URL: ${sessionData.properties.action_link}`);
      }
    } catch (apiError) {
      console.log(`   - Erreur test API: ${apiError.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error.message);
  }
};

debugUserRole();
