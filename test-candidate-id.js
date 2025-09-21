#!/usr/bin/env node

/**
 * Test pour vérifier si nous récupérons le bon candidat
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test-payment@example.com';

async function testCandidateId() {
  console.log('🔍 Test de vérification du candidat\n');
  
  try {
    // 1. Récupérer le profil pour obtenir l'ID
    console.log('1. Récupération du profil pour obtenir l\'ID...');
    const response1 = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
    
    if (!response1.ok) {
      console.error('❌ Erreur récupération profil:', response1.status);
      return;
    }
    
    const candidate1 = await response1.json();
    console.log('✅ Profil récupéré:');
    console.log('   - ID:', candidate1.id);
    console.log('   - Email:', candidate1.email);
    console.log('   - Plan Type:', candidate1.plan_type);
    console.log('   - Updated At:', candidate1.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Mettre à jour le plan
    console.log('2. Mise à jour du plan vers Premium...');
    const updateResponse = await fetch(`${API_BASE_URL}/api/candidates/email/${encodeURIComponent(TEST_EMAIL)}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({ 
        planType: 'premium', 
        durationMonths: 1 
      })
    });
    
    if (!updateResponse.ok) {
      console.error('❌ Erreur mise à jour:', updateResponse.status, await updateResponse.text());
      return;
    }
    
    const updatedCandidate = await updateResponse.json();
    console.log('✅ Plan mis à jour:');
    console.log('   - ID:', updatedCandidate.id);
    console.log('   - Email:', updatedCandidate.email);
    console.log('   - Plan Type:', updatedCandidate.plan_type);
    console.log('   - Updated At:', updatedCandidate.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Récupérer le profil par ID directement
    console.log('3. Récupération du profil par ID directement...');
    const response2 = await fetch(`${API_BASE_URL}/api/candidates/${candidate1.id}`);
    
    if (!response2.ok) {
      console.error('❌ Erreur récupération par ID:', response2.status);
      return;
    }
    
    const candidate2 = await response2.json();
    console.log('✅ Profil récupéré par ID:');
    console.log('   - ID:', candidate2.id);
    console.log('   - Email:', candidate2.email);
    console.log('   - Plan Type:', candidate2.plan_type);
    console.log('   - Updated At:', candidate2.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Récupérer le profil par email à nouveau
    console.log('4. Récupération du profil par email à nouveau...');
    const response3 = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
    
    if (!response3.ok) {
      console.error('❌ Erreur récupération par email:', response3.status);
      return;
    }
    
    const candidate3 = await response3.json();
    console.log('✅ Profil récupéré par email:');
    console.log('   - ID:', candidate3.id);
    console.log('   - Email:', candidate3.email);
    console.log('   - Plan Type:', candidate3.plan_type);
    console.log('   - Updated At:', candidate3.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Comparaison
    console.log('5. Comparaison des résultats:');
    console.log('   - Même ID ?', candidate1.id === candidate2.id && candidate2.id === candidate3.id);
    console.log('   - Même email ?', candidate1.email === candidate2.email && candidate2.email === candidate3.email);
    console.log('   - Plan cohérent ?', candidate2.plan_type === updatedCandidate.plan_type);
    console.log('   - Plan incohérent ?', candidate3.plan_type !== updatedCandidate.plan_type);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCandidateId();

