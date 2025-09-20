# Configuration Stripe sur Render

## 🚨 Problème actuel

L'erreur 500 lors de l'annulation d'abonnement indique que la variable d'environnement `STRIPE_SECRET_KEY` n'est pas configurée sur le serveur de production Render.

## 🔧 Solution : Configuration des variables d'environnement

### 1. Accéder au dashboard Render

1. Connectez-vous à [render.com](https://render.com)
2. Sélectionnez votre service backend (`ux-jobs-pro-backend`)
3. Allez dans l'onglet **Environment**

### 2. Ajouter les variables Stripe

Ajoutez les variables d'environnement suivantes :

```env
STRIPE_SECRET_KEY=sk_live_votre_clé_secrète_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici
```

### 3. Obtenir les clés Stripe

#### Clés de production (recommandé)
1. Connectez-vous à [stripe.com](https://stripe.com)
2. Allez dans **Développeurs** > **Clés API**
3. Copiez la **Clé secrète** (commence par `sk_live_`)
4. Copiez la **Clé publique** (commence par `pk_live_`)

#### Clés de test (pour les tests)
1. Dans Stripe, activez le **Mode test**
2. Copiez la **Clé secrète de test** (commence par `sk_test_`)
3. Copiez la **Clé publique de test** (commence par `pk_test_`)

### 4. Configurer le webhook

1. Dans Stripe, allez dans **Développeurs** > **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL : `https://ux-jobs-pro-backend.onrender.com/api/stripe/webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Secret de signature** (commence par `whsec_`)

### 5. Redéployer le service

1. Après avoir ajouté les variables d'environnement
2. Cliquez sur **Manual Deploy** > **Deploy latest commit**
3. Attendez que le déploiement se termine

## ✅ Vérification

Une fois configuré, l'annulation d'abonnement devrait fonctionner :

1. Allez sur la page "Mon plan"
2. Cliquez sur "Annuler mon plan"
3. Confirmez l'annulation
4. Le plan devrait être annulé immédiatement

## 🆘 Support

Si vous avez besoin d'aide pour configurer Stripe, contactez :
- **Email** : contact@ux-jobs-pro.com
- **Documentation Stripe** : https://stripe.com/docs

## 📝 Notes importantes

- **Sécurité** : Ne partagez jamais vos clés secrètes Stripe
- **Test** : Testez d'abord avec les clés de test
- **Production** : Utilisez les clés de production uniquement en production
- **Webhooks** : Assurez-vous que l'URL du webhook est correcte
