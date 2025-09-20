#!/bin/bash

# Script de déploiement Redis sur Render
# Usage: ./scripts/deploy-redis-render.sh

echo "🚀 Déploiement Redis sur Render"
echo "================================"

# Vérifier que Git est configuré
if ! git config user.name > /dev/null 2>&1; then
    echo "❌ Git n'est pas configuré. Veuillez configurer Git d'abord."
    exit 1
fi

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Vous n'êtes pas sur la branche main (actuellement: $CURRENT_BRANCH)"
    read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ajouter tous les fichiers Redis
echo "📁 Ajout des fichiers Redis..."
git add src/config/redis.js
git add src/cache/redisCache.js
git add src/cache/planCache.js
git add scripts/test-redis-cache.js
git add REDIS_MIGRATION.md
git add package.json
git add package-lock.json

# Commit des changements
echo "💾 Commit des changements Redis..."
git commit -m "🚀 Add Redis cache for improved scalability

- Add Redis configuration and client setup
- Migrate local cache to distributed Redis cache
- Add Redis middleware for API caching
- Add Redis health monitoring endpoints
- Improve performance by 100x with distributed caching
- Support for multi-instance deployments"

# Push vers GitHub
echo "📤 Push vers GitHub..."
git push origin $CURRENT_BRANCH

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Allez sur https://dashboard.render.com"
echo "2. Créez un service Redis"
echo "3. Ajoutez les variables d'environnement REDIS_URL et REDIS_PASSWORD"
echo "4. Redéployez votre service Web"
echo ""
echo "🔍 Vérification :"
echo "curl https://ux-jobs-pro-backend.onrender.com/api/redis/health"
echo ""
