-- Script SQL pour supprimer complètement la table 'visible' et toutes ses dépendances
-- ATTENTION: Cette opération est irréversible !

-- 1. Supprimer la vue candidates_visibility
DROP VIEW IF EXISTS candidates_visibility CASCADE;

-- 2. Supprimer les fonctions liées à la visibilité
DROP FUNCTION IF EXISTS set_candidate_visibility(INTEGER, TEXT, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS set_candidate_visibility_for_user(INTEGER, UUID, TEXT, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS get_visible_candidates_for_role(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_visible_updated_at() CASCADE;

-- 3. Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_update_visible_updated_at ON visible CASCADE;

-- 4. Supprimer les index (seront supprimés automatiquement avec la table)
-- Les index suivants seront supprimés automatiquement :
-- - idx_visible_candidate_id
-- - idx_visible_user_id  
-- - idx_visible_user_role
-- - idx_visible_is_visible

-- 5. Supprimer la table visible et toutes ses contraintes
DROP TABLE IF EXISTS visible CASCADE;

-- 6. Vérifier que la suppression a bien eu lieu
SELECT 
    'Table visible supprimée avec succès' as status,
    COUNT(*) as tables_remaining
FROM information_schema.tables 
WHERE table_name = 'visible' 
AND table_schema = 'public';

-- 7. Afficher un résumé des tables candidates restantes
SELECT 
    'Tables candidates restantes' as status,
    COUNT(*) as total_candidates,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_candidates,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_candidates,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_candidates
FROM candidates;
