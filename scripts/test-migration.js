#!/usr/bin/env node

/**
 * Script de test pour vérifier la migration de la colonne 'visible'
 * 
 * Ce script vérifie simplement la cohérence des données sans les modifier
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env local
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('   Assurez-vous d\'avoir un fichier .env avec VITE_SUPABASE_URL et SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigration() {
  console.log('🧪 Test de migration - Analyse des données');
  console.log('=' .repeat(50));

  try {
    // Récupérer tous les candidats
    const { data: candidates, error: fetchError } = await supabase
      .from('candidates')
      .select('id, name, visible, status, approved')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des candidats: ${fetchError.message}`);
    }

    console.log(`📊 Total de candidats trouvés: ${candidates.length}`);

    if (candidates.length === 0) {
      console.log('ℹ️  Aucun candidat trouvé dans la base de données');
      return;
    }

    // Analyser la cohérence des données
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

    // Identifier les incohérences
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
      console.log('   🎉 La migration peut être effectuée en toute sécurité');
    } else {
      inconsistencies.forEach(inc => {
        console.log(`   ⚠️  ${inc.type}: ${inc.count} candidats`);
        inc.candidates.forEach(c => {
          console.log(`      - ${c.name} (ID: ${c.id}) - visible: ${c.visible}, status: ${c.status}`);
        });
      });
      console.log('\n   📝 Ces incohérences devront être corrigées avant la migration');
    }

    // Afficher quelques exemples de candidats
    console.log('\n📋 Exemples de candidats:');
    candidates.slice(0, 5).forEach(c => {
      console.log(`   - ${c.name}: visible=${c.visible}, status=${c.status}, approved=${c.approved}`);
    });

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testMigration();
