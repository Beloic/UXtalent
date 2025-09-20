#!/bin/bash

echo "🔄 Migration de la contrainte de vérification pour la colonne status..."

# Vérifier que supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier que nous sommes connectés
echo "🔐 Vérification de la connexion Supabase..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Vous n'êtes pas connecté à Supabase. Exécutez: supabase login"
    exit 1
fi

echo "✅ Connecté à Supabase"

# Exécuter le script SQL
echo "📝 Exécution du script SQL de migration..."
supabase db push --include-all

if [ $? -eq 0 ]; then
    echo "✅ Migration terminée avec succès !"
    echo "📋 La colonne status accepte maintenant: 'new', 'pending', 'approved', 'rejected'"
else
    echo "❌ Erreur lors de la migration"
    echo ""
    echo "📋 Alternative: Exécutez le script SQL directement dans Supabase Dashboard"
    echo "1. Allez sur https://supabase.com/dashboard"
    echo "2. Sélectionnez votre projet"
    echo "3. Allez dans 'SQL Editor'"
    echo "4. Copiez et exécutez le contenu du fichier update-status-constraint.sql"
fi
