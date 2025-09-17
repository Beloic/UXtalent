-- Script ultra-simple pour forcer le job_id à 26 pour Loic Bernard
-- Évite les problèmes de types en utilisant des requêtes séparées

-- 1. Trouver l'ID de Loic Bernard
SELECT id, name FROM candidates WHERE name ILIKE '%Loic Bernard%';

-- 2. Vérifier les candidatures actuelles (remplacez X par l'ID trouvé à l'étape 1)
-- SELECT * FROM applications WHERE candidate_id = 'X';

-- 3. Mettre à jour les candidatures (remplacez X par l'ID trouvé à l'étape 1)
-- UPDATE applications SET job_id = 26 WHERE candidate_id = 'X';

-- 4. Vérifier le résultat (remplacez X par l'ID trouvé à l'étape 1)
-- SELECT * FROM applications WHERE candidate_id = 'X';

-- 5. Mettre à jour le compteur de candidatures
UPDATE jobs 
SET applications_count = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE job_id = 26
)
WHERE id = 26;

-- 6. Vérifier le compteur
SELECT id, title, applications_count FROM jobs WHERE id = 26;
