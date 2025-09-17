-- Script SQL pour mettre à jour les candidatures de Loic Bernard
-- UUID de Loic Bernard: 20a12bd7-ff59-4de1-8d6a-84ddaffeca5f
-- ID cible: 26

-- 1. Vérifier les candidatures actuelles de Loic Bernard
SELECT 
    id,
    job_id,
    candidate_id,
    first_name,
    last_name,
    applied_at
FROM applications 
WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 2. Mettre à jour le candidate_id vers 26
-- Note: Cette requête échouera si candidate_id est de type UUID
-- Il faut d'abord modifier le type de colonne ou utiliser une approche différente

-- Option A: Si on peut modifier le type de colonne (ATTENTION: peut casser d'autres choses)
-- ALTER TABLE applications ALTER COLUMN candidate_id TYPE INTEGER USING candidate_id::TEXT::INTEGER;

-- Option B: Créer une nouvelle colonne candidate_id_int et migrer les données
-- ALTER TABLE applications ADD COLUMN candidate_id_int INTEGER;
-- UPDATE applications SET candidate_id_int = 26 WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- Option C: Utiliser une table de correspondance (recommandé)
-- Créer une table de mapping simple avec seulement candidate_id
CREATE TABLE IF NOT EXISTS candidate_id_mapping (
    candidate_id UUID PRIMARY KEY,
    candidate_db_id INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer la correspondance pour Loic Bernard
INSERT INTO candidate_id_mapping (candidate_id, candidate_db_id)
VALUES ('20a12bd7-ff59-4de1-8d6a-84ddaffeca5f', 26)
ON CONFLICT (candidate_id) DO UPDATE SET
    candidate_db_id = EXCLUDED.candidate_db_id;

-- Vérifier la correspondance créée
SELECT * FROM candidate_id_mapping WHERE candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';

-- 3. Vérifier que Loic Bernard existe bien avec l'ID 26
SELECT 
    id,
    name,
    email,
    title,
    location
FROM candidates 
WHERE id = 26;

-- 4. Requête pour récupérer les candidatures avec le bon candidat (à utiliser dans l'API)
-- Cette requête joint les candidatures avec les candidats via la table de mapping
SELECT 
    a.id as application_id,
    a.job_id,
    a.candidate_id,
    m.candidate_db_id,
    c.name as candidate_name,
    c.title as candidate_title,
    c.location as candidate_location,
    a.applied_at
FROM applications a
LEFT JOIN candidate_id_mapping m ON a.candidate_id = m.candidate_id
LEFT JOIN candidates c ON m.candidate_db_id = c.id
WHERE a.candidate_id = '20a12bd7-ff59-4de1-8d6a-84ddaffeca5f';
