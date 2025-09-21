import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'be.loic23@gmail.com';
const TARGET_PASSWORD = 'TempPassword123!'; // Mot de passe temporaire
const TARGET_NAME = 'Loic Bernard';
const TARGET_COMPANY = 'UX Jobs Pro';
const TARGET_PLAN = 'max';

const createCompleteRecruiter = async () => {
  console.log(`🏢 CRÉATION COMPLÈTE DU RECRUTEUR: ${TARGET_EMAIL}`);
  console.log('==========================================\n');

  try {
    // 1. Vérifier si l'utilisateur Auth existe déjà
    console.log('🔍 1. Vérification de l\'utilisateur Auth...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const existingAuthUser = authUsers.users.find(user => user.email === TARGET_EMAIL);

    if (existingAuthUser) {
      console.log(`⚠️  Utilisateur Auth ${TARGET_EMAIL} existe déjà. ID: ${existingAuthUser.id}`);
      console.log(`   - Créé: ${new Date(existingAuthUser.created_at).toLocaleString('fr-FR')}`);
      console.log(`   - Email confirmé: ${existingAuthUser.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`   - Banni: ${existingAuthUser.banned_until ? 'Oui' : 'Non'}\n`);
    } else {
      console.log('✅ Aucun utilisateur Auth existant trouvé\n');
      
      // Créer l'utilisateur Auth
      console.log('👤 2. Création de l\'utilisateur Auth...');
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: TARGET_EMAIL,
        password: TARGET_PASSWORD,
        email_confirm: true, // Confirmer automatiquement l'email
        user_metadata: {
          role: 'recruiter',
          name: TARGET_NAME,
          company: TARGET_COMPANY
        }
      });

      if (createAuthError) throw createAuthError;
      console.log(`✅ Utilisateur Auth créé avec succès ! ID: ${newAuthUser.user.id}\n`);
    }

    // 2. Vérifier si le profil recruteur existe déjà
    console.log('🔍 3. Vérification du profil recruteur...');
    const { data: existingRecruiter, error: recruiterError } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('email', TARGET_EMAIL)
      .single();

    if (recruiterError && recruiterError.code !== 'PGRST116') throw recruiterError;

    if (existingRecruiter) {
      console.log(`⚠️  Profil recruteur existe déjà. ID: ${existingRecruiter.id}`);
      console.log(`   - Plan: ${existingRecruiter.plan_type}`);
      console.log(`   - Statut: ${existingRecruiter.subscription_status}`);
      console.log(`   - Créé: ${new Date(existingRecruiter.created_at).toLocaleString('fr-FR')}\n`);
      
      // Mettre à jour le profil existant avec les nouvelles données
      console.log('🔄 Mise à jour du profil existant...');
      const { data: updatedRecruiter, error: updateError } = await supabaseAdmin
        .from('recruiters')
        .update({
          name: TARGET_NAME,
          company: TARGET_COMPANY,
          plan_type: TARGET_PLAN,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          max_job_posts: 50,
          max_candidate_contacts: 1000,
          max_featured_jobs: 10,
          status: 'active',
          notes: 'Profil mis à jour via script complet',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecruiter.id)
        .select()
        .single();

      if (updateError) throw updateError;
      console.log('✅ Profil recruteur mis à jour avec succès !\n');
    } else {
      console.log('✅ Aucun profil recruteur existant trouvé\n');
      
      // Récupérer l'ID de l'utilisateur Auth (nouveau ou existant)
      const authUser = authUsers.users.find(user => user.email === TARGET_EMAIL);
      if (!authUser) {
        throw new Error('Utilisateur Auth non trouvé après création');
      }

      // Créer le profil recruteur
      console.log('🏢 4. Création du profil recruteur...');
      const recruiterData = {
        user_id: authUser.id,
        email: TARGET_EMAIL,
        name: TARGET_NAME,
        company: TARGET_COMPANY,
        phone: '',
        website: '',
        plan_type: TARGET_PLAN,
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end_date: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        payment_method: null,
        max_job_posts: 50,
        max_candidate_contacts: 1000,
        max_featured_jobs: 10,
        total_jobs_posted: 0,
        total_candidates_contacted: 0,
        total_applications_received: 0,
        status: 'active',
        notes: 'Profil créé via script complet',
        last_login: null
      };

      const { data: newRecruiter, error: createRecruiterError } = await supabaseAdmin
        .from('recruiters')
        .insert([recruiterData])
        .select()
        .single();

      if (createRecruiterError) throw createRecruiterError;
      console.log('✅ Profil recruteur créé avec succès !\n');
    }

    // 3. Vérification finale
    console.log('🔍 5. Vérification finale...');
    
    // Vérifier Auth
    const { data: finalAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const finalAuthUser = finalAuthUsers.users.find(user => user.email === TARGET_EMAIL);
    
    // Vérifier Recruiter
    const { data: finalRecruiters } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('email', TARGET_EMAIL)
      .single();

    console.log('📊 Résumé final:');
    console.log(`   - Utilisateur Auth: ${finalAuthUser ? '✅ Existe' : '❌ Manquant'}`);
    if (finalAuthUser) {
      console.log(`     * ID: ${finalAuthUser.id}`);
      console.log(`     * Email confirmé: ${finalAuthUser.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`     * Banni: ${finalAuthUser.banned_until ? 'Oui' : 'Non'}`);
    }
    
    console.log(`   - Profil Recruteur: ${finalRecruiters ? '✅ Existe' : '❌ Manquant'}`);
    if (finalRecruiters) {
      console.log(`     * ID: ${finalRecruiters.id}`);
      console.log(`     * Plan: ${finalRecruiters.plan_type}`);
      console.log(`     * Statut: ${finalRecruiters.subscription_status}`);
      console.log(`     * Offres max: ${finalRecruiters.max_job_posts}`);
      console.log(`     * Contacts max: ${finalRecruiters.max_candidate_contacts}`);
    }

    console.log('\n🎉 Recruteur créé/mis à jour avec succès !');
    console.log('💡 Vous pouvez maintenant vous connecter avec cet email');
    console.log(`🔑 Mot de passe temporaire: ${TARGET_PASSWORD}`);
    console.log('⚠️  N\'oubliez pas de changer le mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création complète du recruteur:', error.message);
  }
};

createCompleteRecruiter();
