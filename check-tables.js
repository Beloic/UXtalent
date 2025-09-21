#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables existantes...');
    
    // Essayer d'accéder à différentes tables connues
    const tablesToCheck = ['candidates', 'jobs', 'recruiter_favorites', 'recruiter_searches'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ Table ${tableName}: accessible (${data?.length || 0} enregistrements)`);
        }
      } catch (err) {
        console.log(`❌ Table ${tableName}: ${err.message}`);
      }
    }
    
    // Essayer d'insérer un recruteur de test
    console.log('\n🧪 Test d\'insertion dans la table recruiters...');
    
    const { data, error } = await supabase
      .from('recruiters')
      .insert({
        email: 'test@example.com',
        name: 'Test Recruiter',
        company: 'Test Company',
        plan_type: 'starter'
      })
      .select();
    
    if (error) {
      console.log('❌ Erreur d\'insertion:', error.message);
      
      if (error.message.includes('relation "recruiters" does not exist')) {
        console.log('\n📝 La table recruiters n\'existe pas encore.');
        console.log('💡 Pour la créer, vous devez :');
        console.log('   1. Aller sur https://supabase.com/dashboard');
        console.log('   2. Sélectionner votre projet');
        console.log('   3. Aller dans SQL Editor');
        console.log('   4. Exécuter le script SQL suivant :');
        console.log('\n' + '='.repeat(60));
        console.log(`
CREATE TABLE IF NOT EXISTS recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Informations d'abonnement
  plan_type VARCHAR(50) DEFAULT 'starter' CHECK (plan_type IN ('starter', 'max', 'premium', 'custom')),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired', 'trial')),
  
  -- Dates d'abonnement
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Informations de paiement
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  payment_method VARCHAR(50),
  
  -- Limites et quotas
  max_job_posts INTEGER DEFAULT 5,
  max_candidate_contacts INTEGER DEFAULT 100,
  max_featured_jobs INTEGER DEFAULT 1,
  
  -- Statistiques
  total_jobs_posted INTEGER DEFAULT 0,
  total_candidates_contacted INTEGER DEFAULT 0,
  total_applications_received INTEGER DEFAULT 0,
  
  -- Métadonnées
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON recruiters(email);
CREATE INDEX IF NOT EXISTS idx_recruiters_plan_type ON recruiters(plan_type);
CREATE INDEX IF NOT EXISTS idx_recruiters_subscription_status ON recruiters(subscription_status);
CREATE INDEX IF NOT EXISTS idx_recruiters_subscription_end_date ON recruiters(subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_recruiters_stripe_customer_id ON recruiters(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_created_at ON recruiters(created_at);

-- Insérer un recruteur de test
INSERT INTO recruiters (
  email, 
  name, 
  company, 
  plan_type, 
  subscription_status,
  subscription_start_date,
  subscription_end_date,
  max_job_posts,
  max_candidate_contacts
) VALUES (
  'be.loic23@gmail.com',
  'Loic Bernard',
  'UX Jobs Pro',
  'max',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',
  50,
  1000
) ON CONFLICT (email) DO NOTHING;
        `);
        console.log('='.repeat(60));
      }
    } else {
      console.log('✅ Insertion réussie !');
      console.log('📊 Données insérées:', data);
      
      // Supprimer l'enregistrement de test
      await supabase
        .from('recruiters')
        .delete()
        .eq('email', 'test@example.com');
      
      console.log('🧹 Enregistrement de test supprimé');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkTables();
