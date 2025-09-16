# 🚀 Instructions de Configuration des Secrets

## 📋 Secrets à Configurer dans GitHub

### 1. Aller sur GitHub
1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (onglet en haut)
3. Dans le menu de gauche, cliquez sur **Secrets and variables**
4. Cliquez sur **Actions**

### 2. Ajouter les Secrets

Copiez chaque secret depuis le fichier `secrets-generated.txt` :

#### Secrets Supabase (OBLIGATOIRES)
- `VITE_SUPABASE_URL` = `https://ktfdrwpvofxuktnunukv.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = Votre clé anonyme Supabase
- `SUPABASE_SERVICE_KEY` = Votre clé de service Supabase

#### Secrets de Sécurité (OBLIGATOIRES)
- `JWT_SECRET` = (généré automatiquement)
- `ADMIN_TOKEN_SECRET` = (généré automatiquement)
- `SESSION_SECRET` = (généré automatiquement)
- `API_KEY` = (généré automatiquement)
- `ENCRYPTION_KEY` = (généré automatiquement)

#### Secrets de Déploiement (OBLIGATOIRES)
- `DEPLOY_HOST` = IP ou domaine de votre serveur
- `DEPLOY_USER` = Utilisateur SSH (ex: ubuntu, deploy)
- `DEPLOY_SSH_KEY` = Clé privée SSH (générée automatiquement)
- `DEPLOY_PATH` = Chemin de déploiement (ex: /var/www/ux-jobs-pro)

#### Secrets Optionnels
- `PORT` = Port du serveur (défaut: 3001)
- `DEPLOY_PORT` = Port SSH (défaut: 22)
- `DATABASE_URL` = URL de base de données
- `SENTRY_DSN` = DSN Sentry pour monitoring
- `LOG_LEVEL` = Niveau de log (défaut: info)

### 3. Configuration du Serveur

#### Installer les clés SSH
```bash
# Copier la clé publique sur le serveur
ssh-copy-id -i ssh-keys/deploy_key.pub user@your-server.com

# Ou manuellement
cat ssh-keys/deploy_key.pub >> ~/.ssh/authorized_keys
```

#### Tester la connexion
```bash
ssh -i ssh-keys/deploy_key user@your-server.com
```

### 4. Déploiement

Une fois tous les secrets configurés :
1. Le workflow GitHub Actions se déclenchera automatiquement
2. Surveillez les logs dans **Actions** de GitHub
3. Vérifiez que l'application est accessible

## 🛡️ Sécurité

- ⚠️ **NE JAMAIS** commiter les fichiers de secrets
- ⚠️ **NE JAMAIS** partager les secrets par email/chat
- ✅ Sauvegardez les secrets de manière sécurisée
- ✅ Changez régulièrement les secrets

## 🆘 Support

En cas de problème :
1. Vérifiez les logs GitHub Actions
2. Vérifiez la configuration des secrets
3. Testez la connexion SSH
4. Consultez le guide DEPLOYMENT_GUIDE.md
