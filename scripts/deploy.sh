#!/bin/bash

# 🚀 Script de déploiement UX Jobs Pro
# Usage: ./scripts/deploy.sh [environment]

set -e  # Arrêter en cas d'erreur

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="ux-jobs-pro"
DEPLOY_PATH="/var/www/ux-jobs-pro"
BACKUP_PATH="/var/backups/ux-jobs-pro"
LOG_FILE="/var/log/ux-jobs-pro/deploy.log"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Vérifier les prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
    fi
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 n'est pas installé, installation..."
        npm install -g pm2
    fi
    
    # Vérifier le fichier .env
    if [ ! -f ".env" ]; then
        error "Fichier .env manquant"
    fi
    
    success "✅ Prérequis vérifiés"
}

# Créer les répertoires nécessaires
setup_directories() {
    log "📁 Création des répertoires..."
    
    sudo mkdir -p "$DEPLOY_PATH"
    sudo mkdir -p "$BACKUP_PATH"
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    
    # Donner les permissions appropriées
    sudo chown -R $USER:$USER "$DEPLOY_PATH"
    sudo chown -R $USER:$USER "$BACKUP_PATH"
    sudo chown -R $USER:$USER "$(dirname "$LOG_FILE")"
    
    success "✅ Répertoires créés"
}

# Sauvegarder la version actuelle
backup_current_version() {
    log "💾 Sauvegarde de la version actuelle..."
    
    if [ -d "$DEPLOY_PATH/current" ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        cp -r "$DEPLOY_PATH/current" "$BACKUP_PATH/$BACKUP_NAME"
        log "📦 Sauvegarde créée: $BACKUP_NAME"
    else
        warning "Aucune version précédente à sauvegarder"
    fi
    
    success "✅ Sauvegarde terminée"
}

# Arrêter l'application
stop_application() {
    log "⏹️ Arrêt de l'application..."
    
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 stop "$APP_NAME"
        pm2 delete "$APP_NAME"
        log "🛑 Application arrêtée"
    else
        warning "Application non trouvée dans PM2"
    fi
    
    success "✅ Application arrêtée"
}

# Installer les dépendances
install_dependencies() {
    log "📦 Installation des dépendances..."
    
    cd "$DEPLOY_PATH/current"
    
    # Installer les dépendances de production
    npm ci --production --silent
    
    success "✅ Dépendances installées"
}

# Construire l'application
build_application() {
    log "🏗️ Construction de l'application..."
    
    cd "$DEPLOY_PATH/current"
    
    # Build de l'application frontend
    npm run build
    
    success "✅ Application construite"
}

# Démarrer l'application
start_application() {
    log "🚀 Démarrage de l'application..."
    
    cd "$DEPLOY_PATH/current"
    
    # Démarrer avec PM2
    pm2 start server.js --name "$APP_NAME" --env "$ENVIRONMENT"
    
    # Sauvegarder la configuration PM2
    pm2 save
    
    # Attendre que l'application soit prête
    sleep 5
    
    # Vérifier que l'application est bien démarrée
    if pm2 list | grep -q "$APP_NAME.*online"; then
        success "✅ Application démarrée avec succès"
    else
        error "❌ Échec du démarrage de l'application"
    fi
}

# Vérifier la santé de l'application
health_check() {
    log "🏥 Vérification de la santé de l'application..."
    
    # Attendre que l'application soit complètement prête
    sleep 10
    
    # Vérifier que l'application répond
    PORT=$(grep PORT .env | cut -d '=' -f2)
    if curl -f "http://localhost:$PORT/api/stats" > /dev/null 2>&1; then
        success "✅ Application répond correctement"
    else
        error "❌ Application ne répond pas"
    fi
}

# Nettoyer les anciennes sauvegardes
cleanup_old_backups() {
    log "🧹 Nettoyage des anciennes sauvegardes..."
    
    # Garder seulement les 5 dernières sauvegardes
    cd "$BACKUP_PATH"
    ls -t | tail -n +6 | xargs -r rm -rf
    
    success "✅ Nettoyage terminé"
}

# Afficher les logs de l'application
show_logs() {
    log "📋 Affichage des logs de l'application..."
    pm2 logs "$APP_NAME" --lines 20
}

# Fonction principale
main() {
    log "🚀 Début du déploiement UX Jobs Pro (Environment: $ENVIRONMENT)"
    
    check_prerequisites
    setup_directories
    backup_current_version
    stop_application
    install_dependencies
    build_application
    start_application
    health_check
    cleanup_old_backups
    
    success "🎉 Déploiement terminé avec succès!"
    
    # Afficher les informations utiles
    log "📊 Informations de l'application:"
    pm2 show "$APP_NAME"
    
    log "📋 Logs récents:"
    show_logs
    
    log "🔗 Application disponible sur le port $(grep PORT .env | cut -d '=' -f2)"
}

# Gestion des erreurs
trap 'error "Déploiement interrompu par une erreur"' ERR

# Exécution du script
main "$@"
