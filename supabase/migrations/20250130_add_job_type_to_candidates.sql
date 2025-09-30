-- Migration pour ajouter la colonne job_type à la table candidates
-- Date: 2025-01-30
-- Description: Ajout de la colonne job_type pour stocker le type de poste souhaité par le candidat

-- Ajouter la colonne job_type à la table candidates
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'CDI';

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN candidates.job_type IS 'Type de poste souhaité par le candidat (CDI, CDD, Freelance, etc.)';

-- Créer un index pour optimiser les requêtes de recherche par type de poste
CREATE INDEX IF NOT EXISTS idx_candidates_job_type ON candidates(job_type);

-- Mettre à jour les enregistrements existants avec une valeur par défaut si nécessaire
UPDATE candidates 
SET job_type = 'CDI' 
WHERE job_type IS NULL;
