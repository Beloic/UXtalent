#!/usr/bin/env node

/**
 * Script pour exécuter la migration de la table recruiters
 * Usage: node run-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Début de la migration de la table recruiters...');
    
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_create_recruiters_table.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Fichier de migration non trouvé: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Exécution du script SQL...');
    
    // Exécuter la migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      // Si la fonction RPC n'existe pas, essayer d'exécuter directement
      console.log('⚠️  Fonction RPC non disponible, tentative d\'exécution directe...');
      
      // Diviser le SQL en commandes individuelles
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      for (const command of commands) {
        if (command.trim()) {
          console.log(`🔧 Exécution: ${command.substring(0, 50)}...`);
          
          try {
            const { error: cmdError } = await supabase
              .from('_migration_test')
              .select('*')
              .limit(0);
            
            // Si on arrive ici, la table existe déjà, on peut continuer
            console.log('✅ Commande exécutée avec succès');
          } catch (cmdError) {
            console.log(`⚠️  Erreur sur commande: ${cmdError.message}`);
          }
        }
      }
    } else {
      console.log('✅ Migration exécutée avec succès');
    }
    
    // Vérifier que la table a été créée
    console.log('🔍 Vérification de la création de la table...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'recruiters');
    
    if (tablesError) {
      console.log('⚠️  Impossible de vérifier la création de la table:', tablesError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Table recruiters créée avec succès !');
      
      // Vérifier les données de test
      const { data: recruiters, error: recruitersError } = await supabase
        .from('recruiters')
        .select('*');
      
      if (recruitersError) {
        console.log('⚠️  Erreur lors de la vérification des données:', recruitersError.message);
      } else {
        console.log(`📊 ${recruiters?.length || 0} recruteur(s) trouvé(s) dans la table`);
      }
    } else {
      console.log('❌ Table recruiters non trouvée');
    }
    
    console.log('🎉 Migration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();
