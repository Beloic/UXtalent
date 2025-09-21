# 🏢 Système de Gestion des Recruteurs

## 📋 Vue d'ensemble

Ce document décrit le nouveau système de gestion des recruteurs implémenté dans UX Jobs Pro. Le système permet de gérer les recruteurs, leurs abonnements, leurs quotas et leurs permissions.

## 🗄️ Structure de la Base de Données

### Table `recruiters`

La table `recruiters` contient toutes les informations relatives aux recruteurs :

```sql
CREATE TABLE recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Informations d'abonnement
    plan_type VARCHAR(50) DEFAULT 'starter' CHECK (plan_type IN ('starter', 'max', 'premium', 'custom')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired', 'trial')),
    
    -- Dates d'abonnement
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Informations de paiement
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    payment_method VARCHAR(50),
    
    -- Limites et quotas
    max_job_posts INTEGER DEFAULT 5,
    max_candidate_contacts INTEGER DEFAULT 100,
    max_featured_jobs INTEGER DEFAULT 1,
    
    -- Statistiques
    total_jobs_posted INTEGER DEFAULT 0,
    total_candidates_contacted INTEGER DEFAULT 0,
    total_applications_received INTEGER DEFAULT 0,
    
    -- Métadonnées
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
```

## 📦 Plans et Quotas

### Plan Starter
- **Prix** : 19,99€/mois
- **Offres d'emploi** : 5 maximum
- **Contacts candidats** : 100 maximum
- **Offres mises en avant** : 1 maximum

### Plan Max
- **Prix** : 79€/mois
- **Offres d'emploi** : 50 maximum
- **Contacts candidats** : 1000 maximum
- **Offres mises en avant** : 10 maximum

### Plan Premium
- **Prix** : Sur mesure
- **Offres d'emploi** : Illimité
- **Contacts candidats** : Illimité
- **Offres mises en avant** : Illimité

## 🔧 Fonctions de Base de Données

### Fonctions Principales

```javascript
// Récupérer un recruteur par email
const recruiter = await getRecruiterByEmail('recruiter@example.com');

// Créer un nouveau recruteur
const newRecruiter = await createRecruiter({
  email: 'recruiter@example.com',
  name: 'John Doe',
  company: 'Tech Corp',
  planType: 'starter'
});

// Mettre à jour le plan d'un recruteur
await updateRecruiterPlan(recruiterId, 'max', {
  status: 'active',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});

// Vérifier les permissions
const canPostJob = await canRecruiterPostJob(recruiterId);
const canContactCandidate = await canRecruiterContactCandidate(recruiterId);
```

### Fonctions de Statistiques

```javascript
// Récupérer les statistiques complètes d'un recruteur
const stats = await getRecruiterStats(recruiterId);
// Retourne : activeJobs, favoriteCandidates, remainingJobPosts, etc.

// Incrémenter les compteurs
await incrementJobPosts(recruiterId);
await incrementCandidateContacts(recruiterId);
```

## 🌐 API Endpoints

### Gestion des Recruteurs

```http
# Récupérer tous les recruteurs (admin seulement)
GET /api/recruiters

# Récupérer un recruteur par ID
GET /api/recruiters/:id

# Récupérer un recruteur par email
GET /api/recruiters/email/:email

# Créer un nouveau recruteur (admin seulement)
POST /api/recruiters

# Mettre à jour un recruteur
PUT /api/recruiters/:id

# Supprimer un recruteur (admin seulement)
DELETE /api/recruiters/:id
```

### Statistiques et Permissions

```http
# Récupérer les statistiques d'un recruteur
GET /api/recruiters/:id/stats

# Mettre à jour le plan d'un recruteur (admin seulement)
PUT /api/recruiters/:id/plan

# Vérifier les permissions d'un recruteur
GET /api/recruiters/:id/permissions

# Incrémenter le compteur d'offres
POST /api/recruiters/:id/increment-job-posts

# Incrémenter le compteur de contacts
POST /api/recruiters/:id/increment-candidate-contacts
```

## 🚀 Installation et Migration

### 1. Exécuter la Migration

```bash
# Exécuter le script de migration
node run-migration.js
```

### 2. Vérifier la Création de la Table

```sql
-- Vérifier que la table existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'recruiters';

-- Vérifier les données de test
SELECT * FROM recruiters;
```

### 3. Intégration avec Stripe

Le système est conçu pour s'intégrer avec Stripe pour la gestion des abonnements :

```javascript
// Webhook Stripe pour mettre à jour les abonnements
app.post('/api/stripe/webhook', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const recruiter = await getRecruiterByStripeCustomerId(subscription.customer);
    
    if (recruiter) {
      await updateRecruiterPlan(recruiter.id, subscription.status, {
        stripeSubscriptionId: subscription.id,
        status: subscription.status === 'active' ? 'active' : 'inactive'
      });
    }
  }
});
```

## 🔒 Sécurité et Permissions

### Contrôle d'Accès

- **Admin** : Accès complet à tous les recruteurs
- **Recruteur** : Accès uniquement à ses propres données
- **Candidat** : Aucun accès aux données des recruteurs

### Vérifications Automatiques

- Vérification automatique de l'expiration des abonnements
- Contrôle des quotas avant chaque action
- Mise à jour automatique des timestamps

## 📊 Monitoring et Logs

### Métriques Suivies

- Nombre d'offres publiées par recruteur
- Nombre de candidats contactés
- Utilisation des quotas
- Statut des abonnements

### Logs

Toutes les actions sont loggées avec :
- Timestamp
- ID du recruteur
- Action effectuée
- Résultat

## 🔄 Intégration avec l'Existant

### Modification des Endpoints Existants

Les endpoints existants pour les offres d'emploi et les contacts candidats doivent maintenant :

1. Vérifier les permissions du recruteur
2. Incrémenter les compteurs appropriés
3. Respecter les quotas

### Exemple d'Intégration

```javascript
// Dans l'endpoint de création d'offre
app.post('/api/jobs', requireRole(['recruiter', 'admin']), async (req, res) => {
  const recruiterId = req.user.id;
  
  // Vérifier les permissions
  const canPostJob = await canRecruiterPostJob(recruiterId);
  if (!canPostJob) {
    return res.status(403).json({ 
      error: 'Quota d\'offres d\'emploi atteint ou abonnement expiré' 
    });
  }
  
  // Créer l'offre
  const job = await createJob(jobData, recruiterId);
  
  // Incrémenter le compteur
  await incrementJobPosts(recruiterId);
  
  res.json(job);
});
```

## 🎯 Prochaines Étapes

1. **Intégration Stripe** : Connecter le système avec Stripe pour la gestion des paiements
2. **Interface Admin** : Créer une interface d'administration pour gérer les recruteurs
3. **Notifications** : Ajouter des notifications pour les quotas et expirations
4. **Analytics** : Implémenter des tableaux de bord pour les recruteurs
5. **Tests** : Ajouter des tests unitaires et d'intégration

## 📝 Notes Importantes

- La table `recruiters` est indépendante de la table `candidates`
- Les recruteurs peuvent avoir des profils candidats séparés
- Le système respecte les contraintes de sécurité Supabase (RLS)
- Toutes les dates sont stockées en UTC
- Les quotas sont vérifiés en temps réel
