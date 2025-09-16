# 🔐 Configuration des Secrets GitHub Actions

Ce guide vous explique comment configurer les secrets nécessaires pour le déploiement automatique de UX Jobs Pro.

## 📋 Secrets Requis

### 🔑 Secrets Supabase (OBLIGATOIRES)

1. **`VITE_SUPABASE_URL`**
   - Valeur: `https://ktfdrwpvofxuktnunukv.supabase.co`
   - Description: URL de votre projet Supabase

2. **`VITE_SUPABASE_ANON_KEY`**
   - Valeur: Votre clé anonyme Supabase
   - Description: Clé publique pour l'authentification côté client

3. **`SUPABASE_SERVICE_KEY`**
   - Valeur: Votre clé de service Supabase
   - Description: Clé privée pour les opérations côté serveur

### 🛡️ Secrets de Sécurité (OBLIGATOIRES)

4. **`JWT_SECRET`**
   - Valeur: Une chaîne aléatoire de 32+ caractères
   - Description: Secret pour signer les tokens JWT
   - Génération: `openssl rand -base64 32`

5. **`ADMIN_TOKEN_SECRET`**
   - Valeur: Une chaîne aléatoire de 32+ caractères
   - Description: Secret pour générer les tokens admin
   - Génération: `openssl rand -base64 32`

### 🚀 Secrets de Déploiement (OBLIGATOIRES)

6. **`DEPLOY_HOST`**
   - Valeur: IP ou domaine de votre serveur
   - Exemple: `192.168.1.100` ou `mon-serveur.com`

7. **`DEPLOY_USER`**
   - Valeur: Nom d'utilisateur SSH
   - Exemple: `ubuntu`, `deploy`, `root`

8. **`DEPLOY_SSH_KEY`**
   - Valeur: Clé privée SSH complète
   - Description: Clé pour se connecter au serveur
   - Format: Contenu complet du fichier `~/.ssh/id_rsa`

9. **`DEPLOY_PATH`**
   - Valeur: Chemin de déploiement sur le serveur
   - Exemple: `/var/www/ux-jobs-pro`

### 🔧 Secrets Optionnels

10. **`PORT`**
    - Valeur: Port du serveur (défaut: `3001`)
    - Exemple: `3001`

11. **`DEPLOY_PORT`**
    - Valeur: Port SSH (défaut: `22`)
    - Exemple: `22`

12. **`DATABASE_URL`**
    - Valeur: URL de connexion à la base de données
    - Exemple: `postgresql://user:pass@host:port/db`

13. **`SENTRY_DSN`**
    - Valeur: DSN Sentry pour le monitoring
    - Exemple: `https://xxx@sentry.io/xxx`

14. **`LOG_LEVEL`**
    - Valeur: Niveau de log (défaut: `info`)
    - Options: `error`, `warn`, `info`, `debug`

### 📢 Secrets de Notification (OPTIONNELS)

15. **`SLACK_WEBHOOK_URL`**
    - Valeur: URL du webhook Slack
    - Description: Pour recevoir des notifications de déploiement

16. **`EMAIL_USERNAME`**
    - Valeur: Nom d'utilisateur email SMTP
    - Exemple: `votre-email@gmail.com`

17. **`EMAIL_PASSWORD`**
    - Valeur: Mot de passe email SMTP
    - Description: Mot de passe de l'application

18. **`EMAIL_TO`**
    - Valeur: Email de destination
    - Exemple: `admin@votre-domaine.com`

19. **`EMAIL_FROM`**
    - Valeur: Email expéditeur
    - Exemple: `noreply@votre-domaine.com`

### 🔍 Secrets d'Audit (OPTIONNELS)

20. **`SONAR_TOKEN`**
    - Valeur: Token SonarQube
    - Description: Pour l'analyse de qualité du code

21. **`SONAR_HOST_URL`**
    - Valeur: URL de votre instance SonarQube
    - Exemple: `https://sonarcloud.io`

22. **`SNYK_TOKEN`**
    - Valeur: Token Snyk
    - Description: Pour l'audit de sécurité des dépendances

## 🚀 Comment Configurer les Secrets

### 1. Accéder aux Settings GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (onglet en haut)
3. Dans le menu de gauche, cliquez sur **Secrets and variables**
4. Cliquez sur **Actions**

### 2. Ajouter les Secrets

1. Cliquez sur **New repository secret**
2. Entrez le **Name** (ex: `VITE_SUPABASE_URL`)
3. Entrez la **Secret** (votre valeur)
4. Cliquez sur **Add secret**

### 3. Répéter pour tous les secrets

Ajoutez tous les secrets listés ci-dessus, en commençant par les **OBLIGATOIRES**.

## 🔐 Génération des Secrets de Sécurité

### Générer JWT_SECRET et ADMIN_TOKEN_SECRET

```bash
# Générer un secret JWT
openssl rand -base64 32

# Générer un secret admin
openssl rand -base64 32
```

### Générer une Clé SSH

```bash
# Générer une nouvelle clé SSH
ssh-keygen -t rsa -b 4096 -C "deploy@ux-jobs-pro"

# Copier la clé publique sur le serveur
ssh-copy-id user@your-server.com

# Afficher la clé privée (à copier dans DEPLOY_SSH_KEY)
cat ~/.ssh/id_rsa
```

## ✅ Vérification de la Configuration

### Test des Secrets

1. Allez dans l'onglet **Actions** de votre repository
2. Cliquez sur **Deploy UX Jobs Pro**
3. Cliquez sur **Run workflow**
4. Vérifiez que tous les secrets sont correctement configurés

### Logs de Déploiement

Les logs de déploiement vous indiqueront si des secrets sont manquants ou incorrects.

## 🛡️ Bonnes Pratiques de Sécurité

### 1. Rotation des Secrets

- Changez régulièrement vos secrets de sécurité
- Utilisez des secrets différents pour chaque environnement

### 2. Accès aux Secrets

- Limitez l'accès aux secrets aux personnes autorisées
- Ne partagez jamais les secrets par email ou chat

### 3. Monitoring

- Surveillez l'utilisation des secrets
- Activez les notifications de sécurité GitHub

### 4. Sauvegarde

- Sauvegardez vos secrets de manière sécurisée
- Documentez la configuration pour la récupération

## 🆘 Dépannage

### Erreurs Communes

1. **"Secret not found"**
   - Vérifiez que le secret est bien configuré
   - Vérifiez l'orthographe du nom du secret

2. **"SSH connection failed"**
   - Vérifiez la clé SSH
   - Vérifiez les informations de connexion

3. **"Build failed"**
   - Vérifiez les secrets Supabase
   - Vérifiez la configuration du serveur

### Support

En cas de problème, vérifiez :
1. Les logs GitHub Actions
2. La configuration des secrets
3. La connectivité réseau
4. Les permissions du serveur

---

## 📞 Contact

Pour toute question sur la configuration des secrets, consultez la documentation GitHub Actions ou contactez l'équipe de développement.
