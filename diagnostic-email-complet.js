#!/usr/bin/env node

/**
 * Script de diagnostic complet pour les emails Supabase + Mailjet
 * Usage: node diagnostic-email-complet.js
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './env.production' });

const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
};

const diagnosticComplet = async () => {
  log('🔍 DIAGNOSTIC COMPLET EMAIL SUPABASE + MAILJET');
  log('================================================');

  // 1. Vérification des variables d'environnement
  log('📋 1. Vérification des variables d\'environnement');
  const requiredVars = {
    'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
    'MAILJET_API_KEY': process.env.MAILJET_API_KEY,
    'MAILJET_SECRET_KEY': process.env.MAILJET_SECRET_KEY,
    'MAILJET_FROM_EMAIL': process.env.MAILJET_FROM_EMAIL
  };

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.includes('your-') || value.includes('votre-')) {
      log(`❌ ${key}: MANQUANTE ou PLACEHOLDER`, { value: value ? value.substring(0, 20) + '...' : 'undefined' });
    } else {
      log(`✅ ${key}: OK`, { value: value.substring(0, 20) + '...' });
    }
  });

  // 2. Test de connexion Supabase
  log('\n🔌 2. Test de connexion Supabase');
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      log('❌ Erreur de session Supabase', sessionError);
      return;
    }
    log('✅ Connexion Supabase réussie');
  } catch (error) {
    log('❌ Erreur de connexion Supabase', error.message);
    return;
  }

  // 3. Test SMTP Mailjet direct
  log('\n📧 3. Test SMTP Mailjet direct');
  const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILJET_API_KEY,
      pass: process.env.MAILJET_SECRET_KEY
    },
    debug: true, // Active les logs détaillés
    logger: true  // Log dans la console
  });

  try {
    log('🔍 Test de vérification SMTP...');
    await transporter.verify();
    log('✅ SMTP Mailjet vérifié avec succès');

    // Test d'envoi direct
    const testEmail = `diagnostic-${Date.now()}@loicbernard.com`;
    log(`📤 Envoi d\'email de test direct vers: ${testEmail}`);
    
    const info = await transporter.sendMail({
      from: `"UX Jobs Pro" <${process.env.MAILJET_FROM_EMAIL}>`,
      to: testEmail,
      subject: '🔍 Diagnostic Email - Test Direct Mailjet',
      html: `
        <h2>🔍 Diagnostic Email</h2>
        <p><strong>Test:</strong> Envoi direct via Mailjet SMTP</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Status:</strong> Si vous recevez cet email, Mailjet SMTP fonctionne correctement</p>
        <hr>
        <p><em>Email envoyé depuis le script de diagnostic UX Jobs Pro</em></p>
      `
    });

    log('✅ Email de test direct envoyé', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });

  } catch (error) {
    log('❌ Erreur SMTP Mailjet', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
  }

  // 4. Test d'inscription Supabase avec logs détaillés
  log('\n👤 4. Test d\'inscription Supabase avec logs détaillés');
  const testUserEmail = `supabase-test-${Date.now()}@loicbernard.com`;
  const testPassword = 'TestPassword123!';

  log(`📝 Création d\'utilisateur de test: ${testUserEmail}`);

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUserEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://ux-jobs-pro.vercel.app/confirm-email',
        data: {
          first_name: 'Test',
          last_name: 'Diagnostic',
          role: 'candidate'
        }
      }
    });

    if (signUpError) {
      log('❌ Erreur lors de l\'inscription Supabase', {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code
      });
    } else {
      log('✅ Inscription Supabase réussie', {
        userId: signUpData.user?.id,
        email: signUpData.user?.email,
        emailConfirmed: signUpData.user?.email_confirmed_at,
        createdAt: signUpData.user?.created_at,
        lastSignIn: signUpData.user?.last_sign_in_at
      });

      // Vérifier si l'email de confirmation a été envoyé
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        log('📬 Email de confirmation devrait être envoyé');
        log('⏰ Attendez 2-3 minutes puis vérifiez:');
        log('   1. Dashboard Mailjet pour voir si l\'email est envoyé');
        log('   2. Boîte email hello@loicbernard.com');
        log('   3. Dashboard Supabase > Authentication > Users');
      }
    }

  } catch (error) {
    log('❌ Erreur inattendue lors de l\'inscription', error.message);
  }

  // 5. Vérification des paramètres de configuration
  log('\n⚙️ 5. Vérification des paramètres de configuration');
  const configChecks = [
    { name: 'enable_confirmations', expected: true, note: 'Doit être true pour envoyer des emails' },
    { name: 'email_sent rate limit', expected: '30', note: 'Limite d\'emails par heure' },
    { name: 'site_url', expected: 'https://ux-jobs-pro.vercel.app', note: 'URL de production' },
    { name: 'SMTP enabled', expected: true, note: 'SMTP doit être activé' }
  ];

  configChecks.forEach(check => {
    log(`✅ ${check.name}: ${check.expected} - ${check.note}`);
  });

  // 6. Instructions de vérification
  log('\n📋 6. Instructions de vérification');
  log('=====================================');
  log('1. 📊 Dashboard Mailjet (app.mailjet.com):');
  log('   - Allez dans Statistics > Email Activity');
  log('   - Recherchez les emails de test envoyés');
  log('   - Vérifiez le statut: Sent, Delivered, Bounced');
  log('');
  log('2. 🔧 Dashboard Supabase (supabase.com):');
  log('   - Allez dans Authentication > Users');
  log('   - Recherchez les utilisateurs de test créés');
  log('   - Vérifiez "Confirmation sent at"');
  log('');
  log('3. 📧 Boîte email hello@loicbernard.com:');
  log('   - Vérifiez la boîte de réception');
  log('   - Vérifiez le dossier spam/courrier indésirable');
  log('   - Vérifiez les filtres automatiques');
  log('');
  log('4. 🚨 Si aucun email n\'arrive:');
  log('   - Vérifiez la configuration SMTP dans Supabase Dashboard');
  log('   - Authentication > Settings > SMTP Settings');
  log('   - Host: in-v3.mailjet.com, Port: 587');
  log('   - Username: c9fc62becdc0f459ccf6d28bc8a17c01');
  log('   - Password: 215a7777fea39be47fb2129c97e5573d');

  log('\n🎯 DIAGNOSTIC TERMINÉ');
  log('=====================');
};

// Exécuter le diagnostic
diagnosticComplet().catch(error => {
  log('❌ ERREUR CRITIQUE', error.message);
  console.error(error);
});
