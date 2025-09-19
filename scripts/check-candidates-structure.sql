-- Script pour vérifier la structure de la table candidates
-- Ce script permet de voir les types de données utilisés

-- 1. Vérifier la structure de la table candidates
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'candidates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes de clé primaire
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.data_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'candidates' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'PRIMARY KEY';

-- 3. Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.data_type,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'candidates' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'FOREIGN KEY';

-- 4. Afficher quelques exemples de données
SELECT 
    id,
    name,
    status,
    created_at
FROM candidates 
LIMIT 5;
