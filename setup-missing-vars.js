#!/usr/bin/env node

/**
 * Script pour configurer les variables d'environnement manquantes
 * Usage: node setup-missing-vars.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('🔧 CONFIGURATION DES VARIABLES MANQUANTES\n');

// Variables critiques manquantes
const missingVars = {
  'SUPABASE_SERVICE_KEY': {
    description: 'Clé service Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c',
    instructions: 'Trouvez cette clé dans Supabase Dashboard → Settings → API → service_role key'
  },
  'STRIPE_SECRET_KEY': {
    description: 'Clé secrète Stripe',
    example: 'sk_test_51ABC123...',
    instructions: 'Trouvez cette clé dans Stripe Dashboard → Developers → API keys → Secret key'
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Secret webhook Stripe',
    example: 'whsec_ABC123...',
    instructions: 'Créez un webhook dans Stripe Dashboard → Developers → Webhooks → Signing secret'
  },
  'VITE_STRIPE_ELITE_CANDIDAT_LINK': {
    description: 'Lien paiement Elite Candidat',
    example: 'https://buy.stripe.com/elite-candidat-link',
    instructions: 'Créez un produit "Elite Candidat" dans Stripe → Products → Payment Links'
  },
  'ADMIN_TOKEN_SECRET': {
    description: 'Token admin sécurisé',
    example: 'admin-secure-token-2024',
    instructions: 'Générez un token sécurisé pour l\'accès admin'
  }
};

// Variables optionnelles pour Redis (supprimées)
const optionalVars = {
  // Redis supprimé du projet
};

function generateSecureToken() {
  return 'admin-token-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function readEnvFile() {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('⚠️  Fichier .env non trouvé, création d\'un nouveau fichier...\n');
    return '';
  }
}

function writeEnvFile(content) {
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('✅ Fichier .env mis à jour !\n');
}

function addMissingVariables() {
  let envContent = readEnvFile();
  
  console.log('📝 AJOUT DES VARIABLES MANQUANTES:\n');
  
  // Ajouter les variables critiques
  for (const [varName, config] of Object.entries(missingVars)) {
    if (!envContent.includes(varName)) {
      console.log(`➕ Ajout de ${varName}:`);
      console.log(`   Description: ${config.description}`);
      console.log(`   Instructions: ${config.instructions}`);
      
      let value = config.example;
      
      // Générer un token admin sécurisé
      if (varName === 'ADMIN_TOKEN_SECRET') {
        value = generateSecureToken();
        console.log(`   ✅ Token généré automatiquement: ${value}`);
      } else {
        console.log(`   ⚠️  Remplacez par votre vraie valeur:`);
        console.log(`   ${varName}=${value}`);
      }
      
      envContent += `\n# ${config.description}\n${varName}=${value}\n`;
      console.log('');
    }
  }
  
  // Variables optionnelles supprimées (Redis non utilisé)
  envContent += '\n# Redis supprimé du projet\n';
  
  writeEnvFile(envContent);
}

function showInstructions() {
  console.log('📋 INSTRUCTIONS DÉTAILLÉES:\n');
  
  console.log('🔑 SUPABASE SERVICE KEY:');
  console.log('1. Allez sur https://supabase.com/dashboard');
  console.log('2. Sélectionnez votre projet');
  console.log('3. Settings → API → service_role key');
  console.log('4. Copiez la clé et remplacez SUPABASE_SERVICE_KEY dans .env\n');
  
  console.log('💳 STRIPE CONFIGURATION:');
  console.log('1. Allez sur https://dashboard.stripe.com');
  console.log('2. Developers → API keys → Copiez la Secret key');
  console.log('3. Developers → Webhooks → Créez un endpoint');
  console.log('4. URL: https://votre-domaine.com/api/stripe/webhook');
  console.log('5. Événements: checkout.session.completed, customer.subscription.*');
  console.log('6. Copiez le Signing secret\n');
  
  console.log('🔗 STRIPE PAYMENT LINKS:');
  console.log('1. Stripe Dashboard → Products → Add product');
  console.log('2. Créez "Elite Candidat" (ex: 49€/mois)');
  console.log('3. Créez un Payment Link pour ce produit');
  console.log('4. Copiez l\'URL dans VITE_STRIPE_ELITE_CANDIDAT_LINK\n');
  
  console.log('🚀 REDIS (SUPPRIMÉ):');
  console.log('Redis a été supprimé du projet pour simplifier le déploiement.\n');
}

function main() {
  console.log('🎯 Ce script va vous aider à configurer les variables manquantes.\n');
  
  addMissingVariables();
  showInstructions();
  
  console.log('✅ CONFIGURATION TERMINÉE !');
  console.log('📝 Prochaines étapes:');
  console.log('1. Modifiez le fichier .env avec vos vraies valeurs');
  console.log('2. Relancez le test: node test-env-config.js');
  console.log('3. Une fois tout vert, démarrez l\'app: npm run dev:full');
}

main();
