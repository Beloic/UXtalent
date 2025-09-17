-- Script SQL pour forcer le job_id à 26 pour Loic Bernard
-- Ce script met à jour toutes les candidatures de Loic Bernard pour qu'elles pointent vers l'offre avec l'ID 26

-- 1. Vérifier les candidatures actuelles de Loic Bernard
SELECT 
    a.id as application_id,
    a.job_id as current_job_id,
    a.candidate_id,
    c.name as candidate_name,
    j.title as job_title
FROM applications a
JOIN candidates c ON a.candidate_id::text = c.id::text
LEFT JOIN jobs j ON a.job_id = j.id
WHERE c.name ILIKE '%Loic Bernard%' OR c.name ILIKE '%loic bernard%';

-- 2. Mettre à jour toutes les candidatures de Loic Bernard pour qu'elles pointent vers l'offre ID 26
UPDATE applications 
SET job_id = 26
WHERE candidate_id IN (
    SELECT id::text 
    FROM candidates 
    WHERE name ILIKE '%Loic Bernard%' OR name ILIKE '%loic bernard%'
);

-- 3. Vérifier le résultat après la mise à jour
SELECT 
    a.id as application_id,
    a.job_id as new_job_id,
    a.candidate_id,
    c.name as candidate_name,
    j.title as job_title,
    a.status,
    a.applied_at
FROM applications a
JOIN candidates c ON a.candidate_id::text = c.id::text
LEFT JOIN jobs j ON a.job_id = j.id
WHERE c.name ILIKE '%Loic Bernard%' OR c.name ILIKE '%loic bernard%';

-- 4. Mettre à jour le compteur de candidatures pour l'offre ID 26
UPDATE jobs 
SET applications_count = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE job_id = 26
)
WHERE id = 26;

-- 5. Vérifier le compteur de candidatures pour l'offre ID 26
SELECT 
    id,
    title,
    company,
    applications_count,
    status
FROM jobs 
WHERE id = 26;

-- 6. Optionnel : Créer une candidature pour Loic Bernard si elle n'existe pas
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
    c.id::text as candidate_id,
    j.recruiter_id,
    'pending' as status,
    NOW() as applied_at,
    'Loic' as first_name,
    'Bernard' as last_name,
    c.email as candidate_email
FROM candidates c
CROSS JOIN jobs j
WHERE c.name ILIKE '%Loic Bernard%' OR c.name ILIKE '%loic bernard%'
AND j.id = 26
AND NOT EXISTS (
    SELECT 1 
    FROM applications a 
    WHERE a.candidate_id::text = c.id::text 
    AND a.job_id = 26
);

-- 7. Requête finale pour vérifier que tout est correct
SELECT 
    'Résumé final' as info,
    COUNT(*) as total_applications_loic,
    COUNT(CASE WHEN job_id = 26 THEN 1 END) as applications_job_26
FROM applications a
JOIN candidates c ON a.candidate_id::text = c.id::text
WHERE c.name ILIKE '%Loic Bernard%' OR c.name ILIKE '%loic bernard%';
