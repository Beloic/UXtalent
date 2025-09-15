-- ===== SCRIPT DE SUPPRESSION DES CORRÉLATIONS RECRUTEURS-CANDIDATS =====
-- Ce script supprime tous les éléments qui créent des liens entre recruteurs et candidats

-- ===== 1. SUPPRESSION DES TABLES DE CORRÉLATION =====

-- Supprimer la table des rendez-vous (appointments)
DROP TABLE IF EXISTS appointments CASCADE;

-- Supprimer la table des favoris des recruteurs
DROP TABLE IF EXISTS recruiter_favorites CASCADE;

-- Supprimer la table des recherches de recruteurs
DROP TABLE IF EXISTS recruiter_searches CASCADE;

-- Supprimer la table des entreprises de recruteurs
DROP TABLE IF EXISTS recruiter_companies CASCADE;

-- ===== 2. SUPPRESSION DES COLONNES DE CORRÉLATION =====

-- Supprimer la colonne notes de la table candidates
ALTER TABLE candidates DROP COLUMN IF EXISTS notes;

-- ===== 3. SUPPRESSION DES INDEX ASSOCIÉS =====

-- Supprimer les index liés aux rendez-vous
DROP INDEX IF EXISTS idx_appointments_recruiter_id;
DROP INDEX IF EXISTS idx_appointments_candidate_id;
DROP INDEX IF EXISTS idx_appointments_date;

-- Supprimer les index liés aux favoris
DROP INDEX IF EXISTS idx_recruiter_favorites_recruiter_id;
DROP INDEX IF EXISTS idx_recruiter_favorites_candidate_id;

-- Supprimer les index liés aux recherches
DROP INDEX IF EXISTS idx_recruiter_searches_recruiter_id;
DROP INDEX IF EXISTS idx_recruiter_searches_status;
DROP INDEX IF EXISTS idx_recruiter_searches_profile_type;

-- Supprimer les index liés aux entreprises
DROP INDEX IF EXISTS idx_recruiter_companies_recruiter_id;
DROP INDEX IF EXISTS idx_recruiter_companies_industry;

-- Supprimer l'index des notes des candidats
DROP INDEX IF EXISTS idx_candidates_notes;

-- ===== 4. SUPPRESSION DES FONCTIONS ET TRIGGERS =====

-- Supprimer les fonctions de mise à jour automatique
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_recruiter_searches_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_recruiter_companies_updated_at_column() CASCADE;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_recruiter_searches_updated_at ON recruiter_searches;
DROP TRIGGER IF EXISTS update_recruiter_companies_updated_at ON recruiter_companies;

-- ===== 5. VÉRIFICATION DE LA SUPPRESSION =====

-- Vérifier que les tables ont été supprimées
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('appointments', 'recruiter_favorites', 'recruiter_searches', 'recruiter_companies');

-- Vérifier que la colonne notes a été supprimée de candidates
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'candidates' 
AND column_name = 'notes';

-- ===== 6. NETTOYAGE DES POLITIQUES RLS (si elles existent encore) =====

-- Note: Les politiques RLS sont automatiquement supprimées avec les tables
-- Mais on peut vérifier qu'elles n'existent plus
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('appointments', 'recruiter_favorites', 'recruiter_searches', 'recruiter_companies');

-- ===== MESSAGE DE CONFIRMATION =====
SELECT 'Suppression des corrélations recruteurs-candidats terminée avec succès!' as message;
