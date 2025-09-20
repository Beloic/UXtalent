# 🛍️ Configuration des Produits Stripe - Structure Mise à Jour

## 📋 Nouvelle structure de prix

### Pour les Candidats
1. **Gratuit** - 0€ (pas de produit Stripe)
2. **Premium Candidat** - 4,99€/mois
3. **Pro Candidat** - 39€/mois

### Pour les Recruteurs
1. **Gratuit** - 0€ (pas de produit Stripe)
2. **Max Mensuel** - 49€/mois
3. **Max Annuel** - 490€/an

## 📦 Produits à créer dans Stripe

### 1. Premium Candidat
1. Allez dans **Produits** > **Ajouter un produit**
2. **Nom du produit :** `Premium Candidat`
3. **Description :** `Profil candidat complet, Badge Premium visible, Mise en avant dans les recherches, Statistiques de profil détaillées, Accès au forum communautaire, Accès exclusif au Slack communautaire, Support prioritaire`
4. Cliquez sur **Ajouter un prix**
5. **Prix :** `4.99`
6. **Devise :** `EUR`
7. **Facturation :** `Récurent`
8. **Intervalle :** `Mensuel`
9. **Copiez l'ID du prix** (commence par `price_...`)

### 2. Pro Candidat
1. **Nom du produit :** `Pro Candidat`
2. **Description :** `Tous les avantages Premium, Accès aux offres exclusives, Coaching personnalisé, Support dédié, Mise en avant maximale, Statistiques avancées`
3. **Prix :** `39.00`
4. **Devise :** `EUR`
5. **Facturation :** `Récurent`
6. **Intervalle :** `Mensuel`
7. **Copiez l'ID du prix`

### 3. Max Mensuel
1. **Nom du produit :** `Max Mensuel`
2. **Description :** `Profil recruteur premium, Publications illimitées, Recherche avancée de candidats, Statistiques détaillées, Support prioritaire, Badge premium visible`
3. **Prix :** `49.00`
4. **Devise :** `EUR`
5. **Facturation :** `Récurent`
6. **Intervalle :** `Mensuel`
7. **Copiez l'ID du prix**

### 4. Max Annuel
1. **Nom du produit :** `Max Annuel`
2. **Description :** `Tous les avantages Premium, Économie de 2 mois, Accès aux candidats exclusifs, Outils de matching avancés, Support dédié`
3. **Prix :** `490.00`
4. **Devise :** `EUR`
5. **Facturation :** `Récurent`
6. **Intervalle :** `Annuel`
7. **Copiez l'ID du prix**

## 📝 Exemple de configuration complète

```env
# Configuration Stripe (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_votre_clé_secrète_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici

# Configuration Stripe côté client (Vite)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_stripe
VITE_STRIPE_TALENT_PREMIUM_MONTHLY_PRICE_ID=price_XXXXXXXXXXXXXX
VITE_STRIPE_TALENT_PREMIUM_YEARLY_PRICE_ID=price_XXXXXXXXXXXXXX
VITE_STRIPE_RECRUITER_PREMIUM_MONTHLY_PRICE_ID=price_XXXXXXXXXXXXXX
VITE_STRIPE_RECRUITER_PREMIUM_YEARLY_PRICE_ID=price_XXXXXXXXXXXXXX
```

## 🔧 Configuration des webhooks

### Créer un endpoint webhook
1. Dans le tableau de bord Stripe, allez dans **Développeurs** > **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionnez les événements suivants :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Obtenir le secret du webhook
1. Une fois l'endpoint créé, cliquez dessus
2. Dans la section **Signature**, copiez le **Secret de signature** (commence par `whsec_`)

## 🚀 Test de la configuration

### Mode Test
1. Utilisez les clés de test Stripe (commencent par `sk_test_` et `pk_test_`)
2. Testez avec les cartes de test Stripe
3. Vérifiez que les webhooks fonctionnent

### Cartes de test Stripe
- **Succès :** `4242 4242 4242 4242`
- **Échec :** `4000 0000 0000 0002`
- **Annulation :** `4000 0000 0000 0002`

## 📊 Suivi des paiements

### Dashboard Stripe
- Consultez les paiements dans **Paiements**
- Gérez les abonnements dans **Abonnements**
- Consultez les métriques dans **Analytics**

## 🛠️ Dépannage

### Problèmes courants
1. **Clés API incorrectes** : Vérifiez que vous utilisez les bonnes clés (test vs production)
2. **Webhooks non reçus** : Vérifiez l'URL et le secret du webhook
3. **Paiements échoués** : Vérifiez les logs Stripe et votre code

### Logs utiles
- Vérifiez les logs Stripe dans le dashboard
- Consultez les logs de votre application
- Testez avec les outils de développement

## 📝 Notes importantes

- Les produits sont en mode test par défaut
- Passez en mode live pour la production
- Sauvegardez vos IDs de prix
- Testez régulièrement les flux de paiement

## 🔗 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Dashboard Stripe](https://dashboard.stripe.com)
- [Guide de test Stripe](https://stripe.com/docs/testing)