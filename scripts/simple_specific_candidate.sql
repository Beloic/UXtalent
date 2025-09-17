-- Script ultra-simple pour le candidat spécifique
-- ID: 20a12bd7-ff59-4de1-8d6a-84ddaffeca5f

-- 1. Vérifier le candidat
SELECT id, name FROM candidates WHERE id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 2. Vérifier ses candidatures actuelles
SELECT * FROM applications WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Mettre à jour vers job_id = 26
UPDATE applications 
SET job_id = 26 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 4. Vérifier le résultat
SELECT * FROM applications WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 5. Mettre à jour le compteur
UPDATE jobs 
SET applications_count = (SELECT COUNT(*) FROM applications WHERE job_id = 26)
WHERE id = 26;

-- 6. Vérifier le compteur
SELECT id, title, applications_count FROM jobs WHERE id = 26;
