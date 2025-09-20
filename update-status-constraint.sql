-- Script SQL pour modifier la contrainte de vérification de la colonne 'status'
-- afin qu'elle accepte aussi la valeur 'new'

-- 1. Supprimer l'ancienne contrainte de vérification
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS check_status;

-- 2. Ajouter la nouvelle contrainte qui accepte 'new', 'pending', 'approved', 'rejected'
ALTER TABLE candidates ADD CONSTRAINT check_status 
CHECK (status IN ('new', 'pending', 'approved', 'rejected'));

-- 3. Vérifier que la contrainte a été appliquée
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'candidates'::regclass 
AND contype = 'c';

-- 4. Tester la nouvelle contrainte avec un insert de test
INSERT INTO candidates (
    name, email, bio, title, location, remote, skills, 
    portfolio, linkedin, github, daily_rate, annual_salary, status
) VALUES (
    'Test Constraint', 'test-constraint@example.com', 'Test de la nouvelle contrainte',
    '', '', 'hybrid', '{}', '', '', '', NULL, NULL, 'new'
);

-- 5. Supprimer le test
DELETE FROM candidates WHERE email = 'test-constraint@example.com';

-- 6. Optionnel : Mettre à jour les profils existants avec statut 'pending' vers 'new' si souhaité
-- UPDATE candidates SET status = 'new' WHERE status = 'pending' AND created_at > '2025-09-20';
