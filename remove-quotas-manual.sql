-- Script SQL pour supprimer les limitations de quotas de la table recruiters
-- À exécuter manuellement dans Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Supprimer les colonnes de quotas de la table recruiters
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_job_posts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_candidate_contacts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_featured_jobs;

-- 2. Supprimer les colonnes de statistiques de quotas
ALTER TABLE recruiters DROP COLUMN IF EXISTS total_jobs_posted;
ALTER TABLE recruiters DROP COLUMN IF EXISTS total_candidate_contacts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS total_applications_received;

-- 3. Vérifier que les colonnes ont été supprimées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recruiters' 
AND table_schema = 'public'
ORDER BY column_name;

-- 4. Vérifier la structure finale de la table
\d recruiters;
