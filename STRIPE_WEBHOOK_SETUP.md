# 🔧 Configuration des Webhooks Stripe

## 📋 Étapes de configuration

### 1. **Créer l'endpoint webhook dans Stripe Dashboard**

1. **Se connecter à Stripe Dashboard** : https://dashboard.stripe.com
2. **Aller dans** : Developers → Webhooks
3. **Cliquer sur** : "Add endpoint"
4. **URL de l'endpoint** : 
   ```
   https://ux-jobs-pro-backend.onrender.com/api/stripe/webhook
   ```
5. **Événements à écouter** :
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

### 2. **Récupérer le secret webhook**

1. **Après création**, cliquer sur le webhook créé
2. **Dans l'onglet "Signing secret"**, cliquer sur "Reveal"
3. **Copier le secret** (commence par `whsec_...`)

### 3. **Ajouter le secret à Render**

1. **Aller sur Render Dashboard** : https://dashboard.render.com
2. **Sélectionner votre service** : `ux-jobs-pro-backend`
3. **Aller dans** : Environment
4. **Ajouter la variable** :
   - **Key** : `STRIPE_WEBHOOK_SECRET`
   - **Value** : Le secret copié depuis Stripe (ex: `whsec_1234...`)

### 4. **Redéployer le service**

1. **Dans Render**, aller dans l'onglet "Manual Deploy"
2. **Cliquer sur** : "Deploy latest commit"
3. **Attendre** que le déploiement soit terminé

## 🔍 Test des webhooks

### **Tester avec Stripe CLI (optionnel)**

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks en local
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### **Vérifier dans Stripe Dashboard**

1. **Aller dans** : Developers → Webhooks
2. **Cliquer sur votre webhook**
3. **Vérifier les logs** dans l'onglet "Recent deliveries"
4. **Les événements doivent apparaître** avec le statut "Succeeded"

## 📊 Événements gérés

| Événement | Action | Description |
|-----------|--------|-------------|
| `customer.subscription.created` | ✅ | Active le nouveau plan |
| `customer.subscription.updated` | ✅ | Met à jour le statut |
| `customer.subscription.deleted` | ✅ | **Met le plan à 'free'** |
| `checkout.session.completed` | ✅ | Traite les nouveaux abonnements |
| `invoice.payment_succeeded` | ✅ | Confirme les paiements |
| `invoice.payment_failed` | ✅ | Gère les échecs de paiement |

## 🚨 Points importants

### **Pour l'annulation programmée :**
- Quand vous annulez avec `cancel_at_period_end: true`
- Stripe enverra `customer.subscription.deleted` **à la fin de la période**
- Votre webhook mettra automatiquement le plan à 'free'

### **Sécurité :**
- Le webhook vérifie la signature Stripe
- Seuls les événements authentiques sont traités
- Les secrets sont stockés de manière sécurisée

### **Monitoring :**
- Vérifiez régulièrement les logs dans Stripe Dashboard
- Surveillez les échecs de webhook
- Les événements échoués sont automatiquement retentés par Stripe

## 🔧 Dépannage

### **Webhook non reçu :**
1. Vérifier l'URL dans Stripe Dashboard
2. Vérifier que le service Render est en ligne
3. Vérifier les logs Render pour les erreurs

### **Événements échoués :**
1. Vérifier les logs dans Stripe Dashboard
2. Vérifier les variables d'environnement sur Render
3. Vérifier la connectivité à la base de données

### **Plan non mis à jour :**
1. Vérifier que `STRIPE_WEBHOOK_SECRET` est configuré
2. Vérifier que l'API `/api/candidates/email/{email}/plan` fonctionne
3. Vérifier les logs du webhook handler
