#!/bin/bash

# 🔐 Script de génération des secrets pour UX Jobs Pro
# Usage: ./scripts/generate-secrets.sh

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Vérifier les prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL n'est pas installé"
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    success "✅ Prérequis vérifiés"
}

# Générer les secrets
generate_secrets() {
    log "🔐 Génération des secrets de sécurité..."
    
    # Créer le fichier de secrets
    SECRETS_FILE="secrets-generated.txt"
    
    echo "# 🔐 Secrets générés pour UX Jobs Pro" > "$SECRETS_FILE"
    echo "# Généré le: $(date)" >> "$SECRETS_FILE"
    echo "# ⚠️  IMPORTANT: Ces secrets sont sensibles, ne les partagez jamais!" >> "$SECRETS_FILE"
    echo "" >> "$SECRETS_FILE"
    
    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 32)
    echo "JWT_SECRET=$JWT_SECRET" >> "$SECRETS_FILE"
    log "✅ JWT_SECRET généré"
    
    # Admin Token Secret
    ADMIN_TOKEN_SECRET=$(openssl rand -base64 32)
    echo "ADMIN_TOKEN_SECRET=$ADMIN_TOKEN_SECRET" >> "$SECRETS_FILE"
    log "✅ ADMIN_TOKEN_SECRET généré"
    
    # Session Secret
    SESSION_SECRET=$(openssl rand -base64 32)
    echo "SESSION_SECRET=$SESSION_SECRET" >> "$SECRETS_FILE"
    log "✅ SESSION_SECRET généré"
    
    # API Key pour les webhooks
    API_KEY=$(openssl rand -hex 32)
    echo "API_KEY=$API_KEY" >> "$SECRETS_FILE"
    log "✅ API_KEY généré"
    
    # Encryption Key pour les données sensibles
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> "$SECRETS_FILE"
    log "✅ ENCRYPTION_KEY généré"
    
    success "✅ Tous les secrets générés"
}

# Générer les clés SSH
generate_ssh_keys() {
    log "🔑 Génération des clés SSH..."
    
    SSH_DIR="ssh-keys"
    mkdir -p "$SSH_DIR"
    
    # Générer une paire de clés SSH
    ssh-keygen -t rsa -b 4096 -f "$SSH_DIR/deploy_key" -N "" -C "deploy@ux-jobs-pro"
    
    echo "" >> "$SECRETS_FILE"
    echo "# 🔑 Clés SSH générées" >> "$SECRETS_FILE"
    echo "DEPLOY_SSH_PRIVATE_KEY=$(cat $SSH_DIR/deploy_key)" >> "$SECRETS_FILE"
    echo "DEPLOY_SSH_PUBLIC_KEY=$(cat $SSH_DIR/deploy_key.pub)" >> "$SECRETS_FILE"
    
    log "✅ Clés SSH générées dans le dossier $SSH_DIR/"
    success "✅ Clés SSH générées"
}

# Créer le fichier .env de production
create_production_env() {
    log "📝 Création du fichier .env de production..."
    
    ENV_FILE=".env.production.generated"
    
    echo "# Configuration Supabase" > "$ENV_FILE"
    echo "VITE_SUPABASE_URL=https://ktfdrwpvofxuktnunukv.supabase.co" >> "$ENV_FILE"
    echo "VITE_SUPABASE_ANON_KEY=your-anon-key-here" >> "$ENV_FILE"
    echo "SUPABASE_SERVICE_KEY=your-service-key-here" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# Configuration du serveur" >> "$ENV_FILE"
    echo "PORT=3001" >> "$ENV_FILE"
    echo "NODE_ENV=production" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# Configuration de sécurité" >> "$ENV_FILE"
    echo "JWT_SECRET=$JWT_SECRET" >> "$ENV_FILE"
    echo "ADMIN_TOKEN_SECRET=$ADMIN_TOKEN_SECRET" >> "$ENV_FILE"
    echo "SESSION_SECRET=$SESSION_SECRET" >> "$ENV_FILE"
    echo "API_KEY=$API_KEY" >> "$ENV_FILE"
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# Configuration de déploiement" >> "$ENV_FILE"
    echo "DEPLOY_HOST=your-server-host" >> "$ENV_FILE"
    echo "DEPLOY_USER=your-deploy-user" >> "$ENV_FILE"
    echo "DEPLOY_PATH=/var/www/ux-jobs-pro" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# Configuration de base de données" >> "$ENV_FILE"
    echo "DATABASE_URL=your-database-url-here" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "# Configuration de monitoring" >> "$ENV_FILE"
    echo "SENTRY_DSN=your-sentry-dsn-here" >> "$ENV_FILE"
    echo "LOG_LEVEL=info" >> "$ENV_FILE"
    
    success "✅ Fichier .env de production créé: $ENV_FILE"
}

# Créer les instructions de configuration
create_setup_instructions() {
    log "📋 Création des instructions de configuration..."
    
    INSTRUCTIONS_FILE="SETUP_INSTRUCTIONS.md"
    
    cat > "$INSTRUCTIONS_FILE" << 'EOF'
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
EOF

    success "✅ Instructions créées: $INSTRUCTIONS_FILE"
}

# Fonction principale
main() {
    log "🚀 Début de la génération des secrets UX Jobs Pro"
    
    check_prerequisites
    generate_secrets
    generate_ssh_keys
    create_production_env
    create_setup_instructions
    
    success "🎉 Génération terminée avec succès!"
    
    echo ""
    echo "📁 Fichiers créés :"
    echo "  - $SECRETS_FILE (secrets générés)"
    echo "  - $ENV_FILE (configuration production)"
    echo "  - $INSTRUCTIONS_FILE (instructions de setup)"
    echo "  - ssh-keys/ (clés SSH)"
    echo ""
    echo "🔐 Prochaines étapes :"
    echo "  1. Configurer les secrets dans GitHub Actions"
    echo "  2. Installer les clés SSH sur le serveur"
    echo "  3. Tester le déploiement"
    echo ""
    echo "⚠️  IMPORTANT: Ne commitez JAMAIS ces fichiers de secrets!"
}

# Exécution du script
main "$@"
