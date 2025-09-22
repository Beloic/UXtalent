# 🎯 Guide de Configuration Stripe - UX Jobs Pro

## 📋 Variables d'environnement à configurer

### **1. Pour le développement local**

Créez un fichier `.env` à la racine du projet avec :

```bash
# Configuration Stripe - OBLIGATOIRE pour les paiements
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Liens Stripe pour les paiements - OBLIGATOIRE
VITE_STRIPE_PREMIUM_CANDIDAT_LINK=https://buy.stripe.com/premium_candidat_link
VITE_STRIPE_ELITE_CANDIDAT_LINK=https://buy.stripe.com/elite_candidat_link
VITE_STRIPE_STARTER_LINK=https://buy.stripe.com/starter_link
VITE_STRIPE_MAX_LINK=https://buy.stripe.com/max_link

# Token admin pour les accès spéciaux
ADMIN_TOKEN_SECRET=admin-token-secure-key-change-in-production
```

### **2. Pour Render (Production)**

1. **Connectez-vous à votre dashboard Render**
2. **Allez dans votre service `ux-jobs-pro-backend`**
3. **Cliquez sur "Environment"**
4. **Ajoutez ces variables :**

| Variable | Valeur | Description |
|----------|--------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Secret du webhook Stripe |
| `VITE_STRIPE_PREMIUM_CANDIDAT_LINK` | `https://buy.stripe.com/...` | Lien paiement Premium Candidat |
| `VITE_STRIPE_ELITE_CANDIDAT_LINK` | `https://buy.stripe.com/...` | Lien paiement Elite Candidat |
| `VITE_STRIPE_STARTER_LINK` | `https://buy.stripe.com/...` | Lien paiement Starter |
| `VITE_STRIPE_MAX_LINK` | `https://buy.stripe.com/...` | Lien paiement Max |
| `ADMIN_TOKEN_SECRET` | `votre-token-securise` | Token admin sécurisé |

## 🔧 Étapes de configuration Stripe

### **1. Créer un compte Stripe**
- Allez sur [stripe.com](https://stripe.com)
- Créez un compte ou connectez-vous
- Activez votre compte (vérification d'identité)

### **2. Récupérer les clés API**
- Dans le dashboard Stripe → **Developers** → **API keys**
- Copiez la **Secret key** (`sk_test_...` ou `sk_live_...`)

### **3. Créer les liens de paiement**
- Dans Stripe → **Products** → **+ Add product**
- Créez 4 produits :
  - **Premium Candidat** (ex: 29€/mois)
  - **Elite Candidat** (ex: 49€/mois)
  - **Starter Recruteur** (ex: 99€/mois)
  - **Max Recruteur** (ex: 199€/mois)
- Pour chaque produit, créez un **Payment Link**
- Copiez les URLs des Payment Links

### **4. Configurer les webhooks**
- Dans Stripe → **Developers** → **Webhooks**
- Cliquez **+ Add endpoint**
- URL : `https://votre-domaine-render.com/api/stripe/webhook`
- Événements à écouter :
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copiez le **Signing secret** (`whsec_...`)

## ✅ Vérification

Après configuration, testez :

1. **Démarrez le serveur local :**
   ```bash
   npm run dev:full
   ```

2. **Vérifiez les logs :**
   - Plus d'erreurs "Stripe non configuré"
   - Messages de succès Stripe

3. **Testez un paiement :**
   - Allez sur la page de pricing
   - Cliquez sur un bouton de paiement
   - Vérifiez que Stripe s'ouvre correctement

## 🚨 Problèmes courants

### **Erreur "Stripe non configuré"**
- Vérifiez que `STRIPE_SECRET_KEY` est définie
- Redémarrez le serveur après modification du `.env`

### **Webhook non reçu**
- Vérifiez l'URL du webhook dans Stripe
- Assurez-vous que `STRIPE_WEBHOOK_SECRET` est correct

### **Liens de paiement ne fonctionnent pas**
- Vérifiez que les `VITE_STRIPE_*_LINK` sont corrects
- Testez les liens directement dans Stripe

## 📞 Support

- **Documentation Stripe :** [stripe.com/docs](https://stripe.com/docs)
- **Support Stripe :** Via le dashboard Stripe
- **Logs de l'application :** Vérifiez les fichiers dans `/logs/`
