# 🎯 Flux de Paiement pour les Recruteurs

## 📋 Résumé des Modifications

J'ai implémenté un système complet où les recruteurs doivent obligatoirement payer avant d'accéder aux fonctionnalités de la plateforme.

## 🔄 Nouveau Flux d'Inscription

### 1. Inscription du Recruteur
- Le recruteur s'inscrit sur `/register` avec `role=recruiter`
- **Nouveau comportement** : Redirection automatique vers `/pricing` au lieu de `/login`
- Message affiché : "Compte créé ! Vous allez être redirigé vers notre page de tarification pour choisir votre plan."

### 2. Statut Initial du Recruteur
Lors de la création automatique du profil recruteur (dans `server.js`), les valeurs par défaut sont maintenant :
```javascript
{
  planType: undefined,           // Aucun plan défini
  subscriptionStatus: 'pending', // En attente de paiement
  status: 'pending',             // Compte en attente
  subscriptionStartDate: null,
  subscriptionEndDate: null
}
```

### 3. Page de Pricing
- **Nouveau comportement** : Si l'utilisateur est un recruteur, l'onglet "Recruteurs" s'affiche automatiquement
- Les liens de paiement Stripe fonctionnent déjà via les variables d'environnement existantes

### 4. Après Paiement
- Les webhooks Stripe existants mettent automatiquement à jour le statut :
  - `subscriptionStatus: 'active'`
  - `status: 'active'`
  - `planType: 'starter'` ou `'max'` selon le plan choisi

## 🚫 Blocage d'Accès

### Nouveaux Statuts Bloquants
Le système bloque maintenant l'accès pour :
- `subscription_status === 'pending'` ✨ (nouveau)
- `status === 'pending'` ✨ (nouveau)
- `subscription_status === 'cancelled'` (existant)
- `subscription_status === 'expired'` (existant)
- `status === 'suspended'` (existant)

### Composants Protégés
Tous les composants utilisant `RecruiterSubscriptionGuard` sont automatiquement protégés :
- ✅ RecruiterDashboard (onglets favorites, appointments, myjobs, matching)
- ✅ CandidatesListPage
- ✅ Autres composants utilisant le guard

### Messages d'Erreur Personnalisés
Pour les statuts "pending" :
- **Titre** : "Paiement requis" (au lieu de "Accès suspendu")
- **Message** : "Votre compte est en attente de paiement. Veuillez choisir un plan pour accéder à toutes les fonctionnalités."
- **Bouton** : "Choisir mon plan" (au lieu de "Renouveler mon abonnement")

## 🔧 Fichiers Modifiés

### Frontend
1. **`src/pages/RegisterPage.jsx`**
   - Ajout de la redirection vers `/pricing` pour les recruteurs

2. **`src/components/RecruiterSubscriptionGuard.jsx`**
   - Ajout des statuts "pending" dans les vérifications
   - Messages personnalisés pour les nouveaux utilisateurs
   - Boutons adaptés selon le contexte

3. **`src/hooks/useRecruiter.js`**
   - Mise à jour de `canPostJob()` et `canContactCandidate()` pour bloquer les statuts "pending"

4. **`src/pages/PricingPage.jsx`**
   - Affichage automatique de l'onglet "Recruteurs" si l'utilisateur est un recruteur

### Backend
5. **`server.js`**
   - Modification de l'auto-création du profil recruteur avec statuts "pending"

## ✅ Test du Flux

### Scénario de Test
1. **Inscription** : Créer un compte recruteur → Redirection automatique vers `/pricing`
2. **Accès bloqué** : Essayer d'accéder au dashboard → Message "Paiement requis"
3. **Paiement** : Cliquer sur un plan Stripe → Webhook met à jour le statut
4. **Accès autorisé** : Retourner au dashboard → Accès complet aux fonctionnalités

### Commandes de Test
```bash
# Test d'inscription d'un recruteur
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test-recruiter@example.com","password":"password","role":"recruiter"}'

# Vérification du statut initial (doit être pending)
curl -X GET http://localhost:5000/api/recruiters/me \
  -H "Authorization: Bearer <TOKEN>"
```

## 🎉 Avantages de cette Implementation

1. **Sécurisé** : Aucun accès gratuit aux fonctionnalités premium
2. **Transparent** : Messages clairs pour l'utilisateur 
3. **Automatique** : Flux entièrement automatisé sans intervention manuelle
4. **Réversible** : Les webhooks gèrent aussi les annulations
5. **Cohérent** : Utilise le système d'abonnement existant

## 🚀 Déploiement

Toutes les modifications sont prêtes pour le déploiement. Le système est entièrement backward-compatible avec les recruteurs existants.
