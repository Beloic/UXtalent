# Migration : Suppression de la colonne `visible`

## Contexte

La colonne `visible` dans la table `candidates` était redondante avec le champ `status`. Cette migration supprime cette redondance en utilisant uniquement `status === 'approved'` pour déterminer la visibilité des candidats.

## Changements effectués

### 1. Code applicatif mis à jour

✅ **Fichiers modifiés :**
- `server.js` - Logique de filtrage des candidats
- `src/database/candidatesDatabase.js` - Données par défaut
- `src/database/supabaseClient.js` - Logique de mise à jour
- `src/pages/AdminDashboard.jsx` - Interface d'administration
- `src/pages/MyProfilePage.jsx` - Création/modification de profil
- `src/services/matchingApi.js` - Statistiques de matching
- `scripts/update-candidates-pending.js` - Script de maintenance

✅ **Logique simplifiée :**
- `visible: true` → `status: 'approved'`
- `visible: false` → `status: 'pending'` ou `status: 'rejected'`
- Suppression des références à `approved` (également redondant)

### 2. Script de migration créé

📁 **Fichier :** `scripts/migrate-remove-visible-column.js`

Ce script :
- Analyse la cohérence des données actuelles
- Détecte les incohérences entre `visible` et `status`
- Propose et applique les corrections nécessaires
- Génère un rapport de migration

## Étapes de migration

### Étape 1 : Exécuter le script de migration

```bash
cd /Users/loicbernard/Desktop/ux-jobs-pro
node scripts/migrate-remove-visible-column.js
```

### Étape 2 : Tester l'application

Vérifier que :
- ✅ Les candidats approuvés sont visibles
- ✅ Les candidats en attente ne sont pas visibles pour les visiteurs
- ✅ L'interface d'administration fonctionne correctement
- ✅ Les statistiques s'affichent correctement

### Étape 3 : Supprimer la colonne de la base de données

Dans Supabase SQL Editor :

```sql
-- Supprimer la colonne visible
ALTER TABLE candidates DROP COLUMN visible;

-- Optionnel : supprimer aussi la colonne approved (redondante)
ALTER TABLE candidates DROP COLUMN approved;
```

## Avantages de cette migration

1. **Simplicité** : Un seul champ (`status`) pour gérer l'état des candidats
2. **Cohérence** : Plus de risque d'incohérence entre `visible` et `status`
3. **Maintenabilité** : Code plus simple à maintenir
4. **Performance** : Moins de colonnes à indexer et filtrer

## États des candidats

| Status | Description | Visibilité |
|--------|-------------|------------|
| `pending` | En attente de validation | Non visible (sauf admin) |
| `approved` | Validé par un admin | Visible pour tous |
| `rejected` | Rejeté par un admin | Non visible |

## Rollback (si nécessaire)

Si vous devez revenir en arrière :

1. Ajouter la colonne `visible` dans Supabase :
```sql
ALTER TABLE candidates ADD COLUMN visible BOOLEAN DEFAULT false;
```

2. Synchroniser les données :
```sql
UPDATE candidates SET visible = true WHERE status = 'approved';
UPDATE candidates SET visible = false WHERE status != 'approved';
```

3. Restaurer l'ancien code depuis Git.

## Vérification post-migration

- [ ] Tous les candidats avec `status = 'approved'` sont visibles
- [ ] Tous les candidats avec `status = 'pending'` ne sont pas visibles pour les visiteurs
- [ ] L'interface d'administration affiche correctement les statistiques
- [ ] Les recruteurs voient tous les candidats approuvés
- [ ] Les candidats voient leur propre profil même s'il n'est pas approuvé
