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

const deleteSpecificUser = async (email) => {
  console.log(`🗑️ SUPPRESSION DE L'UTILISATEUR AUTH: ${email}`);
  console.log('==========================================\n');
  
  try {
    // 1. Récupérer tous les utilisateurs Auth
    console.log('📋 1. Récupération des utilisateurs Auth...');
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    console.log(`📊 ${authUsers.users.length} utilisateurs Auth trouvés\n`);
    
    // 2. Trouver l'utilisateur spécifique
    const targetUser = authUsers.users.find(user => user.email === email);
    
    if (!targetUser) {
      console.log(`❌ Utilisateur ${email} non trouvé dans Supabase Auth`);
      return;
    }
    
    console.log('👤 2. Utilisateur trouvé :');
    console.log(`   - ID: ${targetUser.id}`);
    console.log(`   - Email: ${targetUser.email}`);
    console.log(`   - Créé: ${new Date(targetUser.created_at).toLocaleString('fr-FR')}`);
    console.log(`   - Email confirmé: ${targetUser.email_confirmed_at ? 'Oui' : 'Non'}`);
    console.log(`   - Dernière connexion: ${targetUser.last_sign_in_at ? new Date(targetUser.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}\n`);
    
    // 3. Vérifier les sessions (approche alternative)
    console.log('🔍 3. Vérification des sessions...');
    console.log('✅ Passage à la suppression directe');
    
    console.log('\n🗑️ 4. Suppression de l\'utilisateur...');
    
    // 4. Supprimer l'utilisateur
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
    
    if (deleteError) {
      console.log(`❌ Erreur lors de la suppression: ${deleteError.message}`);
      
      // Essayer une approche alternative
      console.log('\n🔄 Tentative alternative...');
      
      // Désactiver l'utilisateur d'abord
      const { error: disableError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email_confirm: false,
        ban_duration: '876000h' // Bannir pour 100 ans
      });
      
      if (disableError) {
        console.log(`❌ Impossible de désactiver l'utilisateur: ${disableError.message}`);
      } else {
        console.log('✅ Utilisateur désactivé/banni');
        
        // Réessayer la suppression
        const { error: retryError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
        
        if (retryError) {
          console.log(`❌ Suppression toujours impossible: ${retryError.message}`);
        } else {
          console.log('✅ Utilisateur supprimé avec succès !');
        }
      }
    } else {
      console.log('✅ Utilisateur supprimé avec succès !');
    }
    
    // 5. Vérification
    console.log('\n🔍 5. Vérification de la suppression...');
    const { data: verifyUsers } = await supabaseAdmin.auth.admin.listUsers();
    const stillExists = verifyUsers.users.find(user => user.email === email);
    
    if (stillExists) {
      console.log('⚠️  L\'utilisateur existe encore dans la base');
    } else {
      console.log('✅ Utilisateur complètement supprimé de Supabase Auth');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

// Supprimer l'utilisateur spécifique
const emailToDelete = 'be.loic23+5@gmail.com';
deleteSpecificUser(emailToDelete);
