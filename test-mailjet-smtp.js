#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration SMTP Mailjet
 * Usage: node test-mailjet-smtp.js
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './env.production' });

const testMailjetSMTP = async () => {
  console.log('🧪 Test de la configuration SMTP Mailjet...\n');

  // Vérifier que les variables d'environnement sont définies
  const requiredVars = ['MAILJET_API_KEY', 'MAILJET_SECRET_KEY', 'MAILJET_FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
    console.log('\n📝 Assurez-vous de définir ces variables dans votre fichier env.production:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}=your-value-here`);
    });
    return;
  }

  console.log('✅ Variables d\'environnement trouvées');
  console.log(`   MAILJET_API_KEY: ${process.env.MAILJET_API_KEY.substring(0, 8)}...`);
  console.log(`   MAILJET_SECRET_KEY: ${process.env.MAILJET_SECRET_KEY.substring(0, 8)}...`);
  console.log(`   MAILJET_FROM_EMAIL: ${process.env.MAILJET_FROM_EMAIL}\n`);

  // Configuration du transporteur SMTP
  const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: process.env.MAILJET_API_KEY,
      pass: process.env.MAILJET_SECRET_KEY
    }
  });

  try {
    // Test de connexion
    console.log('🔌 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie\n');

    // Test d'envoi d'email
    console.log('📧 Test d\'envoi d\'email...');
    const testEmail = {
      from: `"UX Jobs Pro" <${process.env.MAILJET_FROM_EMAIL}>`,
      to: process.env.MAILJET_FROM_EMAIL, // Envoyer à soi-même pour le test
      subject: 'Test SMTP Mailjet - UX Jobs Pro',
      html: `
        <h2>🎉 Test SMTP Mailjet réussi !</h2>
        <p>Ce message confirme que votre configuration SMTP Mailjet fonctionne correctement.</p>
        <p><strong>Détails de la configuration :</strong></p>
        <ul>
          <li>Host: in-v3.mailjet.com</li>
          <li>Port: 587</li>
          <li>From: ${process.env.MAILJET_FROM_EMAIL}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
        <p>Vous pouvez maintenant utiliser Mailjet pour l'envoi d'emails dans Supabase.</p>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Email envoyé avec succès !');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);

    console.log('🎯 Configuration SMTP Mailjet validée !');
    console.log('   Vous pouvez maintenant configurer ces paramètres dans Supabase.');

  } catch (error) {
    console.error('❌ Erreur lors du test SMTP:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Suggestions pour résoudre l\'erreur d\'authentification :');
      console.log('   1. Vérifiez que votre API Key et Secret Key sont corrects');
      console.log('   2. Assurez-vous que votre compte Mailjet est actif');
      console.log('   3. Vérifiez que votre domaine est vérifié dans Mailjet');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Suggestions pour résoudre l\'erreur de connexion :');
      console.log('   1. Vérifiez votre connexion internet');
      console.log('   2. Assurez-vous que le port 587 n\'est pas bloqué');
      console.log('   3. Essayez avec le port 465 (SSL) si nécessaire');
    }
  }
};

// Exécuter le test
testMailjetSMTP().catch(console.error);
