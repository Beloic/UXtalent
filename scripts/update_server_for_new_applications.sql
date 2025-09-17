-- Script pour adapter le serveur à la nouvelle table applications
-- Ce script montre les changements nécessaires dans le code serveur

-- 1. Vérifier la structure de la nouvelle table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;

-- 2. Vérifier les données existantes
SELECT 
    COUNT(*) as total_applications,
    COUNT(DISTINCT candidate_id) as unique_candidates,
    COUNT(DISTINCT job_id) as unique_jobs,
    COUNT(DISTINCT recruiter_id) as unique_recruiters
FROM applications;

-- 3. Vérifier les statuts
SELECT 
    status,
    COUNT(*) as count
FROM applications 
GROUP BY status
ORDER BY count DESC;

-- 4. Vérifier les candidatures récentes
SELECT 
    a.id,
    a.first_name,
    a.last_name,
    a.candidate_email,
    a.status,
    a.applied_at,
    c.name as candidate_name,
    j.title as job_title
FROM applications a
LEFT JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN jobs j ON a.job_id = j.id
ORDER BY a.applied_at DESC
LIMIT 10;

-- 5. Vérifier les candidatures par recruteur
SELECT 
    a.recruiter_id,
    COUNT(*) as applications_count,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count
FROM applications a
GROUP BY a.recruiter_id
ORDER BY applications_count DESC;
