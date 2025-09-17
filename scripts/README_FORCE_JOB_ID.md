# 🔧 Scripts pour forcer le job_id à 26 pour Loic Bernard

## 📋 Description

Ces scripts permettent de forcer toutes les candidatures de Loic Bernard à pointer vers l'offre d'emploi avec l'ID 26.

## 📁 Fichiers disponibles

### 1. `force_job_id_26_loic.sql` (Script complet)
- Script SQL complet avec toutes les vérifications
- Inclut la création automatique de candidature si nécessaire
- Contient des requêtes de vérification avant et après

### 2. `simple_update_loic.sql` (Script simple)
- Version simplifiée pour exécution rapide
- Parfait pour l'interface Supabase SQL Editor
- Moins de vérifications, plus direct

### 3. `run_force_job_id.sh` (Script d'exécution)
- Script bash pour automatiser l'exécution
- Inclut des vérifications et confirmations
- Guide d'utilisation avec différentes méthodes

## 🚀 Comment utiliser

### Méthode 1: Interface Supabase (Recommandée)

1. **Connectez-vous à Supabase**
   - Allez sur https://supabase.com/dashboard
   - Ouvrez votre projet UX Jobs Pro

2. **Ouvrez le SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Exécutez le script**
   - Copiez le contenu de `simple_update_loic.sql`
   - Collez-le dans l'éditeur
   - Cliquez sur "Run" ou appuyez sur Ctrl+Enter

### Méthode 2: Supabase CLI

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase link --project-ref YOUR-PROJECT-REF

# Exécuter le script
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f force_job_id_26_loic.sql
```

### Méthode 3: psql direct

```bash
# Exécuter directement avec psql
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f force_job_id_26_loic.sql
```

## 📊 Ce que fait le script

1. **Vérification** : Affiche les candidatures actuelles de Loic Bernard
2. **Mise à jour** : Change tous les `job_id` vers 26
3. **Compteur** : Met à jour le compteur de candidatures de l'offre 26
4. **Création** : Crée une candidature si elle n'existe pas
5. **Résumé** : Affiche un résumé des modifications

## ⚠️ Précautions

- **Sauvegarde** : Faites une sauvegarde de votre base de données avant d'exécuter
- **Test** : Testez d'abord sur un environnement de développement
- **Vérification** : Vérifiez les résultats après exécution

## 🔍 Vérification après exécution

Pour vérifier que la modification a bien fonctionné :

```sql
-- Vérifier les candidatures de Loic Bernard
SELECT 
    a.id,
    a.job_id,
    c.name,
    j.title as job_title
FROM applications a
JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN jobs j ON a.job_id = j.id
WHERE c.name ILIKE '%Loic Bernard%';
```

## 🆘 En cas de problème

Si quelque chose ne va pas :

1. **Restaurer** : Utilisez votre sauvegarde pour restaurer l'état précédent
2. **Vérifier** : Vérifiez que l'offre ID 26 existe bien
3. **Contacter** : Contactez l'administrateur système si nécessaire

## 📝 Notes

- Le script utilise `ILIKE` pour une recherche insensible à la casse
- Il gère les variations de nom (avec/sans accents, majuscules/minuscules)
- Il met automatiquement à jour les compteurs de candidatures
