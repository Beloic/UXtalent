# 🚀 Guide de Migration vers Supabase

## 📋 Prérequis

1. **Compte Supabase** : Créez un compte sur [supabase.com](https://supabase.com)
2. **Projet Supabase** : Créez un nouveau projet
3. **Variables d'environnement** : Configurez vos clés Supabase

## 🔧 Configuration

### 1. Créer les tables dans Supabase

Exécutez le script SQL `supabase-migration.sql` dans l'éditeur SQL de Supabase :

```sql
-- Copiez et exécutez le contenu de supabase-migration.sql
-- dans l'éditeur SQL de votre projet Supabase
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Configuration Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Configuration du serveur
PORT=3001
NODE_ENV=development
```

### 3. Installer les dépendances

```bash
npm install @supabase/supabase-js
```

## 🔄 Migration des données

### Option 1 : Migration automatique

```bash
# Définir les variables d'environnement
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"

# Exécuter la migration
node migrate-to-supabase.js
```

### Option 2 : Migration manuelle

1. **Candidats** : Exportez depuis `data/candidates.json` et importez dans la table `candidates`
2. **Forum** : Exportez depuis `data/forum.json` et importez dans les tables `forum_posts` et `forum_replies`

## 🗄️ Structure des tables

### Table `candidates`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `name` : Nom du candidat
- `email` : Email (UNIQUE)
- `phone` : Téléphone
- `location` : Localisation
- `experience_years` : Années d'expérience
- `skills` : Compétences (array)
- `portfolio_url` : URL du portfolio
- `linkedin_url` : URL LinkedIn
- `github_url` : URL GitHub
- `bio` : Biographie
- `availability` : Disponibilité
- `remote_work` : Travail à distance
- `salary_expectation` : Attente salariale
- `status` : Statut (pending, approved, rejected)
- `visible` : Visible (boolean)
- `approved` : Approuvé (boolean)
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### Table `forum_posts`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `title` : Titre du post
- `content` : Contenu du post
- `category` : Catégorie
- `tags` : Tags (array)
- `author` : Auteur
- `author_id` : ID de l'auteur
- `author_avatar` : Avatar de l'auteur
- `likes` : Nombre de likes
- `liked_by` : Utilisateurs qui ont liké (array)
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### Table `forum_replies`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `post_id` : ID du post parent (FOREIGN KEY)
- `content` : Contenu de la réponse
- `author` : Auteur
- `author_id` : ID de l'auteur
- `author_avatar` : Avatar de l'auteur
- `likes` : Nombre de likes
- `liked_by` : Utilisateurs qui ont liké (array)
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### Table `server_metrics`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `method` : Méthode HTTP
- `route` : Route
- `status_code` : Code de statut
- `response_time` : Temps de réponse
- `hour` : Heure de la requête
- `error_count` : Nombre d'erreurs
- `error_type` : Type d'erreur
- `created_at` : Date de création

### Table `global_stats`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `total_candidates` : Total des candidats
- `total_posts` : Total des posts
- `total_replies` : Total des réponses
- `total_users` : Total des utilisateurs
- `last_updated` : Dernière mise à jour

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables ont RLS activé avec des politiques par défaut qui permettent toutes les opérations.

### Politiques de sécurité
```sql
-- Exemple de politique restrictive pour les candidats
CREATE POLICY "Candidates can only see approved ones" ON candidates
  FOR SELECT USING (approved = true);

-- Exemple de politique pour les posts du forum
CREATE POLICY "Anyone can read posts" ON forum_posts
  FOR SELECT USING (true);
```

## 🚀 Démarrage

1. **Configurer les variables d'environnement**
2. **Exécuter la migration** : `node migrate-to-supabase.js`
3. **Démarrer le serveur** : `node server.js`
4. **Démarrer le frontend** : `npm run dev`

## 📊 Fonctions SQL disponibles

- `get_forum_stats()` : Statistiques du forum
- `get_candidate_stats()` : Statistiques des candidats
- `get_forum_categories()` : Catégories du forum
- `get_forum_posts()` : Posts avec pagination
- `get_forum_post_with_replies()` : Post avec ses réponses
- `toggle_post_like()` : Like/unlike un post
- `toggle_reply_like()` : Like/unlike une réponse
- `record_metric()` : Enregistrer une métrique
- `get_metrics()` : Obtenir les métriques
- `reset_metrics()` : Réinitialiser les métriques

## 🔄 Avantages de la migration

### ✅ Avantages
- **Scalabilité** : Base de données PostgreSQL professionnelle
- **Performance** : Index optimisés et requêtes rapides
- **Sécurité** : RLS et authentification intégrées
- **Backup** : Sauvegarde automatique
- **Monitoring** : Métriques et logs intégrés
- **API** : API REST et GraphQL automatiques
- **Real-time** : Mises à jour en temps réel

### ❌ Inconvénients
- **Coût** : Service payant (gratuit jusqu'à 500MB)
- **Dépendance** : Dépendance à un service externe
- **Complexité** : Configuration initiale plus complexe

## 🆘 Dépannage

### Erreur de connexion
```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Erreur de migration
```bash
# Vérifier les logs
node migrate-to-supabase.js 2>&1 | tee migration.log
```

### Erreur de permissions
Vérifiez que les politiques RLS sont correctement configurées dans Supabase.

## 📞 Support

- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Communauté** : [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- **Discord** : [Discord Supabase](https://discord.supabase.com)
