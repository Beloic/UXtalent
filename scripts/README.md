# 📁 Scripts UX Jobs Pro

Ce dossier contient les scripts essentiels pour la gestion et le déploiement de l'application UX Jobs Pro.

## 📋 Scripts Disponibles

### 🗄️ **Base de Données**

#### `create_all_tables.sql`
- **Objectif** : Créer toutes les tables nécessaires (`candidates`, `jobs`, `applications`)
- **Usage** : Exécuter dans Supabase SQL Editor lors de la première installation
- **Contenu** : Structure complète des tables avec contraintes et index

#### `verify_database_structure.sql`
- **Objectif** : Vérifier que la structure de la base de données est correcte
- **Usage** : Diagnostic et vérification après installation ou mise à jour
- **Contenu** : Requêtes de vérification des tables, contraintes et données

### 🔐 **Sécurité**

#### `generate-secrets.sh`
- **Objectif** : Générer tous les secrets de sécurité nécessaires
- **Usage** : `./scripts/generate-secrets.sh`
- **Contenu** : Génération automatique des clés JWT, SSH, et autres secrets

### 🚀 **Déploiement**

#### `deploy.sh`
- **Objectif** : Script de déploiement automatisé
- **Usage** : `./scripts/deploy.sh [environment]`
- **Contenu** : Déploiement complet avec sauvegarde et rollback

## 🛠️ Utilisation

### Installation Initiale
```bash
# 1. Générer les secrets
./scripts/generate-secrets.sh

# 2. Créer les tables (dans Supabase SQL Editor)
# Copier le contenu de create_all_tables.sql

# 3. Vérifier l'installation
# Copier le contenu de verify_database_structure.sql
```

### Déploiement
```bash
# Déploiement en production
./scripts/deploy.sh production

# Déploiement en staging
./scripts/deploy.sh staging
```

## 📝 Notes

- Tous les scripts de test et de données temporaires ont été supprimés
- Seuls les scripts essentiels au fonctionnement de l'application sont conservés
- Les scripts sont organisés par fonctionnalité (DB, sécurité, déploiement)

## 🔒 Sécurité

- Les secrets générés ne doivent jamais être commités
- Utiliser GitHub Secrets pour le déploiement automatique
- Tester les scripts dans un environnement de développement avant la production
