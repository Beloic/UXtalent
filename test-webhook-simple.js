#!/usr/bin/env node

/**
 * Test simple du webhook Stripe
 */

console.log('🧪 Test simple du webhook Stripe');
console.log('================================');

// Simuler un événement customer.subscription.deleted
const testEvent = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2020-08-27',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'sub_test_123',
      object: 'subscription',
      customer: 'cus_test_123',
      status: 'canceled',
      cancel_at_period_end: true,
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      current_period_start: Math.floor(Date.now() / 1000) - 2592000,
      created: Math.floor(Date.now() / 1000) - 2592000,
      items: {
        data: [{
          id: 'si_test_123',
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
    id: 'req_test_123',
    idempotency_key: null
  },
  type: 'customer.subscription.deleted'
};

console.log('📡 Envoi du webhook vers localhost:3001/api/stripe/webhook');
console.log('📋 Type d\'événement:', testEvent.type);
console.log('👤 Customer ID:', testEvent.data.object.customer);

// Envoyer le webhook
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
})
.catch(error => {
  console.log('❌ Erreur:', error.message);
});
