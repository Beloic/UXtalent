# Nouvelle Table Applications

Ce dossier contient les scripts pour créer et gérer la nouvelle table `applications` qui remplace l'ancienne structure.

## Structure de la nouvelle table

La table `applications` contient :

- **`id`** : ID de la candidature (auto-incrémenté)
- **`candidate_id`** : ID du candidat (INTEGER, référence vers `candidates.id`)
- **`recruiter_id`** : ID du recruteur (UUID)
- **`job_id`** : ID de l'offre d'emploi (INTEGER, référence vers `jobs.id`)
- **`first_name`** : Prénom du candidat
- **`last_name`** : Nom du candidat
- **`candidate_email`** : Email du candidat
- **`status`** : Statut de la candidature (`pending`, `reviewed`, `accepted`, `rejected`)
- **`notes`** : Notes du recruteur (optionnel)
- **`applied_at`** : Date et heure de candidature
- **`reviewed_at`** : Date et heure de révision par le recruteur
- **`created_at`** : Date de création de l'enregistrement
- **`updated_at`** : Date de dernière modification

## Scripts disponibles

### 1. `create_applications_table.sql`
**Objectif** : Créer la nouvelle table `applications` avec toutes les contraintes et index.

**À exécuter** : Dans Supabase SQL Editor
```sql
-- Copiez et exécutez le contenu du fichier
```

### 2. `insert_test_applications.sql`
**Objectif** : Insérer des données de test pour vérifier le fonctionnement.

**À exécuter** : Après avoir créé la table
```sql
-- Modifiez les job_id et recruiter_id selon vos données existantes
-- Puis exécutez le script
```

### 3. `update_server_for_new_applications.sql`
**Objectif** : Vérifier la structure et les données de la nouvelle table.

**À exécuter** : Pour diagnostiquer la table
```sql
-- Exécutez pour voir la structure et les statistiques
```

### 4. `test_new_applications_flow.sql`
**Objectif** : Tests complets du flux de candidatures.

**À exécuter** : Pour valider le fonctionnement
```sql
-- Exécutez pour vérifier que tout fonctionne correctement
```

## Avantages de la nouvelle structure

1. **Cohérence des IDs** : `candidate_id` est maintenant un INTEGER comme dans la table `candidates`
2. **Données dénormalisées** : Prénom, nom et email stockés directement pour éviter les jointures
3. **Contraintes robustes** : Un candidat ne peut postuler qu'une fois par offre
4. **Index optimisés** : Performances améliorées pour les requêtes fréquentes
5. **Timestamps automatiques** : `updated_at` mis à jour automatiquement

## Migration depuis l'ancienne table

Si vous aviez une ancienne table `applications`, vous pouvez :

1. **Sauvegarder les données importantes** :
```sql
-- Exportez les données importantes avant de supprimer l'ancienne table
```

2. **Supprimer l'ancienne table** :
```sql
DROP TABLE IF EXISTS applications_old;
```

3. **Créer la nouvelle table** avec `create_applications_table.sql`

4. **Réimporter les données** en adaptant le format

## Utilisation dans le code

Le serveur a été mis à jour pour utiliser la nouvelle structure :

- **Création de candidature** : Utilise les nouveaux champs `first_name`, `last_name`, `candidate_email`
- **Récupération des candidatures** : Utilise `candidate_id` comme INTEGER
- **Mise à jour du statut** : Met à jour `reviewed_at` automatiquement

## Tests recommandés

1. **Créer une candidature** via l'interface candidat
2. **Voir les candidatures** dans le dashboard recruteur
3. **Modifier le statut** d'une candidature
4. **Vérifier les contraintes** (pas de doublons candidat/offre)

## Support

Si vous rencontrez des problèmes :

1. Vérifiez que la table existe : `SELECT * FROM applications LIMIT 1;`
2. Vérifiez les contraintes : `SELECT * FROM information_schema.table_constraints WHERE table_name = 'applications';`
3. Vérifiez les index : `SELECT * FROM pg_indexes WHERE tablename = 'applications';`
