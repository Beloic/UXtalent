-- Script ultra-simple pour le candidat spécifique
-- candidate_id UUID: 20a12bd7-ff59-4de1-8d6a-84ddaffeca5f
-- Évite tous les problèmes de types

-- 1. Vérifier les candidatures actuelles de ce candidat
SELECT 
    id as application_id,
    job_id,
    candidate_id,
    status,
    applied_at
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 2. Mettre à jour vers job_id = 26
UPDATE applications 
SET job_id = 26 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Vérifier le résultat
SELECT 
    id as application_id,
    job_id,
    candidate_id,
    status,
    applied_at
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 4. Mettre à jour le compteur de candidatures
UPDATE jobs 
SET applications_count = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE job_id = 26
)
WHERE id = 26;

-- 5. Vérifier le compteur
SELECT 
    id,
    title,
    applications_count
FROM jobs 
WHERE id = 26;

-- 6. Résumé final
SELECT 
    'Mise à jour terminée' as status,
    COUNT(*) as total_applications_candidate,
    COUNT(CASE WHEN job_id = 26 THEN 1 END) as applications_job_26
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
