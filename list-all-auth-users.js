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

const listAllAuthUsers = async () => {
  console.log('👥 LISTE COMPLÈTE DES UTILISATEURS AUTH');
  console.log('==========================================\n');
  
  try {
    // Récupérer tous les utilisateurs Auth
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Erreur lors de la récupération:', error.message);
      return;
    }
    
    console.log(`📊 ${authUsers.users.length} utilisateur(s) Auth trouvé(s)\n`);
    
    if (authUsers.users.length === 0) {
      console.log('✅ Aucun utilisateur Auth trouvé');
      return;
    }
    
    // Afficher tous les utilisateurs
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Créé: ${new Date(user.created_at).toLocaleString('fr-FR')}`);
      console.log(`   - Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`   - Dernière connexion: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}`);
      console.log(`   - Banni: ${user.banned_until ? 'Oui' : 'Non'}`);
      if (user.banned_until) {
        console.log(`   - Banni jusqu'au: ${new Date(user.banned_until).toLocaleString('fr-FR')}`);
      }
      console.log('');
    });
    
    // Vérifier spécifiquement be.loic23@gmail.com
    console.log('🔍 Vérification spécifique de be.loic23@gmail.com...');
    const targetUser = authUsers.users.find(user => user.email === 'be.loic23@gmail.com');
    
    if (targetUser) {
      console.log('✅ Utilisateur be.loic23@gmail.com trouvé:');
      console.log(`   - ID: ${targetUser.id}`);
      console.log(`   - Statut: ${targetUser.banned_until ? 'Banni' : 'Actif'}`);
      if (targetUser.banned_until) {
        console.log(`   - Banni jusqu'au: ${new Date(targetUser.banned_until).toLocaleString('fr-FR')}`);
      }
    } else {
      console.log('❌ Utilisateur be.loic23@gmail.com NON trouvé dans Supabase Auth');
      console.log('💡 Il a probablement été supprimé avec succès');
    }
    
    // Vérifier les recruteurs
    console.log('\n🏢 Vérification des recruteurs...');
    const { data: recruiters, error: recruitersError } = await supabaseAdmin
      .from('recruiters')
      .select('*');
    
    if (recruitersError) {
      console.log('❌ Erreur lors de la récupération des recruteurs:', recruitersError.message);
    } else {
      console.log(`📊 ${recruiters.length} recruteur(s) trouvé(s)`);
      recruiters.forEach((recruiter, index) => {
        console.log(`${index + 1}. ${recruiter.email} (${recruiter.plan_type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

listAllAuthUsers();
