#!/usr/bin/env node

/**
 * Test direct de la base de données pour vérifier le plan
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test-payment@example.com';

async function testDirectDatabase() {
  console.log('🔍 Test direct de la base de données\n');
  
  try {
    // 1. Récupérer le profil directement
    console.log('1. Récupération du profil...');
    const response = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
    
    if (response.ok) {
      const candidate = await response.json();
      console.log('✅ Profil récupéré:');
      console.log('   - ID:', candidate.id);
      console.log('   - Email:', candidate.email);
      console.log('   - Plan (plan):', candidate.plan);
      console.log('   - Plan (planType):', candidate.planType);
      console.log('   - Plan (plan_type):', candidate.plan_type);
      console.log('   - Featured:', candidate.isFeatured);
      console.log('   - Featured Until:', candidate.featuredUntil);
      console.log('   - Updated At:', candidate.updatedAt);
    } else {
      console.error('❌ Erreur:', response.status, await response.text());
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Mettre à jour le plan à Premium
    console.log('2. Mise à jour vers Premium...');
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
    
    if (updateResponse.ok) {
      const updatedCandidate = await updateResponse.json();
      console.log('✅ Plan mis à jour vers Premium:');
      console.log('   - Plan (plan):', updatedCandidate.plan);
      console.log('   - Plan (planType):', updatedCandidate.planType);
      console.log('   - Plan (plan_type):', updatedCandidate.plan_type);
      console.log('   - Featured:', updatedCandidate.isFeatured);
      console.log('   - Featured Until:', updatedCandidate.featuredUntil);
    } else {
      console.error('❌ Erreur mise à jour:', updateResponse.status, await updateResponse.text());
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Récupérer le profil immédiatement après
    console.log('3. Récupération immédiate après mise à jour...');
    const response2 = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
    
    if (response2.ok) {
      const candidate2 = await response2.json();
      console.log('✅ Profil récupéré après mise à jour:');
      console.log('   - Plan (plan):', candidate2.plan);
      console.log('   - Plan (planType):', candidate2.planType);
      console.log('   - Plan (plan_type):', candidate2.plan_type);
      console.log('   - Featured:', candidate2.isFeatured);
      console.log('   - Featured Until:', candidate2.featuredUntil);
      console.log('   - Updated At:', candidate2.updatedAt);
    } else {
      console.error('❌ Erreur:', response2.status, await response2.text());
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Attendre 2 secondes et récupérer à nouveau
    console.log('4. Attente de 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('5. Récupération après attente...');
    const response3 = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
    
    if (response3.ok) {
      const candidate3 = await response3.json();
      console.log('✅ Profil récupéré après attente:');
      console.log('   - Plan (plan):', candidate3.plan);
      console.log('   - Plan (planType):', candidate3.planType);
      console.log('   - Plan (plan_type):', candidate3.plan_type);
      console.log('   - Featured:', candidate3.isFeatured);
      console.log('   - Featured Until:', candidate3.featuredUntil);
      console.log('   - Updated At:', candidate3.updatedAt);
    } else {
      console.error('❌ Erreur:', response3.status, await response3.text());
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDirectDatabase();
