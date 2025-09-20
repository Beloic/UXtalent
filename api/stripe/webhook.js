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
  
  try {
    // Récupérer l'email du customer depuis Stripe
    const customer = await stripe.customers.retrieve(session.customer);
    const userEmail = customer.email;
    
    if (!userEmail) {
      console.error('❌ Email du customer non trouvé');
      return;
    }
    
    console.log('📧 Email du customer:', userEmail);
    
    // Déterminer le type de plan basé sur le priceId
    const priceId = session.line_items?.data[0]?.price?.id || session.amount_total;
    const planType = getPlanTypeFromPriceId(priceId);
    
    if (!planType) {
      console.error('❌ Type de plan non déterminé pour:', priceId);
      return;
    }
    
    console.log('🎯 Plan détecté:', planType);
    
    // Mettre à jour le plan dans la base de données
    await updateUserPlan(userEmail, planType);
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement:', error);
  }
}

// Gestionnaire pour subscription.created
async function handleSubscriptionCreated(subscription) {
  console.log('📝 Abonnement créé:', subscription.id);
  
  try {
    // Récupérer l'email du customer depuis Stripe
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userEmail = customer.email;
    
    if (!userEmail) {
      console.error('❌ Email du customer non trouvé');
      return;
    }
    
    const priceId = subscription.items.data[0].price.id;
    const planType = getPlanTypeFromPriceId(priceId);
    
    if (planType) {
      // Mettre à jour le plan dans la base de données
      await updateUserPlan(userEmail, planType);
      console.log(`✅ Abonnement ${planType} créé pour ${userEmail}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du traitement de l\'abonnement:', error);
  }
}

// Gestionnaire pour subscription.updated
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Abonnement modifié:', subscription.id, 'Status:', subscription.status);
  
  try {
    // Récupérer l'email du customer depuis Stripe
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userEmail = customer.email;
    
    if (!userEmail) {
      console.error('❌ Email du customer non trouvé pour la mise à jour');
      return;
    }
    
    if (subscription.status === 'active') {
      console.log('✅ Abonnement activé pour:', userEmail);
      // Déterminer le type de plan basé sur le priceId
      const priceId = subscription.items.data[0].price.id;
      const planType = getPlanTypeFromPriceId(priceId);
      
      if (planType) {
        await updateUserPlan(userEmail, planType);
        console.log(`✅ Plan ${planType} activé pour ${userEmail}`);
      }
    } else if (subscription.status === 'canceled') {
      console.log('❌ Abonnement annulé pour:', userEmail);
      await updateUserPlan(userEmail, 'free');
      console.log('⬇️ Utilisateur rétrogradé vers le plan gratuit:', userEmail);
    } else if (subscription.status === 'past_due') {
      console.log('⚠️ Abonnement en retard pour:', userEmail);
      // Optionnel : mettre à jour le statut ou envoyer une notification
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
  }
}

// Gestionnaire pour subscription.deleted
async function handleSubscriptionDeleted(subscription) {
  console.log('🗑️ Abonnement supprimé:', subscription.id);
  
  try {
    // Récupérer l'email du customer depuis Stripe
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userEmail = customer.email;
    
    if (!userEmail) {
      console.error('❌ Email du customer non trouvé pour l\'annulation');
      return;
    }
    
    console.log('📧 Email du customer pour annulation:', userEmail);
    
    // Mettre à jour le plan vers 'free' dans la base de données
    await updateUserPlan(userEmail, 'free');
    
    console.log('⬇️ Utilisateur rétrogradé vers le plan gratuit:', userEmail);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'annulation de l\'abonnement:', error);
  }
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
  // Pour les Payment Links, on peut aussi utiliser le montant
  const planMapping = {
    // Price IDs Stripe
    'price_premium_candidat': 'premium',
    'price_pro_candidat': 'pro',
    'price_starter': 'starter',
    'price_max': 'max',
    // Montants en centimes pour les Payment Links
    499: 'premium', // 4.99€
    3900: 'pro',    // 39€
    1999: 'starter', // 19.99€
    7900: 'max'     // 79€
  };
  
  return planMapping[priceId] || null;
}

// Fonction pour mettre à jour le plan d'un utilisateur
async function updateUserPlan(userEmail, planType) {
  try {
    console.log(`🔄 Mise à jour du plan pour ${userEmail} vers ${planType}`);
    
    // Appeler l'API pour mettre à jour le plan
    const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/candidates/email/${encodeURIComponent(userEmail)}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN_SECRET || 'admin-token'}`
      },
      body: JSON.stringify({ planType, durationMonths: 1 })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Plan mis à jour avec succès pour ${userEmail}:`, result);
    } else {
      console.error(`❌ Erreur API lors de la mise à jour du plan: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du plan:', error);
  }
}
