-- Script de test pour vérifier le flux de candidatures avec la nouvelle table
-- Exécutez ce script après avoir créé la table et inséré des données de test

-- 1. Vérifier que la table applications existe et a la bonne structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;

-- 2. Vérifier les données de test
SELECT 
    'Total applications' as metric,
    COUNT(*) as value
FROM applications
UNION ALL
SELECT 
    'Applications pending' as metric,
    COUNT(*) as value
FROM applications 
WHERE status = 'pending'
UNION ALL
SELECT 
    'Applications reviewed' as metric,
    COUNT(*) as value
FROM applications 
WHERE status = 'reviewed'
UNION ALL
SELECT 
    'Applications accepted' as metric,
    COUNT(*) as value
FROM applications 
WHERE status = 'accepted'
UNION ALL
SELECT 
    'Applications rejected' as metric,
    COUNT(*) as value
FROM applications 
WHERE status = 'rejected';

-- 3. Vérifier les candidatures avec les détails des candidats et des offres
SELECT 
    a.id as application_id,
    a.candidate_id,
    a.job_id,
    a.first_name,
    a.last_name,
    a.candidate_email,
    a.status,
    a.applied_at,
    a.reviewed_at,
    c.name as candidate_name,
    c.title as candidate_title,
    j.title as job_title,
    j.company as job_company
FROM applications a
LEFT JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN jobs j ON a.job_id = j.id
ORDER BY a.applied_at DESC;

-- 4. Vérifier les candidatures par recruteur
SELECT 
    a.recruiter_id,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN a.status = 'reviewed' THEN 1 END) as reviewed,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected
FROM applications a
GROUP BY a.recruiter_id
ORDER BY total_applications DESC;

-- 5. Vérifier les candidatures récentes (dernières 24h)
SELECT 
    a.id,
    a.first_name,
    a.last_name,
    a.status,
    a.applied_at,
    EXTRACT(EPOCH FROM (NOW() - a.applied_at))/3600 as hours_ago
FROM applications a
WHERE a.applied_at >= NOW() - INTERVAL '24 hours'
ORDER BY a.applied_at DESC;

-- 6. Test de contrainte unique (un candidat ne peut postuler qu'une fois par offre)
-- Cette requête devrait retourner 0 lignes si la contrainte fonctionne
SELECT 
    candidate_id,
    job_id,
    COUNT(*) as duplicate_count
FROM applications
GROUP BY candidate_id, job_id
HAVING COUNT(*) > 1;
