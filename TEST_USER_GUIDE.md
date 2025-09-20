# 🧪 Guide de l'Utilisateur de Test - UX Jobs Pro

## 📋 Vue d'ensemble

Ce guide explique comment créer, tester et gérer un utilisateur de test complet pour l'application UX Jobs Pro. L'utilisateur de test inclut toutes les données nécessaires pour tester les fonctionnalités principales de l'application.

## 🚀 Scripts disponibles

### 1. Création de l'utilisateur de test complet
```bash
node create-complete-test-user.js
```

**Ce script crée :**
- ✅ Un profil candidat complet avec toutes les informations
- ✅ 15 vues de profil simulées sur 15 jours
- ✅ Des métriques de serveur de test
- ✅ Des posts et réponses de forum (si les colonnes existent)

**Données de l'utilisateur de test :**
- **Email** : `test.user@uxjobspro.com`
- **Nom** : `Test User`
- **Titre** : `Senior UX Designer`
- **Localisation** : `Paris, France`
- **Mode de travail** : `hybrid`
- **Expérience** : `Senior`
- **Statut** : `approved`
- **Plan** : `premium` (mis en avant)
- **Salaire** : `70 000€/an`
- **Taux journalier** : `600€`

### 2. Vérification des données
```bash
node verify-test-user.js
```

**Ce script vérifie :**
- ✅ La présence du candidat en base
- ✅ Les données de tracking (vues de profil)
- ✅ Les métriques de serveur
- ✅ Les posts et réponses de forum
- ✅ Le fonctionnement des fonctionnalités principales

### 3. Test des fonctionnalités
```bash
node test-user-functionalities.js
```

**Ce script teste :**
- 🔍 **Recherche** : par titre, localisation, compétences, remote
- 🎯 **Filtrage** : par expérience, plan premium
- 📊 **Tri** : par date, candidats mis en avant
- 📈 **Statistiques** : par statut, expérience, localisation
- 👁️ **Tracking** : comptage et ajout de vues
- 💬 **Forum** : posts et réponses
- ✏️ **Mise à jour** : modification des profils

### 4. Nettoyage (optionnel)
```bash
node cleanup-test-user.js
```

**Ce script supprime :**
- 🗑️ Le profil candidat
- 🗑️ Les données de tracking
- 🗑️ Les favoris associés
- 🗑️ Les posts et réponses de forum

## 📊 Résultats des tests

### ✅ Fonctionnalités testées avec succès

1. **Recherche de candidats**
   - Recherche par titre : 6 candidats UX Designer trouvés
   - Recherche par localisation : 4 candidats à Paris trouvés
   - Recherche par compétences : 8 candidats avec Figma/Adobe XD trouvés
   - Recherche par remote : 6 candidats en mode hybride trouvés

2. **Filtrage des candidats**
   - Filtre par expérience Senior : 3 candidats trouvés
   - Filtre par plan premium : 1 candidat trouvé

3. **Tri des candidats**
   - Tri par date (plus récents) : 5 candidats
   - Tri par candidats mis en avant : 1 candidat

4. **Statistiques**
   - Par statut : 10 candidats approuvés
   - Par expérience : Mid (4), Senior (3), Junior (1), Lead (2)
   - Par localisation : Paris (3), Lyon (1), Marseille (1), etc.

5. **Tracking des vues**
   - Total des vues : 16 vues
   - Vues des 7 derniers jours : 8 vues
   - Ajout de nouvelles vues : Fonctionnel

6. **Forum**
   - 4 posts récents trouvés
   - 11 réponses au total
   - Statistiques : Fonctionnelles

7. **Mise à jour de profil**
   - Modification de la bio : Fonctionnelle
   - Mise à jour des timestamps : Fonctionnelle

## 🔧 Configuration technique

### Prérequis
- Node.js installé
- Accès à la base de données Supabase
- Clés d'API Supabase configurées

### Structure de la base de données testée
- **Table `candidates`** : Profils candidats
- **Table `profile_tracking`** : Vues de profil
- **Table `forum_posts`** : Posts du forum
- **Table `forum_replies`** : Réponses du forum
- **Table `server_metrics`** : Métriques de serveur
- **Table `recruiter_favorites`** : Favoris des recruteurs

## 🎯 Cas d'usage

### Pour les développeurs
1. **Tests de développement** : Utiliser l'utilisateur de test pour valider les nouvelles fonctionnalités
2. **Tests de régression** : Vérifier que les modifications n'ont pas cassé les fonctionnalités existantes
3. **Tests de performance** : Mesurer les performances avec des données réalistes

### Pour les tests QA
1. **Tests fonctionnels** : Valider toutes les fonctionnalités principales
2. **Tests d'intégration** : Vérifier l'interaction entre les différents modules
3. **Tests de données** : S'assurer que les données remontent correctement

### Pour les démonstrations
1. **Démos client** : Présenter l'application avec des données réalistes
2. **Formations** : Former les utilisateurs avec des exemples concrets
3. **Documentation** : Illustrer les fonctionnalités avec des données de test

## ⚠️ Notes importantes

### Sécurité
- ⚠️ L'utilisateur de test utilise des données fictives
- ⚠️ Ne pas utiliser ces données en production
- ⚠️ Supprimer l'utilisateur de test après les tests

### Maintenance
- 🔄 Recréer l'utilisateur de test si nécessaire
- 🔄 Mettre à jour les scripts si la structure de la base change
- 🔄 Vérifier régulièrement que les tests passent

### Limitations
- 📝 Certaines colonnes peuvent ne pas exister (ex: `languages`, `author_email`)
- 📝 Les métriques de serveur peuvent avoir des colonnes différentes
- 📝 Les tests dépendent de la structure actuelle de la base

## 🚀 Prochaines étapes

1. **Tests automatisés** : Intégrer ces scripts dans une suite de tests automatisés
2. **Tests de charge** : Créer plusieurs utilisateurs de test pour les tests de performance
3. **Tests d'interface** : Automatiser les tests d'interface utilisateur
4. **Monitoring** : Surveiller les performances en continu

## 📞 Support

En cas de problème avec les scripts de test :
1. Vérifier la connexion à la base de données
2. Vérifier les clés d'API Supabase
3. Consulter les logs d'erreur détaillés
4. Contacter l'équipe de développement

---

*Dernière mise à jour : 20 septembre 2025*
