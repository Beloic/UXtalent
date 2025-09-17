-- Script ultra-simple pour le candidat spécifique
-- candidate_id UUID: 20a12bd7-ff59-4de1-8d6a-84ddaffeca5f

-- 1. Trouver le candidat correspondant à ce candidate_id
SELECT 
    c.id as candidate_integer_id,
    c.name,
    c.email,
    a.candidate_id as candidate_uuid_id
FROM candidates c
JOIN applications a ON c.id::text = a.candidate_id::text
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f'
LIMIT 1;

-- 2. Vérifier ses candidatures actuelles
SELECT 
    a.id as application_id,
    a.job_id,
    a.candidate_id,
    a.status,
    a.applied_at,
    j.title as job_title
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Mettre à jour vers job_id = 26
UPDATE applications 
SET job_id = 26 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 4. Vérifier le résultat
SELECT 
    a.id as application_id,
    a.job_id,
    a.candidate_id,
    a.status,
    j.title as job_title
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 5. Mettre à jour le compteur
UPDATE jobs 
SET applications_count = (SELECT COUNT(*) FROM applications WHERE job_id = 26)
WHERE id = 26;

-- 6. Vérifier le compteur
SELECT id, title, applications_count FROM jobs WHERE id = 26;
