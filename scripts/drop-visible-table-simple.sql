-- Script simple pour supprimer la table 'visible'
-- À exécuter dans l'interface SQL de Supabase

-- 1. Supprimer la vue candidates_visibility
DROP VIEW IF EXISTS candidates_visibility CASCADE;

-- 2. Supprimer les fonctions liées à la visibilité
DROP FUNCTION IF EXISTS set_candidate_visibility(INTEGER, TEXT, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS set_candidate_visibility_for_user(INTEGER, UUID, TEXT, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS get_visible_candidates_for_role(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_visible_updated_at() CASCADE;

-- 3. Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_update_visible_updated_at ON visible CASCADE;

-- 4. Supprimer la table visible et toutes ses contraintes
DROP TABLE IF EXISTS visible CASCADE;

-- 5. Vérifier que la suppression a bien eu lieu
SELECT 
    'Table visible supprimée avec succès' as status,
    COUNT(*) as tables_remaining
FROM information_schema.tables 
WHERE table_name = 'visible' 
AND table_schema = 'public';
