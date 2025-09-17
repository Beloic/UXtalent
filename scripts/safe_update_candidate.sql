-- Script sécurisé pour mettre à jour le candidat spécifique
-- Utilise automatiquement la première offre disponible si l'ID 26 n'existe pas

-- 1. Vérifier les offres disponibles
SELECT 
    id,
    title,
    company,
    status,
    applications_count
FROM jobs 
ORDER BY id;

-- 2. Vérifier les candidatures actuelles du candidat
SELECT 
    id as application_id,
    job_id,
    candidate_id,
    status,
    applied_at
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Trouver la première offre active disponible
SELECT 
    MIN(id) as first_available_job_id,
    title as job_title,
    company
FROM jobs 
WHERE status = 'active';

-- 4. Mettre à jour vers la première offre disponible (ou 26 si elle existe)
UPDATE applications 
SET job_id = COALESCE(
    (SELECT id FROM jobs WHERE id = 26 LIMIT 1),
    (SELECT MIN(id) FROM jobs WHERE status = 'active')
)
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 5. Vérifier le résultat
SELECT 
    id as application_id,
    job_id,
    candidate_id,
    status,
    applied_at,
    j.title as job_title
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 6. Mettre à jour le compteur de candidatures pour l'offre utilisée
UPDATE jobs 
SET applications_count = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE job_id = (
        SELECT job_id 
        FROM applications 
        WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f'
        LIMIT 1
    )
)
WHERE id = (
    SELECT job_id 
    FROM applications 
    WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f'
    LIMIT 1
);

-- 7. Vérifier le compteur mis à jour
SELECT 
    j.id,
    j.title,
    j.applications_count
FROM jobs j
WHERE j.id = (
    SELECT job_id 
    FROM applications 
    WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f'
    LIMIT 1
);

-- 8. Résumé final
SELECT 
    'Mise à jour sécurisée terminée' as status,
    COUNT(*) as total_applications_candidate,
    COUNT(CASE WHEN job_id = (
        SELECT job_id 
        FROM applications 
        WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f'
        LIMIT 1
    ) THEN 1 END) as applications_target_job
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
