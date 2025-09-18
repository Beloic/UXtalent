# 📁 Scripts UX Jobs Pro

Ce dossier contient les scripts essentiels pour la gestion et le déploiement de l'application UX Jobs Pro.

## 📋 Scripts Disponibles

### 🗄️ **Base de Données**

Les scripts SQL ont été retirés du dépôt. Utilisez les migrations Supabase ou l'éditeur SQL du dashboard pour gérer le schéma.

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

# 2. Créer les tables (via migrations Supabase ou SQL Editor)

# 3. Vérifier l'installation (requêtes ad hoc dans l'éditeur SQL)
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
