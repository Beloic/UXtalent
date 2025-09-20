#!/usr/bin/env node

/**
 * Test simple du webhook d'annulation avec période de 30 jours
 * Ce script simule directement le webhook sans utiliser l'API Stripe
 */

console.log('🧪 Test simple du webhook d\'annulation avec période de 30 jours');
console.log('===============================================================');

// Simuler un événement customer.subscription.deleted avec période de 30 jours
const testEvent = {
  id: 'evt_test_cancel_30days',
  object: 'event',
  api_version: '2020-08-27',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'sub_test_cancel_30days',
      object: 'subscription',
      customer: 'cus_test_cancel_30days',
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
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_cancel_30days',
    idempotency_key: null
  },
  type: 'customer.subscription.deleted'
};

console.log('📡 Simulation du webhook customer.subscription.deleted');
console.log('📋 Type d\'événement:', testEvent.type);
console.log('👤 Customer ID:', testEvent.data.object.customer);
console.log('💳 Subscription ID:', testEvent.data.object.id);
console.log('📅 Période de facturation:');
console.log('   - Début:', new Date(testEvent.data.object.current_period_start * 1000));
console.log('   - Fin:', new Date(testEvent.data.object.current_period_end * 1000));
console.log('📅 Annulé le:', new Date(testEvent.data.object.canceled_at * 1000));
console.log('🔄 Statut:', testEvent.data.object.status);
console.log('❌ Annulation programmée:', testEvent.data.object.cancel_at_period_end);

// Simuler l'appel au webhook handler
console.log('\n📡 Envoi du webhook vers localhost:3001/api/stripe/webhook');

fetch('http://localhost:3001/api/stripe/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': 't=1234567890,v1=test_signature'
  },
  body: JSON.stringify(testEvent)
})
.then(response => {
  console.log('📡 Réponse du webhook:', response.status, response.statusText);
  return response.text();
})
.then(data => {
  console.log('📄 Contenu de la réponse:', data);
  
  if (data.includes('succès') || data.includes('success')) {
    console.log('\n✅ Test réussi ! Le webhook a été traité correctement.');
    console.log('\n🔍 Vérifications à faire:');
    console.log('1. Vérifier que le plan de l\'utilisateur est passé à "free"');
    console.log('2. Vérifier les logs du serveur pour confirmer le traitement');
    console.log('3. Vérifier que l\'utilisateur garde l\'accès jusqu\'à la fin de période');
  } else {
    console.log('\n⚠️ Le webhook a été reçu mais la réponse n\'indique pas un succès clair.');
  }
})
.catch(error => {
  console.log('❌ Erreur lors de l\'envoi du webhook:', error.message);
  console.log('\n🔧 Vérifications à faire:');
  console.log('1. Vérifier que le serveur local est démarré sur le port 3001');
  console.log('2. Vérifier que l\'endpoint /api/stripe/webhook existe');
  console.log('3. Vérifier les logs du serveur pour les erreurs');
});

// Simuler aussi un événement customer.subscription.updated avec statut canceled
console.log('\n📡 Simulation du webhook customer.subscription.updated (statut: canceled)');

const testEventUpdated = {
  id: 'evt_test_cancel_30days_updated',
  object: 'event',
  api_version: '2020-08-27',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'sub_test_cancel_30days',
      object: 'subscription',
      customer: 'cus_test_cancel_30days',
      status: 'canceled',
      cancel_at_period_end: true,
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      current_period_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
      created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
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
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_cancel_30days_updated',
    idempotency_key: null
  },
  type: 'customer.subscription.updated'
};

// Attendre un peu avant d'envoyer le deuxième webhook
setTimeout(() => {
  fetch('http://localhost:3001/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 't=1234567890,v1=test_signature'
    },
    body: JSON.stringify(testEventUpdated)
  })
  .then(response => {
    console.log('📡 Réponse du webhook updated:', response.status, response.statusText);
    return response.text();
  })
  .then(data => {
    console.log('📄 Contenu de la réponse updated:', data);
  })
  .catch(error => {
    console.log('❌ Erreur lors de l\'envoi du webhook updated:', error.message);
  });
}, 2000);

console.log('\n⏳ Test en cours... Vérifiez les logs du serveur pour voir le traitement des webhooks.');
