# 🚀 Guide de Déploiement UX Jobs Pro

Ce guide vous explique comment déployer UX Jobs Pro en utilisant GitHub Actions et les secrets sécurisés.

## 📋 Prérequis

### Serveur de Déploiement

1. **Serveur Ubuntu/Debian** avec accès SSH
2. **Node.js 18+** installé
3. **PM2** pour la gestion des processus
4. **Nginx** (optionnel, pour le reverse proxy)

### Configuration Serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de PM2
sudo npm install -g pm2

# Installation de Nginx (optionnel)
sudo apt install nginx -y
```

## 🔐 Configuration des Secrets GitHub

### 1. Accéder aux Settings

1. Allez sur votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**

### 2. Secrets Obligatoires

| Secret | Description | Exemple |
|--------|-------------|---------|
| `VITE_SUPABASE_URL` | URL Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_KEY` | Clé de service Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `JWT_SECRET` | Secret JWT | `openssl rand -base64 32` |
| `ADMIN_TOKEN_SECRET` | Secret token admin | `openssl rand -base64 32` |
| `DEPLOY_HOST` | IP/Domaine serveur | `192.168.1.100` |
| `DEPLOY_USER` | Utilisateur SSH | `ubuntu` |
| `DEPLOY_SSH_KEY` | Clé privée SSH | Contenu de `~/.ssh/id_rsa` |
| `DEPLOY_PATH` | Chemin de déploiement | `/var/www/ux-jobs-pro` |

### 3. Génération des Secrets

```bash
# Générer JWT_SECRET
openssl rand -base64 32

# Générer ADMIN_TOKEN_SECRET
openssl rand -base64 32

# Générer une clé SSH
ssh-keygen -t rsa -b 4096 -C "deploy@ux-jobs-pro"
```

## 🚀 Déploiement Automatique

### 1. Déclenchement du Déploiement

Le déploiement se déclenche automatiquement :
- **Push sur `main`** : Déploiement en production
- **Pull Request** : Tests uniquement

### 2. Workflow GitHub Actions

Le workflow `deploy.yml` effectue :

1. **Tests et Validation**
   - Installation des dépendances
   - Audit de sécurité NPM
   - Build de l'application
   - Tests (si disponibles)

2. **Déploiement Production**
   - Création de l'archive
   - Upload sur le serveur
   - Installation des dépendances
   - Démarrage avec PM2
   - Vérification de santé

3. **Notifications**
   - Slack (optionnel)
   - Email (optionnel)

### 3. Monitoring du Déploiement

1. Allez dans **Actions** de votre repository
2. Cliquez sur **Deploy UX Jobs Pro**
3. Surveillez les logs en temps réel

## 🛠️ Déploiement Manuel

### 1. Préparation du Serveur

```bash
# Se connecter au serveur
ssh user@your-server.com

# Créer les répertoires
sudo mkdir -p /var/www/ux-jobs-pro
sudo chown -R $USER:$USER /var/www/ux-jobs-pro

# Installer PM2
npm install -g pm2
```

### 2. Configuration SSH

```bash
# Sur votre machine locale
ssh-copy-id user@your-server.com

# Tester la connexion
ssh user@your-server.com
```

### 3. Déploiement avec le Script

```bash
# Cloner le repository
git clone https://github.com/your-username/ux-jobs-pro.git
cd ux-jobs-pro

# Copier le fichier d'environnement
cp env.production .env

# Éditer les variables
nano .env

# Exécuter le script de déploiement
./scripts/deploy.sh production
```

## 🔧 Configuration Nginx (Optionnel)

### 1. Configuration Reverse Proxy

```nginx
# /etc/nginx/sites-available/ux-jobs-pro
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Activation du Site

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/ux-jobs-pro /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 📊 Monitoring et Maintenance

### 1. Gestion PM2

```bash
# Voir les processus
pm2 list

# Voir les logs
pm2 logs ux-jobs-pro

# Redémarrer l'application
pm2 restart ux-jobs-pro

# Arrêter l'application
pm2 stop ux-jobs-pro

# Supprimer l'application
pm2 delete ux-jobs-pro
```

### 2. Surveillance des Logs

```bash
# Logs en temps réel
pm2 logs ux-jobs-pro --lines 100

# Logs de déploiement
tail -f /var/log/ux-jobs-pro/deploy.log
```

### 3. Sauvegardes

```bash
# Sauvegardes automatiques
ls /var/backups/ux-jobs-pro/

# Restaurer une sauvegarde
cp -r /var/backups/ux-jobs-pro/backup-20240101-120000 /var/www/ux-jobs-pro/current
```

## 🔒 Sécurité

### 1. Firewall

```bash
# Configurer UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. SSL/TLS

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL
sudo certbot --nginx -d your-domain.com
```

### 3. Mise à Jour

```bash
# Mise à jour automatique
sudo apt update && sudo apt upgrade -y

# Mise à jour des dépendances
npm audit fix
```

## 🆘 Dépannage

### Problèmes Courants

1. **Erreur SSH**
   ```bash
   # Vérifier la clé SSH
   ssh-keygen -t rsa -b 4096 -C "deploy@ux-jobs-pro"
   ssh-copy-id user@server.com
   ```

2. **Erreur de Build**
   ```bash
   # Vérifier les variables d'environnement
   cat .env
   npm run build
   ```

3. **Application ne démarre pas**
   ```bash
   # Vérifier les logs PM2
   pm2 logs ux-jobs-pro
   
   # Vérifier le port
   netstat -tlnp | grep 3001
   ```

### Logs Utiles

```bash
# Logs GitHub Actions
# Repository → Actions → Workflow run

# Logs serveur
pm2 logs ux-jobs-pro
tail -f /var/log/ux-jobs-pro/deploy.log

# Logs système
sudo journalctl -u nginx
sudo journalctl -f
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs GitHub Actions
2. Consultez les logs du serveur
3. Vérifiez la configuration des secrets
4. Testez la connectivité SSH

---

## 🎉 Félicitations !

Votre application UX Jobs Pro est maintenant déployée de manière sécurisée avec GitHub Actions !

### Prochaines Étapes

1. **Monitoring** : Configurez des alertes
2. **Backup** : Automatisez les sauvegardes
3. **SSL** : Configurez HTTPS
4. **CDN** : Ajoutez un CDN pour les performances
5. **Monitoring** : Intégrez Sentry ou similaire
