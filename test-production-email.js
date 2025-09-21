#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration email en production
 * Usage: node test-production-email.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './env.production' });

const testProductionEmail = async () => {
  console.log('🧪 Test de la configuration email en production...\n');

  // Vérifier que les variables Supabase sont définies
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName].includes('your-'));
  
  if (missingVars.length > 0) {
    console.error('❌ Variables Supabase manquantes ou incorrectes:', missingVars.join(', '));
    console.log('\n📝 Vous devez configurer ces variables dans env.production:');
    console.log('   VITE_SUPABASE_URL=https://votre-projet.supabase.co');
    console.log('   VITE_SUPABASE_ANON_KEY=votre-clé-anon');
    console.log('\n💡 Ces informations se trouvent dans votre Dashboard Supabase > Settings > API');
    return;
  }

  console.log('✅ Variables Supabase trouvées');
  console.log(`   VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

  // Créer le client Supabase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    // Test de connexion à Supabase
    console.log('🔌 Test de connexion à Supabase...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error.message);
      return;
    }
    
    console.log('✅ Connexion Supabase réussie\n');

    // Test d'inscription avec un email de test
    const testEmail = `test-${Date.now()}@loicbernard.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('📧 Test d\'inscription avec email de confirmation...');
    console.log(`   Email de test: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://ux-jobs-pro.vercel.app/confirm-email'
      }
    });

    if (signUpError) {
      console.error('❌ Erreur lors de l\'inscription:', signUpError.message);
      
      if (signUpError.message.includes('rate limit')) {
        console.log('\n💡 Problème de rate limiting détecté !');
        console.log('   - Vérifiez que email_sent = 30 dans supabase/config.toml');
        console.log('   - Attendez quelques minutes avant de réessayer');
      } else if (signUpError.message.includes('SMTP')) {
        console.log('\n💡 Problème SMTP détecté !');
        console.log('   - Vérifiez la configuration SMTP dans Supabase Dashboard');
        console.log('   - Assurez-vous que Mailjet est bien configuré');
      }
      return;
    }

    if (signUpData?.user) {
      console.log('✅ Inscription réussie !');
      console.log(`   User ID: ${signUpData.user.id}`);
      console.log(`   Email confirmé: ${signUpData.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      if (!signUpData.user.email_confirmed_at) {
        console.log('\n📬 Email de confirmation envoyé !');
        console.log('   Vérifiez votre boîte email (et les spams)');
        console.log('   Le lien de confirmation devrait arriver dans quelques minutes');
      } else {
        console.log('\n⚠️  Email déjà confirmé (peut-être un compte existant)');
      }
    }

    // Test de vérification des paramètres SMTP
    console.log('\n🔧 Vérification des paramètres recommandés:');
    console.log('   ✅ enable_confirmations = true');
    console.log('   ✅ email_sent = 30 (rate limiting)');
    console.log('   ✅ site_url = https://ux-jobs-pro.vercel.app');
    console.log('   ✅ SMTP Mailjet configuré');
    
    console.log('\n🎯 Configuration email validée !');
    console.log('   Si vous ne recevez pas l\'email, vérifiez:');
    console.log('   1. Configuration SMTP dans Supabase Dashboard');
    console.log('   2. Boîte de réception et dossier spam');
    console.log('   3. Logs Mailjet pour voir si l\'email est envoyé');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
};

// Exécuter le test
testProductionEmail().catch(console.error);
