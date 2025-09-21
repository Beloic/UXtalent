import Stripe from 'stripe';

console.log('🔧 [VERCEL WEBHOOK] Initialisation du module webhook');
console.log('🔧 [VERCEL WEBHOOK] Stripe key présent:', !!process.env.STRIPE_SECRET_KEY);
console.log('🔧 [VERCEL WEBHOOK] Webhook secret présent:', !!process.env.STRIPE_WEBHOOK_SECRET);

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

console.log('🔧 [VERCEL WEBHOOK] Stripe initialisé:', !!stripe);

export async function POST(req) {
  try {
    console.log('🔔 [VERCEL WEBHOOK] Webhook Stripe reçu sur Vercel');
    console.log('🔍 [VERCEL WEBHOOK] Headers:', Object.fromEntries(req.headers.entries()));
    
    if (!stripe) {
      console.error('❌ [VERCEL WEBHOOK] Stripe non initialisé');
      return new Response('Stripe non configuré', { status: 500 });
    }
    
    const body = await req.text();
    console.log('🔍 [VERCEL WEBHOOK] Body récupéré, taille:', body?.length || 'undefined');
    
    const signature = req.headers.get('stripe-signature');
    console.log('🔍 [VERCEL WEBHOOK] Signature récupérée:', !!signature);

    console.log('🔍 [VERCEL WEBHOOK] Stripe configuré:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 [VERCEL WEBHOOK] Webhook secret configuré:', !!process.env.STRIPE_WEBHOOK_SECRET);

    if (!signature) {
      console.error('❌ [VERCEL WEBHOOK] Signature Stripe manquante');
      return new Response('Signature manquante', { status: 400 });
    }
    
    if (!webhookSecret) {
      console.error('❌ [VERCEL WEBHOOK] Secret webhook manquant');
      return new Response('Secret webhook manquant', { status: 500 });
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
    console.error('❌ [VERCEL WEBHOOK] Erreur webhook:', error);
    console.error('🔍 [VERCEL WEBHOOK] Stack trace:', error.stack);
    console.error('🔍 [VERCEL WEBHOOK] Variables env:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...'
    });
    return new Response('Erreur serveur', { status: 500 });
  }
}

// Gestionnaire pour checkout.session.completed
async function handleCheckoutSessionCompleted(session) {
  console.log('💳 Paiement réussi:', session.id);
  console.log('🔍 [WEBHOOK] Session complète:', JSON.stringify(session, null, 2));
  
  try {
    // Récupérer l'email du customer depuis Stripe
    const customer = await stripe.customers.retrieve(session.customer);
    const userEmail = customer.email;
    
    console.log('🔍 [WEBHOOK] Customer récupéré:', JSON.stringify(customer, null, 2));
    
    if (!userEmail) {
      console.error('❌ Email du customer non trouvé');
      return;
    }
    
    console.log('📧 Email du customer:', userEmail);
    
    // Déterminer le type de plan basé sur le priceId
    const priceId = session.line_items?.data[0]?.price?.id || session.amount_total;
    console.log('🔍 [WEBHOOK] PriceId détecté:', priceId);
    console.log('🔍 [WEBHOOK] Line items:', JSON.stringify(session.line_items, null, 2));
    
    const planType = getPlanTypeFromPriceId(priceId);
    
    if (!planType) {
      console.error('❌ Type de plan non déterminé pour:', priceId);
      console.log('🔍 [WEBHOOK] Mapping des prix disponible:', JSON.stringify(getPlanTypeFromPriceId, null, 2));
      return;
    }
    
    console.log('🎯 Plan détecté:', planType);
    console.log('🚀 [WEBHOOK] Début mise à jour plan pour:', userEmail, 'vers:', planType);
    
    // Mettre à jour le plan dans la base de données
    await updateUserPlan(userEmail, planType);
    
    console.log('✅ [WEBHOOK] Mise à jour plan terminée pour:', userEmail);
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement:', error);
    console.error('🔍 [WEBHOOK] Stack trace:', error.stack);
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
    console.log(`🔄 [WEBHOOK] Mise à jour du plan pour ${userEmail} vers ${planType}`);
    
    // Utiliser l'API Render directement
    const apiUrl = `https://ux-jobs-pro-backend.onrender.com/api/candidates/email/${encodeURIComponent(userEmail)}/plan`;
    console.log(`🔍 [WEBHOOK] URL API appelée:`, apiUrl);
    
    const requestBody = { planType, durationMonths: 1 };
    console.log(`🔍 [WEBHOOK] Corps de la requête:`, JSON.stringify(requestBody, null, 2));
    
    console.log(`🔍 [WEBHOOK] Début appel fetch...`);
    
    // Appeler l'API pour mettre à jour le plan
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN_SECRET || 'admin-token'}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`🔍 [WEBHOOK] Réponse API status:`, response.status);
    console.log(`🔍 [WEBHOOK] Réponse API headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ [WEBHOOK] Plan mis à jour avec succès pour ${userEmail}:`, JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.error(`❌ [WEBHOOK] Erreur API lors de la mise à jour du plan: ${response.status}`);
      console.error(`🔍 [WEBHOOK] Réponse d'erreur:`, errorText);
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erreur lors de la mise à jour du plan:', error);
    console.error('🔍 [WEBHOOK] Stack trace:', error.stack);
  }
}
