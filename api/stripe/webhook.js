import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      return new Response('Signature manquante', { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Erreur de vérification webhook:', err.message);
      return new Response(`Erreur webhook: ${err.message}`, { status: 400 });
    }

    console.log('✅ Webhook reçu:', event.type);

    // Traiter les événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return new Response('Webhook traité avec succès', { status: 200 });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    return new Response('Erreur serveur', { status: 500 });
  }
}

// Gestionnaire pour checkout.session.completed
async function handleCheckoutSessionCompleted(session) {
  console.log('💳 Paiement réussi:', session.id);
  
  const { userId, userType } = session.metadata || {};
  
  if (userId && userType) {
    // Mettre à jour le plan de l'utilisateur dans votre base de données
    try {
      // Ici vous pouvez appeler votre API pour mettre à jour le plan
      console.log(`✅ Plan mis à jour pour ${userType} ${userId}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour plan:', error);
    }
  }
}

// Gestionnaire pour subscription.created
async function handleSubscriptionCreated(subscription) {
  console.log('📝 Abonnement créé:', subscription.id);
  
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0].price.id;
  
  // Déterminer le type de plan basé sur le priceId
  const planType = getPlanTypeFromPriceId(priceId);
  
  if (planType) {
    // Mettre à jour le plan de l'utilisateur
    console.log(`✅ Abonnement ${planType} créé pour ${customerId}`);
  }
}

// Gestionnaire pour subscription.updated
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Abonnement modifié:', subscription.id);
  
  if (subscription.status === 'active') {
    console.log('✅ Abonnement activé');
  } else if (subscription.status === 'canceled') {
    console.log('❌ Abonnement annulé');
  }
}

// Gestionnaire pour subscription.deleted
async function handleSubscriptionDeleted(subscription) {
  console.log('🗑️ Abonnement supprimé:', subscription.id);
  
  // Rétrograder l'utilisateur vers le plan gratuit
  console.log('⬇️ Utilisateur rétrogradé vers le plan gratuit');
}

// Gestionnaire pour invoice.payment_succeeded
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('💰 Facture payée:', invoice.id);
  
  if (invoice.subscription) {
    console.log('✅ Abonnement renouvelé');
  }
}

// Gestionnaire pour invoice.payment_failed
async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Échec de paiement:', invoice.id);
  
  // Notifier l'utilisateur ou suspendre l'abonnement
  console.log('⚠️ Échec de paiement détecté');
}

// Fonction utilitaire pour déterminer le type de plan
function getPlanTypeFromPriceId(priceId) {
  const planMapping = {
    // Ajoutez ici vos priceId Stripe
    'price_premium_candidat': 'premium',
    'price_pro_candidat': 'pro',
    'price_starter': 'starter',
    'price_max': 'max'
  };
  
  return planMapping[priceId] || null;
}
