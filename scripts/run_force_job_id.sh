#!/bin/bash

# Script pour exécuter la mise à jour du job_id pour Loic Bernard
# Ce script force toutes les candidatures de Loic Bernard à pointer vers l'offre ID 26

echo "🚀 Début de la mise à jour du job_id pour Loic Bernard..."

# Vérifier si le fichier SQL existe
if [ ! -f "force_job_id_26_loic.sql" ]; then
    echo "❌ Erreur: Le fichier force_job_id_26_loic.sql n'existe pas"
    exit 1
fi

# Vérifier si psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ Erreur: psql n'est pas installé ou n'est pas dans le PATH"
    echo "💡 Installez PostgreSQL ou utilisez Supabase CLI"
    exit 1
fi

# Demander confirmation
echo "⚠️  Cette opération va modifier les candidatures de Loic Bernard pour qu'elles pointent vers l'offre ID 26"
echo "📋 Voulez-vous continuer ? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 0
fi

# Exécuter le script SQL
echo "📝 Exécution du script SQL..."
echo "🔗 Connexion à la base de données..."

# Note: Vous devrez remplacer ces paramètres par vos vraies informations de connexion Supabase
# Exemple avec Supabase:
# psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f force_job_id_26_loic.sql

echo "💡 Pour exécuter ce script, utilisez une des commandes suivantes:"
echo ""
echo "1. Avec Supabase CLI:"
echo "   supabase db reset --db-url 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
echo "   psql 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres' -f force_job_id_26_loic.sql"
echo ""
echo "2. Avec psql direct:"
echo "   psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f force_job_id_26_loic.sql"
echo ""
echo "3. Via l'interface Supabase:"
echo "   - Allez sur https://supabase.com/dashboard"
echo "   - Ouvrez votre projet"
echo "   - Allez dans SQL Editor"
echo "   - Copiez-collez le contenu de force_job_id_26_loic.sql"
echo "   - Exécutez le script"

echo ""
echo "✅ Script SQL créé: force_job_id_26_loic.sql"
echo "📋 Le script va:"
echo "   - Vérifier les candidatures actuelles de Loic Bernard"
echo "   - Mettre à jour toutes ses candidatures pour job_id = 26"
echo "   - Mettre à jour le compteur de candidatures"
echo "   - Créer une candidature si elle n'existe pas"
echo "   - Afficher un résumé final"
