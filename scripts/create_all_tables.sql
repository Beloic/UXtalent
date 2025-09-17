-- Script complet pour créer toutes les tables nécessaires
-- Exécutez ce script dans Supabase SQL Editor

-- ========================================
-- TABLE CANDIDATES
-- ========================================
CREATE TABLE IF NOT EXISTS candidates (
    -- ID du candidat (auto-incrémenté)
    id SERIAL PRIMARY KEY,
    
    -- Informations personnelles
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    location VARCHAR(255),
    remote VARCHAR(50) DEFAULT 'hybrid', -- 'remote', 'onsite', 'hybrid'
    experience VARCHAR(50), -- 'Junior', 'Mid', 'Senior', 'Lead'
    
    -- Profil professionnel
    bio TEXT,
    skills TEXT[], -- Array de compétences
    portfolio VARCHAR(500),
    linkedin VARCHAR(500),
    github VARCHAR(500),
    photo VARCHAR(500),
    
    -- Rémunération
    daily_rate INTEGER, -- TJM en euros
    annual_salary INTEGER, -- Salaire annuel en euros
    
    -- Disponibilité
    availability VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    
    -- Statut et visibilité
    visible BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,
    
    -- Plan et fonctionnalités premium
    plan_type VARCHAR(50) DEFAULT 'free', -- 'free', 'premium', 'enterprise'
    plan_start_date TIMESTAMP WITH TIME ZONE,
    plan_end_date TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP WITH TIME ZONE,
    
    -- Notes du recruteur
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la table candidates
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_approved ON candidates(approved);
CREATE INDEX IF NOT EXISTS idx_candidates_visible ON candidates(visible);
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates(location);
CREATE INDEX IF NOT EXISTS idx_candidates_experience ON candidates(experience);
CREATE INDEX IF NOT EXISTS idx_candidates_availability ON candidates(availability);

-- ========================================
-- TABLE JOBS
-- ========================================
CREATE TABLE IF NOT EXISTS jobs (
    -- ID de l'offre (auto-incrémenté)
    id SERIAL PRIMARY KEY,
    
    -- Informations de l'offre
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    remote VARCHAR(50) DEFAULT 'hybrid', -- 'remote', 'onsite', 'hybrid'
    type VARCHAR(50), -- 'CDI', 'CDD', 'Freelance', 'Stage'
    seniority VARCHAR(50), -- 'Junior', 'Mid', 'Senior', 'Lead'
    
    -- Description
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    tags TEXT[], -- Array de tags
    
    -- Rémunération
    salary VARCHAR(100), -- Ex: "50-65k€", "TJM 500-800€"
    
    -- Métadonnées
    recruiter_id UUID NOT NULL, -- ID du recruteur (UUID)
    status VARCHAR(50) DEFAULT 'pending_approval', -- 'pending_approval', 'active', 'closed', 'draft'
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la table jobs
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- ========================================
-- TABLE APPLICATIONS (déjà créée, mais on la recrée pour être sûr)
-- ========================================
CREATE TABLE IF NOT EXISTS applications (
    -- ID de la candidature (auto-incrémenté)
    id SERIAL PRIMARY KEY,
    
    -- ID du candidat (référence vers la table candidates)
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    
    -- ID du recruteur (référence vers la table recruiters ou jobs)
    recruiter_id UUID NOT NULL,
    
    -- ID de l'offre d'emploi (référence vers la table jobs)
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Informations du candidat (stockées pour éviter les jointures)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    
    -- Statut de la candidature
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    
    -- Notes du recruteur (optionnel)
    notes TEXT,
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(candidate_id, job_id) -- Un candidat ne peut postuler qu'une fois par offre
);

-- Index pour la table applications
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_recruiter_id ON applications(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);

-- ========================================
-- TRIGGERS POUR UPDATED_AT
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour candidates
CREATE TRIGGER trigger_update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Triggers pour jobs
CREATE TRIGGER trigger_update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Triggers pour applications
CREATE TRIGGER trigger_update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ========================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ========================================

COMMENT ON TABLE candidates IS 'Table des candidats - profils des personnes à la recherche d''emploi';
COMMENT ON TABLE jobs IS 'Table des offres d''emploi - postes proposés par les recruteurs';
COMMENT ON TABLE applications IS 'Table des candidatures - liens entre candidats et offres';

-- Vérification que toutes les tables existent
SELECT 
    'Tables créées avec succès' as message,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name IN ('candidates', 'jobs', 'applications');
