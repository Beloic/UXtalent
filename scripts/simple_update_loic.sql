-- Script simple pour forcer le job_id à 26 pour Loic Bernard
-- À exécuter dans l'interface Supabase SQL Editor

-- Étape 1: Vérifier les candidatures actuelles de Loic Bernard
SELECT 
    a.id as application_id,
    a.job_id as current_job_id,
    a.candidate_id,
    c.name as candidate_name
FROM applications a
JOIN candidates c ON a.candidate_id::text = c.id::text
WHERE c.name ILIKE '%Loic Bernard%';

-- Étape 2: Mettre à jour toutes les candidatures de Loic Bernard
UPDATE applications 
SET job_id = 26
WHERE candidate_id IN (
    SELECT id::text 
    FROM candidates 
    WHERE name ILIKE '%Loic Bernard%'
);

-- Étape 3: Vérifier le résultat
SELECT 
    a.id as application_id,
    a.job_id as new_job_id,
    a.candidate_id,
    c.name as candidate_name,
    a.status
FROM applications a
JOIN candidates c ON a.candidate_id::text = c.id::text
WHERE c.name ILIKE '%Loic Bernard%';

-- Étape 4: Mettre à jour le compteur de candidatures
UPDATE jobs 
SET applications_count = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE job_id = 26
)
WHERE id = 26;

-- Étape 5: Résumé final
SELECT 
    'Mise à jour terminée' as status,
    COUNT(*) as total_applications_loic,
    COUNT(CASE WHEN job_id = 26 THEN 1 END) as applications_job_26
FROM applications a
JOIN candidates c ON a.candidate_id::text = c.id::text
WHERE c.name ILIKE '%Loic Bernard%';
