#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const createRecruiterProfile = async (email) => {
  console.log(`🏢 CRÉATION DU PROFIL RECRUTEUR: ${email}`);
  console.log('==========================================\n');
  
  try {
    // 1. Vérifier si la table recruiters existe
    console.log('🔍 1. Vérification de la table recruiters...');
    
    const { data: testData, error: testError } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Table recruiters non trouvée:', testError.message);
      console.log('\n💡 Veuillez d\'abord exécuter le script SQL dans Supabase Dashboard');
      console.log('   Fichier: create-recruiters-table.sql');
      return;
    }
    
    console.log('✅ Table recruiters accessible');
    
    // 2. Vérifier si le profil existe déjà
    console.log('\n🔍 2. Vérification de l\'existence du profil...');
    
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      console.log('⚠️  Profil recruteur existe déjà:');
      console.log(`   - ID: ${existingProfile.id}`);
      console.log(`   - Plan: ${existingProfile.plan_type}`);
      console.log(`   - Statut: ${existingProfile.subscription_status}`);
      console.log(`   - Créé: ${new Date(existingProfile.created_at).toLocaleString('fr-FR')}`);
      return;
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Erreur lors de la vérification:', checkError.message);
      return;
    }
    
    console.log('✅ Aucun profil existant trouvé');
    
    // 3. Créer le profil recruteur
    console.log('\n🏢 3. Création du profil recruteur...');
    
    const recruiterData = {
      email: email,
      name: 'Loic Bernard',
      company: 'UX Jobs Pro',
      phone: '',
      website: '',
      plan_type: 'max',
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 an
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
      notes: 'Profil créé manuellement pour l\'utilisateur existant',
      last_login: null
    };
    
    const { data: newRecruiter, error: createError } = await supabaseAdmin
      .from('recruiters')
      .insert([recruiterData])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Erreur lors de la création:', createError.message);
      return;
    }
    
    console.log('✅ Profil recruteur créé avec succès !');
    console.log('\n📊 Détails du profil créé:');
    console.log(`   - ID: ${newRecruiter.id}`);
    console.log(`   - Email: ${newRecruiter.email}`);
    console.log(`   - Nom: ${newRecruiter.name}`);
    console.log(`   - Entreprise: ${newRecruiter.company}`);
    console.log(`   - Plan: ${newRecruiter.plan_type}`);
    console.log(`   - Statut: ${newRecruiter.subscription_status}`);
    console.log(`   - Offres max: ${newRecruiter.max_job_posts}`);
    console.log(`   - Contacts max: ${newRecruiter.max_candidate_contacts}`);
    console.log(`   - Expire le: ${new Date(newRecruiter.subscription_end_date).toLocaleDateString('fr-FR')}`);
    
    // 4. Vérification finale
    console.log('\n🔍 4. Vérification finale...');
    
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('email', email)
      .single();
    
    if (verifyError) {
      console.log('❌ Erreur de vérification:', verifyError.message);
    } else {
      console.log('✅ Profil vérifié et accessible');
      console.log(`📊 Total recruteurs: ${verifyData ? '1' : '0'}`);
    }
    
    console.log('\n🎉 Profil recruteur créé avec succès !');
    console.log('💡 Vous pouvez maintenant vous connecter avec cet email');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

// Créer le profil pour l'email spécifique
const emailToCreate = 'be.loic23@gmail.com';
createRecruiterProfile(emailToCreate);
