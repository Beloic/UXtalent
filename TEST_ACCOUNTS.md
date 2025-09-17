# 🧪 Comptes de Test - UX Jobs Pro

## Compte Recruteur de Test

### Identifiants de connexion
- **Email** : `be.loic23+5@gmail.com`
- **Mot de passe** : `LoicRecruiter2024!`
- **Rôle** : `recruiter`
- **ID** : `70a4501f-8b08-490f-9070-7f7cf65d8dbe`

### Informations du profil
- **Nom** : `Loic Bernard`
- **Entreprise** : `UX Jobs Pro`
- **Fonction** : `Recruteur Senior`
- **Téléphone** : `+33 6 12 34 56 78`

### Permissions
- ✅ Accès au dashboard recruteur
- ✅ Vue Kanban avec drag & drop
- ✅ Gestion des favoris
- ✅ Export des données (CSV/JSON)
- ✅ Contact des candidats
- ✅ Voir tous les candidats approuvés

## Compte Administrateur

### Identifiants de connexion
- **Email** : `admin@uxjobspro.com`
- **Mot de passe** : `AdminUXJobs2024!`
- **Rôle** : `admin`
- **ID** : `4772b035-159c-428e-8d57-ecd529fe07eb`

### Informations du profil
- **Nom** : `Administrateur UX Jobs Pro`
- **Fonction** : `Administrateur`
- **Statut** : `Confirmé automatiquement`

### Permissions
- ✅ Accès complet au dashboard admin
- ✅ Gestion des candidats (approuver/rejeter)
- ✅ Gestion du forum
- ✅ Gestion des offres d'emploi
- ✅ Statistiques complètes
- ✅ Toutes les permissions recruteur

## Token Admin (pour développement)

### Token d'accès complet
- **Token** : `admin-token`
- **Usage** : Accès complet à toutes les fonctionnalités
- **Permissions** : Toutes les permissions (recruteur + admin)

## Compte Demo (pour tests API)

### Identifiants temporaires
- **Email** : `demo@example.com`
- **ID généré** : `generateTempUserId('demo@example.com')`
- **Usage** : Tests API sans authentification complète

## Instructions d'utilisation

### 1. Connexion normale (Recruteur)
1. Allez sur http://localhost:5175/login
2. Utilisez les identifiants du compte recruteur :
   - Email : `be.loic23+5@gmail.com`
   - Mot de passe : `LoicRecruiter2024!`
3. Vous aurez accès au dashboard recruteur

### 1bis. Connexion Admin
1. Allez sur http://localhost:5175/login
2. Utilisez les identifiants du compte admin :
   - Email : `admin@uxjobspro.com`
   - Mot de passe : `AdminUXJobs2024!`
3. Vous aurez automatiquement accès au dashboard admin

### 2. Connexion admin (pour tests avancés)
1. Connectez-vous normalement d'abord
2. Ouvrez la console développeur (F12)
3. Exécutez le script de connexion admin :
```javascript
localStorage.setItem('supabase.auth.token', JSON.stringify({
  access_token: 'admin-token',
  refresh_token: 'admin-token',
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: {
    id: 'admin-user',
    email: 'admin@example.com',
    user_metadata: { role: 'admin' }
  }
}));
window.location.reload();
```

### 3. Test du Kanban
1. Connectez-vous avec le compte recruteur ou admin
2. Allez dans "Recruiter Dashboard"
3. Cliquez sur l'onglet "Vue Kanban"
4. Testez le drag & drop entre les colonnes

## Notes importantes

- ⚠️ Ces comptes sont uniquement pour le développement/test
- 🔒 Ne pas utiliser ces identifiants en production
- 🧹 Les données de test peuvent être supprimées à tout moment
- 📝 Ce fichier doit être ajouté au .gitignore en production

## Création automatique

Pour créer automatiquement le compte de test, exécutez :
```bash
node create-test-accounts.js
```

## ✅ Compte Recruteur Vérifié

Le compte recruteur suivant a été créé avec succès :

- **Email** : `be.loic23+5@gmail.com`
- **Mot de passe** : `LoicRecruiter2024!`
- **Rôle** : `recruiter`
- **ID** : `70a4501f-8b08-490f-9070-7f7cf65d8dbe`
- **Statut** : ✅ Créé (confirmation email requise)

---
*Dernière mise à jour : $(date)*
