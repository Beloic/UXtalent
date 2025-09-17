-- Création de la nouvelle table applications
-- Cette table permet aux candidats de postuler aux offres et aux recruteurs de voir les candidatures

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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_recruiter_id ON applications(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_applications_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE applications IS 'Table des candidatures - permet aux candidats de postuler aux offres et aux recruteurs de gérer les candidatures';
COMMENT ON COLUMN applications.candidate_id IS 'ID du candidat (référence vers candidates.id)';
COMMENT ON COLUMN applications.recruiter_id IS 'ID du recruteur (UUID)';
COMMENT ON COLUMN applications.job_id IS 'ID de l''offre d''emploi (référence vers jobs.id)';
COMMENT ON COLUMN applications.first_name IS 'Prénom du candidat';
COMMENT ON COLUMN applications.last_name IS 'Nom du candidat';
COMMENT ON COLUMN applications.candidate_email IS 'Email du candidat';
COMMENT ON COLUMN applications.status IS 'Statut: pending, reviewed, accepted, rejected';
COMMENT ON COLUMN applications.notes IS 'Notes du recruteur sur la candidature';
COMMENT ON COLUMN applications.applied_at IS 'Date et heure de candidature';
COMMENT ON COLUMN applications.reviewed_at IS 'Date et heure de révision par le recruteur';
