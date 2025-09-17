-- Script pour forcer le job_id à 26 pour le candidat spécifique
-- ID du candidat: 20a12bd7-ff59-4de1-8d6a-84ddaffeca5f

-- 1. Vérifier les informations du candidat
SELECT 
    id,
    name,
    email,
    title,
    location
FROM candidates 
WHERE id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 2. Vérifier les candidatures actuelles de ce candidat
SELECT 
    a.id as application_id,
    a.job_id as current_job_id,
    a.candidate_id,
    a.status,
    a.applied_at,
    j.title as job_title
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Mettre à jour toutes les candidatures de ce candidat pour job_id = 26
UPDATE applications 
SET job_id = 26
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 4. Vérifier le résultat après la mise à jour
SELECT 
    a.id as application_id,
    a.job_id as new_job_id,
    a.candidate_id,
    a.status,
    a.applied_at,
    j.title as job_title
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 5. Mettre à jour le compteur de candidatures pour l'offre ID 26
UPDATE jobs 
SET applications_count = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE job_id = 26
)
WHERE id = 26;

-- 6. Vérifier le compteur de candidatures pour l'offre ID 26
SELECT 
    id,
    title,
    company,
    applications_count,
    status
FROM jobs 
WHERE id = 26;

-- 7. Créer une candidature si elle n'existe pas pour ce candidat
INSERT INTO applications (
    job_id,
    candidate_id,
    recruiter_id,
    status,
    applied_at,
    first_name,
    last_name,
    candidate_email
)
SELECT 
    26 as job_id,
    '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f' as candidate_id,
    j.recruiter_id,
    'pending' as status,
    NOW() as applied_at,
    'Loic' as first_name,
    'Bernard' as last_name,
    c.email as candidate_email
FROM candidates c
CROSS JOIN jobs j
WHERE c.id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f'
AND j.id = 26
AND NOT EXISTS (
    SELECT 1 
    FROM applications a 
    WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f' 
    AND a.job_id = 26
);

-- 8. Résumé final
SELECT 
    'Mise à jour terminée pour candidat spécifique' as status,
    COUNT(*) as total_applications_candidate,
    COUNT(CASE WHEN job_id = 26 THEN 1 END) as applications_job_26
FROM applications a
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
