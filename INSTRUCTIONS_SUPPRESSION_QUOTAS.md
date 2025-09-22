# 🗑️ Instructions pour supprimer les limitations de quotas

## 📋 Étapes à suivre

### 1. Exécuter le script SQL dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet UX Jobs Pro
3. Allez dans **SQL Editor**
4. Copiez et collez le contenu du fichier `remove-quotas-manual.sql`
5. Cliquez sur **Run** pour exécuter le script

### 2. Vérifier la suppression

Le script va :
- ✅ Supprimer la colonne `max_job_posts`
- ✅ Supprimer la colonne `max_candidate_contacts`
- ✅ Supprimer la colonne `max_featured_jobs`
- ✅ Supprimer la colonne `total_jobs_posted`
- ✅ Supprimer la colonne `total_candidate_contacts`
- ✅ Supprimer la colonne `total_applications_received`

### 3. Modifications du code effectuées

#### Hook `useRecruiter.js`
- ✅ Supprimé `getRemainingJobPosts()`
- ✅ Supprimé `getRemainingCandidateContacts()`
- ✅ Supprimé `incrementJobPosts()`
- ✅ Supprimé `incrementCandidateContacts()`
- ✅ Simplifié `getPlanInfo()` pour ne retourner que le nom du plan

#### Page `MyProfilePage.jsx`
- ✅ Supprimé l'affichage des quotas dans l'onglet "Mon plan"
- ✅ Remplacé par un message "Accès illimité"
- ✅ Supprimé les imports des fonctions de quotas

#### Service `recruitersApi.js`
- ✅ Supprimé `incrementJobPosts()`
- ✅ Supprimé `incrementCandidateContacts()`
- ✅ Supprimé les exports correspondants

### 4. Résultat attendu

Après ces modifications :
- 🎯 Les recruteurs n'ont plus de limitations sur le nombre d'offres
- 🎯 Les recruteurs peuvent contacter tous les candidats sans restriction
- 🎯 L'onglet "Mon plan" affiche "Accès illimité" au lieu des quotas
- 🎯 Plus de compteurs ou de limitations dans l'interface

### 5. Test

1. Exécutez le script SQL dans Supabase
2. Redémarrez l'application (`npm run dev`)
3. Connectez-vous en tant que recruteur
4. Allez dans votre profil → onglet "Mon plan"
5. Vérifiez que vous voyez "Accès illimité" au lieu des quotas

## ⚠️ Important

Cette suppression est **irréversible**. Assurez-vous que c'est bien ce que vous voulez avant d'exécuter le script SQL.

## 📁 Fichiers modifiés

- `remove-quotas-manual.sql` - Script SQL à exécuter
- `src/hooks/useRecruiter.js` - Hook simplifié
- `src/pages/MyProfilePage.jsx` - Interface sans quotas
- `src/services/recruitersApi.js` - Service simplifié
