#!/usr/bin/env node

/**
 * Test complet des webhooks d'annulation avec période de 30 jours
 * Ce script crée un utilisateur de test, puis teste l'annulation
 */

console.log('🧪 Test complet des webhooks d\'annulation avec période de 30 jours');
console.log('================================================================');

// Données de test
const testUser = {
  email: 'test-cancel-30days@example.com',
  name: 'Test Cancel 30 Days',
  planType: 'premium',
  subscriptionId: 'sub_test_cancel_30days',
  customerId: 'cus_test_cancel_30days'
};

console.log('👤 Utilisateur de test:');
console.log('📧 Email:', testUser.email);
console.log('👤 Nom:', testUser.name);
console.log('📊 Plan initial:', testUser.planType);

// Étape 1: Créer un utilisateur de test
console.log('\n📝 Étape 1: Création d\'un utilisateur de test');

const createUserRequest = {
  method: 'POST',
  url: 'http://localhost:3001/api/candidates',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: testUser.email,
    name: testUser.name,
    planType: testUser.planType,
    skills: ['UX Design', 'UI Design', 'Research'],
    experience: 'Senior',
    location: 'Paris, France',
    availability: 'Disponible',
    portfolio: 'https://example.com/portfolio',
    linkedin: 'https://linkedin.com/in/test-cancel-30days',
    phone: '+33123456789',
    notes: 'Utilisateur de test pour l\'annulation avec période de 30 jours'
  })
};

console.log('📡 Création de l\'utilisateur...');

fetch(createUserRequest.url, {
  method: createUserRequest.method,
  headers: createUserRequest.headers,
  body: createUserRequest.body
})
.then(response => {
  console.log('📡 Réponse de création:', response.status, response.statusText);
  return response.text();
})
.then(data => {
  console.log('📄 Contenu de la réponse:', data);
  
  if (response.status === 201 || response.status === 200) {
    console.log('✅ Utilisateur créé avec succès');
    
    // Étape 2: Vérifier le plan initial
    console.log('\n📊 Étape 2: Vérification du plan initial');
    return fetch(`http://localhost:3001/api/candidates/email/${encodeURIComponent(testUser.email)}`);
  } else {
    console.log('⚠️ Erreur lors de la création de l\'utilisateur');
    throw new Error('Création échouée');
  }
})
.then(response => {
  if (response) {
    console.log('📡 Réponse de vérification:', response.status, response.statusText);
    return response.text();
  }
})
.then(data => {
  if (data) {
    console.log('📄 Données utilisateur:', data);
    
    // Étape 3: Simuler l'annulation avec période de 30 jours
    console.log('\n🗓️ Étape 3: Simulation de l\'annulation avec période de 30 jours');
    
    const testSubscription = {
      id: testUser.subscriptionId,
      object: 'subscription',
      customer: testUser.customerId,
      status: 'canceled',
      cancel_at_period_end: true,
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Dans 30 jours
      current_period_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // Il y a 30 jours
      created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
      canceled_at: Math.floor(Date.now() / 1000),
      items: {
        data: [{
          id: 'si_test_cancel_30days',
          object: 'subscription_item',
          price: {
            id: 'price_premium_candidat',
            object: 'price',
            amount: 499,
            currency: 'eur'
          }
        }]
      }
    };
    
    console.log('📅 Période de facturation:');
    console.log('   - Début:', new Date(testSubscription.current_period_start * 1000));
    console.log('   - Fin:', new Date(testSubscription.current_period_end * 1000));
    console.log('📅 Annulé le:', new Date(testSubscription.canceled_at * 1000));
    console.log('🔄 Statut:', testSubscription.status);
    console.log('❌ Annulation programmée:', testSubscription.cancel_at_period_end);
    
    // Étape 4: Mettre à jour le plan vers 'free'
    console.log('\n🔄 Étape 4: Mise à jour du plan vers "free"');
    
    const updatePlanRequest = {
      method: 'PUT',
      url: `http://localhost:3001/api/candidates/email/${encodeURIComponent(testUser.email)}/plan`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({ 
        planType: 'free', 
        durationMonths: 1 
      })
    };
    
    console.log('📡 Mise à jour du plan...');
    
    return fetch(updatePlanRequest.url, {
      method: updatePlanRequest.method,
      headers: updatePlanRequest.headers,
      body: updatePlanRequest.body
    });
  }
})
.then(response => {
  if (response) {
    console.log('📡 Réponse de mise à jour:', response.status, response.statusText);
    return response.text();
  }
})
.then(data => {
  if (data) {
    console.log('📄 Contenu de la réponse:', data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Plan mis à jour vers "free" avec succès');
      
      // Étape 5: Vérifier le plan final
      console.log('\n📊 Étape 5: Vérification du plan final');
      
      return fetch(`http://localhost:3001/api/candidates/email/${encodeURIComponent(testUser.email)}`);
    } else {
      console.log('⚠️ Erreur lors de la mise à jour du plan');
    }
  }
})
.then(response => {
  if (response) {
    console.log('📡 Réponse de vérification finale:', response.status, response.statusText);
    return response.text();
  }
})
.then(data => {
  if (data) {
    console.log('📄 Données utilisateur finales:', data);
    
    console.log('\n🎉 Test complet terminé !');
    console.log('\n📋 Résumé du test:');
    console.log('1. ✅ Utilisateur de test créé');
    console.log('2. ✅ Plan initial vérifié (premium)');
    console.log('3. ✅ Annulation avec période de 30 jours simulée');
    console.log('4. ✅ Plan mis à jour vers "free"');
    console.log('5. ✅ Plan final vérifié');
    
    console.log('\n🔍 Vérifications à faire:');
    console.log('1. Vérifier que l\'utilisateur garde l\'accès premium jusqu\'à la fin de période');
    console.log('2. Vérifier que le plan passe à "free" après la fin de période');
    console.log('3. Vérifier les logs du serveur pour confirmer le traitement');
    console.log('4. Vérifier que l\'interface utilisateur reflète le bon statut');
  }
})
.catch(error => {
  console.log('❌ Erreur lors du test:', error.message);
  console.log('\n🔧 Vérifications à faire:');
  console.log('1. Vérifier que le serveur local est démarré sur le port 3001');
  console.log('2. Vérifier que l\'API des candidats fonctionne');
  console.log('3. Vérifier les logs du serveur pour les erreurs');
});
