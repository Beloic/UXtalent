#!/usr/bin/env node

/**
 * Script de test pour vérifier le flux de paiement Stripe
 * Ce script simule un paiement réussi et vérifie que le profil utilisateur est mis à jour
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test-payment@example.com';

// Fonction pour créer un candidat de test
async function createTestCandidate() {
  console.log('🔧 Création du candidat de test...');
  
  const candidateData = {
    name: 'Test Payment User',
    email: TEST_EMAIL,
    title: 'Développeur UX',
    location: 'Paris',
    bio: 'Candidat de test pour vérifier le flux de paiement',
    skills: ['UX Design', 'Figma', 'Prototypage'],
    status: 'approved',
    plan_type: 'free'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify(candidateData)
    });

    if (response.ok) {
      const candidate = await response.json();
      console.log('✅ Candidat de test créé:', candidate.id);
      return candidate;
    } else {
      console.log('ℹ️ Candidat existe déjà ou erreur:', response.status);
      // Essayer de récupérer le candidat existant
      const getResponse = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
      if (getResponse.ok) {
        const candidate = await getResponse.json();
        console.log('✅ Candidat existant récupéré:', candidate.id);
        return candidate;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du candidat:', error.message);
  }
}

// Fonction pour vérifier le plan actuel
async function checkCurrentPlan() {
  console.log('🔍 Vérification du plan actuel...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates/profile/${encodeURIComponent(TEST_EMAIL)}`);
    
    if (response.ok) {
      const candidate = await response.json();
      console.log('📊 Plan actuel:', candidate.plan || candidate.planType || 'free');
      return candidate;
    } else {
      console.error('❌ Impossible de récupérer le profil:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du plan:', error.message);
  }
}

// Fonction pour simuler un paiement Premium
async function simulatePremiumPayment() {
  console.log('💳 Simulation d\'un paiement Premium...');
  
  try {
    // Simuler l'appel API que fait le webhook Stripe
    const response = await fetch(`${API_BASE_URL}/api/candidates/email/${encodeURIComponent(TEST_EMAIL)}/plan`, {
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

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Paiement Premium simulé avec succès:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Erreur lors de la simulation du paiement:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du paiement:', error.message);
  }
}

// Fonction pour simuler un paiement Pro
async function simulateProPayment() {
  console.log('💳 Simulation d\'un paiement Pro...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates/email/${encodeURIComponent(TEST_EMAIL)}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({ 
        planType: 'pro', 
        durationMonths: 1 
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Paiement Pro simulé avec succès:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Erreur lors de la simulation du paiement:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du paiement:', error.message);
  }
}

// Fonction pour nettoyer le candidat de test
async function cleanupTestCandidate() {
  console.log('🧹 Nettoyage du candidat de test...');
  
  try {
    // Remettre le plan à gratuit
    const response = await fetch(`${API_BASE_URL}/api/candidates/email/${encodeURIComponent(TEST_EMAIL)}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({ 
        planType: 'free', 
        durationMonths: 1 
      })
    });

    if (response.ok) {
      console.log('✅ Candidat remis au plan gratuit');
    } else {
      console.log('⚠️ Impossible de remettre le plan à gratuit');
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Fonction principale
async function runTest() {
  console.log('🚀 Début du test du flux de paiement Stripe\n');
  
  try {
    // 1. Créer ou récupérer le candidat de test
    const candidate = await createTestCandidate();
    if (!candidate) {
      console.error('❌ Impossible de créer/récupérer le candidat de test');
      return;
    }
    
    console.log('\n' + '='.repeat(50));
    
    // 2. Vérifier le plan initial
    await checkCurrentPlan();
    
    console.log('\n' + '='.repeat(50));
    
    // 3. Simuler un paiement Premium
    await simulatePremiumPayment();
    
    console.log('\n' + '='.repeat(50));
    
    // 4. Vérifier que le plan a été mis à jour
    await checkCurrentPlan();
    
    console.log('\n' + '='.repeat(50));
    
    // 5. Simuler un paiement Pro
    await simulateProPayment();
    
    console.log('\n' + '='.repeat(50));
    
    // 6. Vérifier que le plan a été mis à jour
    await checkCurrentPlan();
    
    console.log('\n' + '='.repeat(50));
    
    // 7. Nettoyer
    await cleanupTestCandidate();
    
    console.log('\n✅ Test du flux de paiement terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
runTest();

export {
  createTestCandidate,
  checkCurrentPlan,
  simulatePremiumPayment,
  simulateProPayment,
  cleanupTestCandidate
};
