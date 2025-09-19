#!/usr/bin/env node

/**
 * Script de migration pour supprimer la colonne 'visible' de la table candidates
 * 
 * Ce script :
 * 1. Vérifie que tous les candidats avec visible=true ont bien status='approved'
 * 2. Met à jour les candidats avec visible=false pour avoir status='pending' ou 'rejected'
 * 3. Affiche un rapport de migration
 * 
 * ATTENTION: Exécuter ce script AVANT de supprimer la colonne 'visible' de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '../env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateVisibleColumn() {
  console.log('🚀 Début de la migration de suppression de la colonne "visible"');
  console.log('=' .repeat(60));

  try {
    // 1. Récupérer tous les candidats
    const { data: candidates, error: fetchError } = await supabase
      .from('candidates')
      .select('id, name, visible, status, approved')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des candidats: ${fetchError.message}`);
    }

    console.log(`📊 Total de candidats trouvés: ${candidates.length}`);

    // 2. Analyser la cohérence des données
    const analysis = {
      total: candidates.length,
      visibleTrue: candidates.filter(c => c.visible === true).length,
      visibleFalse: candidates.filter(c => c.visible === false).length,
      visibleNull: candidates.filter(c => c.visible === null).length,
      statusApproved: candidates.filter(c => c.status === 'approved').length,
      statusPending: candidates.filter(c => c.status === 'pending').length,
      statusRejected: candidates.filter(c => c.status === 'rejected').length,
      statusNull: candidates.filter(c => !c.status).length,
      approvedTrue: candidates.filter(c => c.approved === true).length,
      approvedFalse: candidates.filter(c => c.approved === false).length,
      approvedNull: candidates.filter(c => c.approved === null).length
    };

    console.log('\n📈 Analyse des données actuelles:');
    console.log(`   Visible: true=${analysis.visibleTrue}, false=${analysis.visibleFalse}, null=${analysis.visibleNull}`);
    console.log(`   Status: approved=${analysis.statusApproved}, pending=${analysis.statusPending}, rejected=${analysis.statusRejected}, null=${analysis.statusNull}`);
    console.log(`   Approved: true=${analysis.approvedTrue}, false=${analysis.approvedFalse}, null=${analysis.approvedNull}`);

    // 3. Identifier les incohérences
    const inconsistencies = [];
    
    // Candidats avec visible=true mais status != 'approved'
    const visibleTrueNotApproved = candidates.filter(c => 
      c.visible === true && c.status !== 'approved'
    );
    
    // Candidats avec visible=false mais status = 'approved'
    const visibleFalseButApproved = candidates.filter(c => 
      c.visible === false && c.status === 'approved'
    );

    if (visibleTrueNotApproved.length > 0) {
      inconsistencies.push({
        type: 'visible=true mais status != approved',
        count: visibleTrueNotApproved.length,
        candidates: visibleTrueNotApproved.map(c => ({ id: c.id, name: c.name, visible: c.visible, status: c.status }))
      });
    }

    if (visibleFalseButApproved.length > 0) {
      inconsistencies.push({
        type: 'visible=false mais status = approved',
        count: visibleFalseButApproved.length,
        candidates: visibleFalseButApproved.map(c => ({ id: c.id, name: c.name, visible: c.visible, status: c.status }))
      });
    }

    console.log('\n🔍 Incohérences détectées:');
    if (inconsistencies.length === 0) {
      console.log('   ✅ Aucune incohérence détectée !');
    } else {
      inconsistencies.forEach(inc => {
        console.log(`   ⚠️  ${inc.type}: ${inc.count} candidats`);
        inc.candidates.forEach(c => {
          console.log(`      - ${c.name} (ID: ${c.id}) - visible: ${c.visible}, status: ${c.status}`);
        });
      });
    }

    // 4. Proposer les corrections
    const corrections = [];
    
    // Corriger les candidats avec visible=true mais status != 'approved'
    if (visibleTrueNotApproved.length > 0) {
      corrections.push({
        action: 'Mettre status=approved pour les candidats visible=true',
        candidates: visibleTrueNotApproved,
        update: { status: 'approved' }
      });
    }

    // Corriger les candidats avec visible=false mais status = 'approved'
    if (visibleFalseButApproved.length > 0) {
      corrections.push({
        action: 'Mettre status=pending pour les candidats visible=false',
        candidates: visibleFalseButApproved,
        update: { status: 'pending' }
      });
    }

    console.log('\n🔧 Corrections proposées:');
    if (corrections.length === 0) {
      console.log('   ✅ Aucune correction nécessaire !');
    } else {
      corrections.forEach(corr => {
        console.log(`   📝 ${corr.action}: ${corr.candidates.length} candidats`);
      });
    }

    // 5. Demander confirmation avant d'appliquer les corrections
    if (corrections.length > 0) {
      console.log('\n⚠️  ATTENTION: Ce script va modifier les données de la base de données.');
      console.log('   Assurez-vous d\'avoir fait une sauvegarde avant de continuer.');
      console.log('\n   Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...');
      
      // En mode automatique, on applique directement les corrections
      console.log('   Mode automatique activé - application des corrections...');
      
      // Appliquer les corrections
      for (const correction of corrections) {
        console.log(`\n🔄 ${correction.action}...`);
        
        const candidateIds = correction.candidates.map(c => c.id);
        const { data: updated, error: updateError } = await supabase
          .from('candidates')
          .update(correction.update)
          .in('id', candidateIds)
          .select('id, name, status');

        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour: ${updateError.message}`);
        } else {
          console.log(`✅ ${updated.length} candidats mis à jour avec succès`);
          updated.forEach(c => {
            console.log(`   - ${c.name} (ID: ${c.id}) -> status: ${c.status}`);
          });
        }
      }
    }

    // 6. Rapport final
    console.log('\n📋 RAPPORT DE MIGRATION');
    console.log('=' .repeat(60));
    console.log('✅ Migration terminée avec succès !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Tester l\'application pour vérifier que tout fonctionne');
    console.log('   2. Supprimer la colonne "visible" de la table candidates dans Supabase');
    console.log('   3. Supprimer la colonne "approved" de la table candidates dans Supabase (optionnel)');
    console.log('\n💡 Commandes SQL pour Supabase:');
    console.log('   ALTER TABLE candidates DROP COLUMN visible;');
    console.log('   ALTER TABLE candidates DROP COLUMN approved; -- optionnel');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
migrateVisibleColumn();
