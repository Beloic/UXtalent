-- Script SQL à exécuter dans Supabase SQL Editor
-- Supprime les colonnes de quotas maximum de la table recruiters
-- Garde les statistiques (total_jobs_posted, total_candidate_contacts, total_applications_received)

-- 1. Supprimer les colonnes de quotas maximum
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_job_posts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_candidate_contacts;
ALTER TABLE recruiters DROP COLUMN IF EXISTS max_featured_jobs;

-- 2. Vérifier que les colonnes ont été supprimées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recruiters' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier que les statistiques sont toujours présentes
SELECT 
  email,
  total_jobs_posted,
  total_candidate_contacts,
  total_applications_received,
  plan_type,
  subscription_status
FROM recruiters 
WHERE email = 'be.loic23@gmail.com';
