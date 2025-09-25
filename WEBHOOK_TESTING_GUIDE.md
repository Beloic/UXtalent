# 🧪 Guide de Test des Webhooks Stripe - UX Jobs Pro

Ce guide explique comment tester complètement le système de webhooks Stripe pour s'assurer que tout fonctionne parfaitement.

## 📋 Prérequis

### Variables d'environnement requises
```bash
# Obligatoires pour les tests
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
ADMIN_TOKEN_SECRET=votre_token_admin

# Optionnelles (pour les tests complets)
STRIPE_SECRET_KEY=sk_test_votre_clé_stripe
```

### Installation des dépendances
```bash
npm install node-fetch crypto
```

## 🚀 Scripts de Test Disponibles

### 1. **test-webhooks.js** - Tests Basiques
Teste les événements webhook de base avec des données simulées.

```bash
node test-webhooks.js
```

**Ce qui est testé :**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ Mapping des plans par priceId

### 2. **test-webhooks-complete.js** - Tests Complets
Teste le flux complet : création d'utilisateur → webhook → vérification du plan.

```bash
node test-webhooks-complete.js
```

**Ce qui est testé :**
- ✅ Création d'utilisateurs de test (candidats et recruteurs)
- ✅ Simulation d'événements webhook réels
- ✅ Vérification de la mise à jour des plans en base
- ✅ Test des différents scénarios de paiement

### 3. **test-webhooks-errors.js** - Tests d'Erreur
Teste la gestion des cas d'erreur et les edge cases.

```bash
node test-webhooks-errors.js
```

**Ce qui est testé :**
- ✅ Signature manquante ou invalide
- ✅ Payload JSON invalide
- ✅ Événements avec types inconnus
- ✅ Données manquantes
- ✅ Utilisateurs inexistants
- ✅ Test de charge (webhooks simultanés)

### 4. **test-all-webhooks.js** - Suite Complète
Lance tous les tests dans l'ordre optimal.

```bash
node test-all-webhooks.js
```

## 🎯 Scénarios de Test Couverts

### Tests de Paiement Candidats
| Plan | Prix | PriceId | Test |
|------|------|---------|------|
| Premium | 7,99€ | 799 | ✅ |
| Elite | 39€ | 3900 | ✅ |

### Tests d'Abonnement Recruteurs
| Plan | Prix | PriceId | Limites | Test |
|------|------|---------|---------|------|
| Starter | 19,99€ | 1999 | 5 jobs, 100 contacts | ✅ |
| Max | 79€ | 7900 | 50 jobs, 1000 contacts | ✅ |

### Tests de Gestion d'Erreur
- ✅ Signature Stripe invalide
- ✅ Payload malformé
- ✅ Événements non gérés
- ✅ Utilisateurs inexistants
- ✅ Plans non mappés

## 📊 Interprétation des Résultats

### ✅ Test Réussi
```
✅ Test réussi!
📊 Status: 200 OK
📝 Réponse: {"received": true}
```

### ❌ Test Échoué
```
❌ Test échoué!
📊 Status: 400 Bad Request
📝 Réponse: {"error": "Signature manquante"}
```

### 🎯 Résumé Final
```
🎯 Résultat global: 15/15 tests réussis
🎉 FÉLICITATIONS! Tous les tests sont passés!
```

## 🔧 Dépannage

### Erreur de Signature
```
❌ Erreur de vérification webhook: Invalid signature
```
**Solution :** Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct.

### Erreur de Connexion
```
💥 Erreur réseau: connect ECONNREFUSED
```
**Solution :** Vérifiez que le serveur backend est démarré et accessible.

### Utilisateur Non Trouvé
```
❌ Utilisateur non trouvé
```
**Solution :** Normal pour les tests avec des emails de test. Vérifiez que l'API fonctionne.

## 🚨 Points de Vigilance

### 1. Configuration Stripe
- ✅ Webhook endpoint configuré dans Stripe Dashboard
- ✅ Secret webhook correct
- ✅ Événements sélectionnés dans Stripe

### 2. Base de Données
- ✅ Tables `candidates` et `recruiters` existantes
- ✅ Colonnes `plan_type` et `subscription_status` présentes
- ✅ Permissions d'écriture pour l'API

### 3. Logs de Production
Surveillez ces logs en production :
```bash
# Logs de webhook
grep "Webhook Stripe" logs/app-*.log

# Erreurs de paiement
grep "Erreur webhook" logs/error-*.log
```

## 📈 Tests de Charge

Le script `test-webhooks-errors.js` inclut un test de charge qui simule 5 webhooks simultanés.

**Métriques attendues :**
- ⏱️ Temps d'exécution : < 5 secondes
- 📊 Succès : 5/5 webhooks traités
- 🎯 Tous les webhooks doivent retourner 200 OK

## 🔄 Tests en Continu

Pour des tests réguliers, créez un cron job :

```bash
# Tester les webhooks chaque heure
0 * * * * cd /path/to/ux-jobs-pro && node test-webhooks.js
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Testez avec `test-webhooks.js` d'abord
3. Vérifiez la configuration Stripe
4. Contactez le support technique

---

**🎉 Une fois tous les tests passés, votre système de webhooks Stripe est prêt pour la production !**
