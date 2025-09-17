-- Script de vérification de la structure de la base de données
-- Exécutez ce script pour vérifier que toutes les tables sont correctement configurées

-- ========================================
-- VÉRIFICATION DE L'EXISTENCE DES TABLES
-- ========================================

SELECT 
    'Tables existantes' as check_type,
    table_name,
    'OK' as status
FROM information_schema.tables 
WHERE table_name IN ('candidates', 'jobs', 'applications')
ORDER BY table_name;

-- ========================================
-- VÉRIFICATION DE LA STRUCTURE DES TABLES
-- ========================================

-- Structure de la table candidates
SELECT 
    'CANDIDATES STRUCTURE' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'candidates' 
ORDER BY ordinal_position;

-- Structure de la table jobs
SELECT 
    'JOBS STRUCTURE' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- Structure de la table applications
SELECT 
    'APPLICATIONS STRUCTURE' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;

-- ========================================
-- VÉRIFICATION DES CONTRAINTES
-- ========================================

-- Contraintes de clés étrangères
SELECT 
    'FOREIGN KEYS' as constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('applications')
ORDER BY tc.table_name, kcu.column_name;

-- Contraintes uniques
SELECT 
    'UNIQUE CONSTRAINTS' as constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name IN ('candidates', 'jobs', 'applications')
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- VÉRIFICATION DES INDEX
-- ========================================

SELECT 
    'INDEXES' as index_type,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('candidates', 'jobs', 'applications')
ORDER BY tablename, indexname;

-- ========================================
-- VÉRIFICATION DES DONNÉES
-- ========================================

-- Compter les enregistrements dans chaque table
SELECT 
    'DATA COUNT' as check_type,
    'candidates' as table_name,
    COUNT(*) as record_count
FROM candidates
UNION ALL
SELECT 
    'DATA COUNT' as check_type,
    'jobs' as table_name,
    COUNT(*) as record_count
FROM jobs
UNION ALL
SELECT 
    'DATA COUNT' as check_type,
    'applications' as table_name,
    COUNT(*) as record_count
FROM applications;

-- Vérifier les candidats approuvés
SELECT 
    'APPROVED CANDIDATES' as check_type,
    COUNT(*) as total_candidates,
    COUNT(CASE WHEN approved = true THEN 1 END) as approved_count,
    COUNT(CASE WHEN visible = true THEN 1 END) as visible_count
FROM candidates;

-- Vérifier les offres actives
SELECT 
    'ACTIVE JOBS' as check_type,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_count
FROM jobs;

-- Vérifier les candidatures par statut
SELECT 
    'APPLICATION STATUS' as check_type,
    status,
    COUNT(*) as count
FROM applications 
GROUP BY status
ORDER BY count DESC;

-- ========================================
-- VÉRIFICATION DES RELATIONS
-- ========================================

-- Vérifier que les candidatures pointent vers des candidats existants
SELECT 
    'APPLICATION-CANDIDATE RELATION' as check_type,
    COUNT(*) as total_applications,
    COUNT(c.id) as valid_candidate_relations,
    COUNT(*) - COUNT(c.id) as orphaned_applications
FROM applications a
LEFT JOIN candidates c ON a.candidate_id = c.id;

-- Vérifier que les candidatures pointent vers des offres existantes
SELECT 
    'APPLICATION-JOB RELATION' as check_type,
    COUNT(*) as total_applications,
    COUNT(j.id) as valid_job_relations,
    COUNT(*) - COUNT(j.id) as orphaned_applications
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id;

-- ========================================
-- RÉSUMÉ FINAL
-- ========================================

SELECT 
    'DATABASE STATUS' as summary_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'candidates') = 1 
             AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'jobs') = 1 
             AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'applications') = 1
        THEN '✅ Toutes les tables existent'
        ELSE '❌ Tables manquantes'
    END as status,
    (SELECT COUNT(*) FROM candidates) as candidates_count,
    (SELECT COUNT(*) FROM jobs) as jobs_count,
    (SELECT COUNT(*) FROM applications) as applications_count;
