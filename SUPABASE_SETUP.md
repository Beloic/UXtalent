# Configuration Supabase Storage

## Problème
L'upload de photos de profil génère l'erreur "Bucket not found" car le bucket `candidate-photos` n'existe pas dans Supabase.

## Solution
Vous devez créer manuellement le bucket dans l'interface Supabase :

### 1. Accéder à Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet `uulftwzhxhznmacrpwbk`

### 2. Créer le bucket Storage
1. Dans le menu de gauche, cliquez sur **Storage**
2. Cliquez sur **New bucket**
3. Configurez le bucket :
   - **Name**: `candidate-photos`
   - **Public bucket**: ✅ Activé
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### 3. Configurer les politiques de sécurité
1. Dans **Storage** > **Policies**
2. Créez une politique pour le bucket `candidate-photos` :

**Politique d'upload (INSERT)**:
```sql
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'candidate-photos');
```

**Politique de lecture publique (SELECT)**:
```sql
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'candidate-photos');
```

### 4. Réactiver l'upload dans le code
Une fois le bucket créé, décommentez le code dans `src/pages/MyProfilePage.jsx` lignes 127-145.

## Alternative temporaire
En attendant la configuration Supabase, l'upload de photos est désactivé et les profils peuvent être créés sans photo.
