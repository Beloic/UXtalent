-- Script SQL pour supprimer les limitations de quotas de la table recruiters
-- À exécuter dans Supabase SQL Editor

-- Supprimer les colonnes de quotas de la table recruiters
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_job_posts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_candidate_contacts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_featured_jobs;

-- Supprimer les colonnes de statistiques de quotas si elles existent
ALTER TABLE recruiters DROP COLUMN IF EXISTS total_jobs_posted;
ALTER TABLE recruiters DROP COLUMN IF EXISTS total_candidate_contacts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS total_applications_received;

-- Vérifier que les colonnes ont été supprimées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recruiters' 
AND table_schema = 'public'
ORDER BY column_name;
