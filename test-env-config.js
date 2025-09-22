#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration des variables d'environnement
 * Usage: node test-env-config.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 TEST DE CONFIGURATION DES VARIABLES D\'ENVIRONNEMENT\n');

// Configuration des tests
const requiredVars = {
  // Supabase
  'VITE_SUPABASE_URL': {
    required: true,
    description: 'URL Supabase',
    pattern: /^https:\/\/.*\.supabase\.co$/
  },
  'VITE_SUPABASE_ANON_KEY': {
    required: true,
    description: 'Clé anonyme Supabase',
    pattern: /^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\./
  },
  'SUPABASE_SERVICE_KEY': {
    required: true,
    description: 'Clé service Supabase',
    pattern: /^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\./
  },
  
  // Stripe
  'STRIPE_SECRET_KEY': {
    required: true,
    description: 'Clé secrète Stripe',
    pattern: /^sk_(test_|live_).*$/
  },
  'STRIPE_WEBHOOK_SECRET': {
    required: true,
    description: 'Secret webhook Stripe',
    pattern: /^whsec_.*$/
  },
  'VITE_STRIPE_PREMIUM_CANDIDAT_LINK': {
    required: true,
    description: 'Lien paiement Premium Candidat',
    pattern: /^https:\/\/buy\.stripe\.com\/.*$/
  },
  'VITE_STRIPE_ELITE_CANDIDAT_LINK': {
    required: true,
    description: 'Lien paiement Elite Candidat',
    pattern: /^https:\/\/buy\.stripe\.com\/.*$/
  },
  'VITE_STRIPE_STARTER_LINK': {
    required: true,
    description: 'Lien paiement Starter',
    pattern: /^https:\/\/buy\.stripe\.com\/.*$/
  },
  'VITE_STRIPE_MAX_LINK': {
    required: true,
    description: 'Lien paiement Max',
    pattern: /^https:\/\/buy\.stripe\.com\/.*$/
  },
  
  // Redis (optionnel)
  'REDIS_URL': {
    required: false,
    description: 'URL Redis',
    pattern: /^redis:\/\/.*$/
  },
  'UPSTASH_REDIS_REST_URL': {
    required: false,
    description: 'URL Upstash Redis',
    pattern: /^https:\/\/.*\.upstash\.io$/
  },
  'UPSTASH_REDIS_REST_TOKEN': {
    required: false,
    description: 'Token Upstash Redis',
    pattern: /^.*$/
  },
  
  // Serveur
  'PORT': {
    required: true,
    description: 'Port du serveur',
    pattern: /^\d+$/
  },
  'NODE_ENV': {
    required: true,
    description: 'Environnement Node.js',
    pattern: /^(development|production|staging)$/
  },
  'ADMIN_TOKEN_SECRET': {
    required: true,
    description: 'Token admin sécurisé',
    pattern: /^.{8,}$/
  }
};

// Fonction de test
function testEnvironmentVariables() {
  let totalTests = 0;
  let passedTests = 0;
  let criticalFailures = 0;
  
  console.log('📋 RÉSULTATS DES TESTS:\n');
  
  for (const [varName, config] of Object.entries(requiredVars)) {
    totalTests++;
    const value = process.env[varName];
    
    console.log(`🔍 ${varName}:`);
    console.log(`   Description: ${config.description}`);
    
    if (!value) {
      if (config.required) {
        console.log(`   ❌ MANQUANTE (CRITIQUE)`);
        criticalFailures++;
      } else {
        console.log(`   ⚠️  MANQUANTE (OPTIONNELLE)`);
        passedTests++;
      }
    } else {
      // Masquer les valeurs sensibles
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') || varName.includes('TOKEN')
        ? `${value.substring(0, 8)}...`
        : value;
      
      console.log(`   Valeur: ${displayValue}`);
      
      if (config.pattern && !config.pattern.test(value)) {
        console.log(`   ❌ FORMAT INVALIDE`);
        if (config.required) criticalFailures++;
      } else {
        console.log(`   ✅ OK`);
        passedTests++;
      }
    }
    console.log('');
  }
  
  // Résumé
  console.log('📊 RÉSUMÉ:');
  console.log(`   Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`   Échecs critiques: ${criticalFailures}`);
  console.log(`   Score: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (criticalFailures === 0) {
    console.log('\n🎉 TOUTES LES VARIABLES CRITIQUES SONT CONFIGURÉES !');
    console.log('✅ Votre application est prête à fonctionner.');
  } else {
    console.log('\n🚨 ATTENTION: Variables critiques manquantes !');
    console.log('❌ Configurez les variables manquantes avant de démarrer l\'application.');
  }
  
  return criticalFailures === 0;
}

// Test des connexions
async function testConnections() {
  console.log('\n🔗 TEST DES CONNEXIONS:\n');
  
  // Test Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('candidates').select('count').limit(1);
      
      if (error) {
        console.log('❌ Supabase: Erreur de connexion');
        console.log(`   Erreur: ${error.message}`);
      } else {
        console.log('✅ Supabase: Connexion réussie');
      }
    } else {
      console.log('⚠️  Supabase: Variables manquantes');
    }
  } catch (error) {
    console.log('❌ Supabase: Erreur de test');
    console.log(`   Erreur: ${error.message}`);
  }
  
  // Test Stripe
  try {
    const Stripe = (await import('stripe')).default;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (stripeKey) {
      const stripe = new Stripe(stripeKey);
      const account = await stripe.accounts.retrieve();
      console.log('✅ Stripe: Connexion réussie');
      console.log(`   Compte: ${account.country} (${account.type})`);
    } else {
      console.log('⚠️  Stripe: Clé secrète manquante');
    }
  } catch (error) {
    console.log('❌ Stripe: Erreur de connexion');
    console.log(`   Erreur: ${error.message}`);
  }
  
  // Test Redis (si configuré)
  try {
    const redisUrl = process.env.REDIS_URL;
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    
    if (redisUrl) {
      console.log('✅ Redis: URL configurée');
    } else if (upstashUrl) {
      console.log('✅ Upstash Redis: URL configurée');
    } else {
      console.log('⚠️  Redis: Aucune configuration trouvée');
    }
  } catch (error) {
    console.log('❌ Redis: Erreur de test');
  }
}

// Exécution des tests
async function runTests() {
  const envOk = testEnvironmentVariables();
  
  if (envOk) {
    await testConnections();
  }
  
  console.log('\n📝 PROCHAINES ÉTAPES:');
  if (!envOk) {
    console.log('1. Configurez les variables manquantes dans .env');
    console.log('2. Relancez ce test: node test-env-config.js');
    console.log('3. Une fois tout configuré, démarrez l\'application');
  } else {
    console.log('1. Toutes les variables sont configurées ✅');
    console.log('2. Vous pouvez démarrer l\'application: npm run dev:full');
    console.log('3. Testez les fonctionnalités de paiement');
  }
}

// Lancement des tests
runTests().catch(console.error);
