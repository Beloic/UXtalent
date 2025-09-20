# 📧 Guide de Configuration des Emails Supabase

## 🎯 Configuration des Emails de Validation

Pour que les emails de validation fonctionnent correctement, vous devez configurer Supabase pour l'envoi d'emails.

### 1. Accéder à la Configuration Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet `ux-jobs-pro`
4. Allez dans **Settings** (Paramètres) → **Authentication** (Authentification)

### 2. Configurer les URLs de Redirection

Dans la section **Site URL**, ajoutez :
```
https://uxtalent.vercel.app
https://u-xtalent.vercel.app
https://ux-jobs-pro.netlify.app
http://localhost:5173
```

Dans la section **Redirect URLs**, ajoutez :
```
https://uxtalent.vercel.app/confirm-email
https://u-xtalent.vercel.app/confirm-email
https://ux-jobs-pro.netlify.app/confirm-email
http://localhost:5173/confirm-email
```

### 3. Configurer l'Envoi d'Emails

#### Option A : Utiliser Supabase (Recommandé pour le développement)

1. Dans **Authentication** → **Email Templates**
2. Personnalisez le template d'inscription si nécessaire
3. Les emails seront envoyés depuis `noreply@mail.supabase.io`

#### Option B : Configurer un Provider SMTP (Pour la production)

1. Dans **Settings** → **Auth** → **SMTP Settings**
2. Configurez votre provider SMTP :

**Exemple pour Gmail :**
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- SMTP User: `votre-email@gmail.com`
- SMTP Pass: `votre-mot-de-passe-app`
- SMTP Admin Email: `votre-email@gmail.com`
- SMTP Sender Name: `UX Jobs Pro`

**Exemple pour SendGrid :**
- SMTP Host: `smtp.sendgrid.net`
- SMTP Port: `587`
- SMTP User: `apikey`
- SMTP Pass: `votre-clé-api-sendgrid`
- SMTP Admin Email: `noreply@votre-domaine.com`
- SMTP Sender Name: `UX Jobs Pro`

### 4. Activer la Confirmation d'Email

1. Dans **Authentication** → **Settings**
2. Activez **Enable email confirmations**
3. Définissez **Email confirmation URL** : `https://uxtalent.vercel.app/confirm-email`

### 5. Tester la Configuration

1. Créez un compte de test
2. Vérifiez que l'email de confirmation est reçu
3. Cliquez sur le lien de confirmation
4. Vérifiez que l'utilisateur est redirigé vers `/confirm-email`

### 6. Personnaliser les Templates d'Email

Dans **Authentication** → **Email Templates**, vous pouvez personnaliser :

- **Confirm signup** : Template d'inscription
- **Reset password** : Template de réinitialisation
- **Magic Link** : Template de connexion par lien

### 7. Variables d'Environnement

Assurez-vous que ces variables sont configurées :

```env
VITE_SUPABASE_URL=https://ktfdrwpvofxuktnunukv.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
SUPABASE_SERVICE_KEY=votre-clé-service
```

### 8. Dépannage

#### Problème : Les emails ne sont pas envoyés
- Vérifiez la configuration SMTP
- Vérifiez les quotas Supabase
- Vérifiez les logs dans Supabase Dashboard

#### Problème : Les liens de confirmation ne fonctionnent pas
- Vérifiez les URLs de redirection
- Vérifiez que la page `/confirm-email` existe
- Vérifiez les paramètres URL

#### Problème : Erreur "Invalid redirect URL"
- Ajoutez votre domaine dans les URLs autorisées
- Vérifiez que l'URL correspond exactement

### 9. Sécurité

- ⚠️ Ne jamais exposer la `SUPABASE_SERVICE_KEY` côté client
- ✅ Utilisez HTTPS en production
- ✅ Validez les URLs de redirection
- ✅ Limitez le taux d'envoi d'emails

## 🚀 Déploiement

Une fois configuré, le système d'emails fonctionnera automatiquement :

1. **Inscription** → Email de confirmation envoyé
2. **Clic sur le lien** → Redirection vers `/confirm-email`
3. **Confirmation automatique** → Redirection vers `/my-profile`
4. **Profil créé** → Statut "en attente" de validation admin

Le système est maintenant entièrement fonctionnel ! 🎉
