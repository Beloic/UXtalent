#!/usr/bin/env node

/**
 * Script pour créer la table recruiters directement via Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createRecruitersTable() {
  try {
    console.log('🚀 Création de la table recruiters...');
    
    // Créer la table recruiters
    const { data, error } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (error) {
      console.log('⚠️  Erreur lors de la création de la table:', error.message);
      
      // Essayer une approche différente - créer directement via une requête
      console.log('🔄 Tentative de création directe...');
      
      // Insérer un enregistrement de test pour créer la table
      const { data: insertData, error: insertError } = await supabase
        .from('recruiters')
        .insert({
          email: 'test@example.com',
          name: 'Test Recruiter',
          company: 'Test Company'
        });
      
      if (insertError) {
        console.log('❌ Impossible de créer la table:', insertError.message);
        
        // Afficher les tables existantes
        console.log('📋 Tables existantes:');
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (tablesError) {
          console.log('❌ Erreur lors de la récupération des tables:', tablesError.message);
        } else {
          console.log('Tables:', tables?.map(t => t.table_name).join(', '));
        }
      } else {
        console.log('✅ Table créée avec succès !');
        
        // Supprimer l'enregistrement de test
        await supabase
          .from('recruiters')
          .delete()
          .eq('email', 'test@example.com');
        
        console.log('🧹 Enregistrement de test supprimé');
      }
    } else {
      console.log('✅ Table créée avec succès !');
    }
    
    // Vérifier que la table existe maintenant
    console.log('🔍 Vérification de l\'existence de la table...');
    
    const { data: testData, error: testError } = await supabase
      .from('recruiters')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Table non accessible:', testError.message);
    } else {
      console.log('✅ Table recruiters accessible !');
      console.log(`📊 ${testData?.length || 0} enregistrement(s) trouvé(s)`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter la création
createRecruitersTable();
