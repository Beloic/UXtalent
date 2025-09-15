# 🔐 Système de Rôles et Permissions

## Vue d'ensemble

Le système de rôles et permissions a été implémenté pour sécuriser l'accès aux différentes fonctionnalités de l'application et éviter qu'un recruteur se fasse passer pour un candidat.

## 🎭 Rôles disponibles

### 1. **Candidat** (`candidate`)
- **Description** : Utilisateurs qui créent et gèrent leur profil professionnel
- **Permissions** :
  - ✅ Voir son propre profil
  - ✅ Modifier son propre profil
  - ✅ Voir ses statistiques personnelles
  - ✅ Voir les profils publics (freemium)
  - ❌ Accès aux fonctionnalités recruteur

### 2. **Recruteur** (`recruiter`)
- **Description** : Utilisateurs qui recherchent et contactent des candidats
- **Permissions** :
  - ✅ Voir tous les candidats approuvés
  - ✅ Contacter les candidats
  - ✅ Exporter les données
  - ✅ Accès au dashboard recruteur
  - ❌ Modifier les profils candidats

### 3. **Administrateur** (`admin`)
- **Description** : Utilisateurs avec accès complet au système
- **Permissions** :
  - ✅ Voir tous les profils (même non approuvés)
  - ✅ Approuver/rejeter les profils
  - ✅ Supprimer les profils
  - ✅ Gérer les utilisateurs
  - ✅ Voir les analytics
  - ✅ Toutes les permissions recruteur

## 🛡️ Sécurité implémentée

### Côté Serveur
- **Vérification des rôles** : Chaque requête API vérifie le rôle de l'utilisateur
- **Filtrage des données** : Les données retournées dépendent du rôle
- **Token admin sécurisé** : Token spécial pour les administrateurs
- **Validation des permissions** : Middleware de vérification des permissions

### Côté Client
- **Protection des composants** : Composants `RoleGuard` et `PermissionGuard`
- **Navigation conditionnelle** : Affichage des menus selon le rôle
- **Hooks de permissions** : `usePermissions` pour vérifier les droits
- **Rendu conditionnel** : Affichage conditionnel du contenu

## 📁 Structure des fichiers

```
src/
├── middleware/
│   └── roleMiddleware.js          # Définition des rôles et permissions
├── hooks/
│   └── usePermissions.js         # Hook React pour les permissions
├── components/
│   └── RoleGuard.jsx             # Composants de protection
└── pages/
    └── RecruiterDashboard.jsx    # Exemple de page protégée
```

## 🔧 Utilisation

### 1. Protection d'une page complète

```jsx
import { RoleGuard } from '../components/RoleGuard';

function MaPage() {
  return (
    <RoleGuard allowedRoles={['recruiter', 'admin']}>
      <div>Contenu visible uniquement aux recruteurs et admins</div>
    </RoleGuard>
  );
}
```

### 2. Protection d'un composant

```jsx
import { PermissionGuard } from '../components/RoleGuard';

function MonComposant() {
  return (
    <PermissionGuard permission="export_data">
      <button>Exporter les données</button>
    </PermissionGuard>
  );
}
```

### 3. Rendu conditionnel

```jsx
import { ConditionalRender } from '../components/RoleGuard';

function Navigation() {
  return (
    <nav>
      <ConditionalRender role="candidate">
        <Link to="/my-profile">Mon profil</Link>
      </ConditionalRender>
      
      <ConditionalRender role="recruiter">
        <Link to="/dashboard">Dashboard</Link>
      </ConditionalRender>
    </nav>
  );
}
```

### 4. Utilisation du hook

```jsx
import { usePermissions } from '../hooks/usePermissions';

function MonComposant() {
  const { isRecruiter, canExportData, userRole } = usePermissions();
  
  if (!isRecruiter) {
    return <div>Accès refusé</div>;
  }
  
  return (
    <div>
      <p>Rôle: {userRole}</p>
      {canExportData && <button>Exporter</button>}
    </div>
  );
}
```

## 🚀 Routes protégées

### Candidats
- `/my-profile` - Profil personnel
- `/profile-stats` - Statistiques personnelles

### Recruteurs
- `/recruiter-dashboard` - Dashboard recruteur
- `/candidates` - Liste complète des candidats

### Administrateurs
- `/admin` - Panel d'administration
- Toutes les routes précédentes

## 🔒 Sécurité contre l'usurpation

### Problème résolu
- **Avant** : Un recruteur pouvait créer un compte candidat et voir tous les profils
- **Après** : Chaque rôle a des permissions strictes et vérifiées

### Mesures de sécurité
1. **Vérification côté serveur** : Impossible de contourner les restrictions
2. **Rôles dans les métadonnées** : Stockés dans Supabase Auth
3. **Filtrage des données** : Seules les données autorisées sont retournées
4. **Logs de sécurité** : Traçabilité des accès par rôle

## 📊 Permissions détaillées

| Permission | Candidat | Recruteur | Admin |
|------------|----------|-----------|-------|
| `view_own_profile` | ✅ | ❌ | ✅ |
| `edit_own_profile` | ✅ | ❌ | ✅ |
| `view_own_stats` | ✅ | ❌ | ✅ |
| `view_public_profiles` | ✅ | ✅ | ✅ |
| `view_all_candidates` | ❌ | ✅ | ✅ |
| `contact_candidates` | ❌ | ✅ | ✅ |
| `export_data` | ❌ | ✅ | ✅ |
| `view_all_profiles` | ❌ | ❌ | ✅ |
| `approve_profiles` | ❌ | ❌ | ✅ |
| `delete_profiles` | ❌ | ❌ | ✅ |
| `manage_users` | ❌ | ❌ | ✅ |
| `view_analytics` | ❌ | ❌ | ✅ |

## 🛠️ Configuration

### Ajout d'un nouveau rôle
1. Ajouter le rôle dans `ROLES` (roleMiddleware.js)
2. Définir les permissions dans `ROLE_PERMISSIONS`
3. Ajouter les permissions dans `PERMISSIONS`
4. Mettre à jour les composants de protection

### Ajout d'une nouvelle permission
1. Ajouter la permission dans `PERMISSIONS`
2. L'assigner aux rôles appropriés dans `ROLE_PERMISSIONS`
3. Utiliser `requirePermission` dans les routes serveur
4. Utiliser `can()` dans les composants React

## 🔍 Debugging

### Vérifier le rôle d'un utilisateur
```javascript
// Côté client
const { userRole, isAuthenticated } = usePermissions();
console.log('Rôle utilisateur:', userRole);

// Côté serveur
console.log('Rôle utilisateur:', req.userRole);
```

### Logs de sécurité
Les logs du serveur indiquent :
- `✅ Utilisateur authentifié avec le rôle: [role]`
- `❌ Token invalide`
- `⚠️ Rôle non reconnu: [role]`

## 🚨 Points d'attention

1. **Token admin** : Le token `admin-token` est codé en dur (à sécuriser en production)
2. **Métadonnées utilisateur** : Les rôles sont stockés dans `user_metadata` de Supabase
3. **Côté client** : Les permissions côté client sont uniquement pour l'UX, la vraie sécurité est côté serveur
4. **Performance** : Chaque requête vérifie le rôle (considérer le cache si nécessaire)

## 📈 Évolutions futures

- [ ] Système de rôles hiérarchiques
- [ ] Permissions granulaires par ressource
- [ ] Audit trail des accès
- [ ] Interface d'administration des rôles
- [ ] Intégration avec des systèmes externes (LDAP, etc.)
