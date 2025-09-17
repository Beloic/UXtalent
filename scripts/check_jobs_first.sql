-- Script pour vérifier les offres disponibles avant de mettre à jour
-- Évite l'erreur de contrainte de clé étrangère

-- 1. Vérifier toutes les offres disponibles
SELECT 
    id,
    title,
    company,
    status,
    applications_count,
    created_at
FROM jobs 
ORDER BY id;

-- 2. Vérifier les candidatures actuelles du candidat spécifique
SELECT 
    id as application_id,
    job_id,
    candidate_id,
    status,
    applied_at
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Vérifier si l'offre ID 26 existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM jobs WHERE id = 26) 
        THEN 'L''offre ID 26 existe'
        ELSE 'L''offre ID 26 n''existe PAS'
    END as offre_26_status;

-- 4. Si l'offre 26 n'existe pas, utiliser la première offre disponible
-- (Décommentez cette section si l'offre 26 n'existe pas)
/*
UPDATE applications 
SET job_id = (
    SELECT MIN(id) 
    FROM jobs 
    WHERE status = 'active'
)
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
*/

-- 5. Vérifier le résultat après mise à jour (si vous avez décommenté l'étape 4)
/*
SELECT 
    id as application_id,
    job_id,
    candidate_id,
    status,
    applied_at
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
*/
