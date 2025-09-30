-- Migration pour créer la table recruiters
-- Date: 2025-01-21
-- Description: Création de la table recruiters avec gestion des abonnements

-- Créer la table recruiters
CREATE TABLE IF NOT EXISTS recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Informations d'abonnement
    plan_type VARCHAR(50) DEFAULT 'starter' CHECK (plan_type IN ('starter', 'max', 'premium', 'custom')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired', 'trial')),
    
    -- Dates d'abonnement
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Informations de paiement
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    payment_method VARCHAR(50),
    
    -- Limites et quotas
    max_job_posts INTEGER DEFAULT 5,
    max_candidate_contacts INTEGER DEFAULT 100,
    max_featured_jobs INTEGER DEFAULT 1,
    
    -- Statistiques
    total_jobs_posted INTEGER DEFAULT 0,
    total_candidates_contacted INTEGER DEFAULT 0,
    total_applications_received INTEGER DEFAULT 0,
    
    -- Métadonnées
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON recruiters(email);
CREATE INDEX IF NOT EXISTS idx_recruiters_plan_type ON recruiters(plan_type);
CREATE INDEX IF NOT EXISTS idx_recruiters_subscription_status ON recruiters(subscription_status);
CREATE INDEX IF NOT EXISTS idx_recruiters_subscription_end_date ON recruiters(subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_recruiters_stripe_customer_id ON recruiters(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_created_at ON recruiters(created_at);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_recruiters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_recruiters_updated_at ON recruiters;
CREATE TRIGGER trigger_update_recruiters_updated_at
    BEFORE UPDATE ON recruiters
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiters_updated_at();

-- Créer une fonction pour vérifier la validité de l'abonnement
CREATE OR REPLACE FUNCTION check_recruiter_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la date de fin d'abonnement est passée, marquer comme expiré
    IF NEW.subscription_end_date IS NOT NULL AND NEW.subscription_end_date < NOW() THEN
        NEW.subscription_status = 'expired';
    END IF;
    
    -- Si c'est un abonnement actif et que la date de fin est dans le futur, s'assurer qu'il est actif
    IF NEW.subscription_end_date IS NOT NULL AND NEW.subscription_end_date > NOW() AND NEW.subscription_status = 'active' THEN
        NEW.subscription_status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour vérifier le statut d'abonnement
DROP TRIGGER IF EXISTS trigger_check_recruiter_subscription_status ON recruiters;
CREATE TRIGGER trigger_check_recruiter_subscription_status
    BEFORE INSERT OR UPDATE ON recruiters
    FOR EACH ROW
    EXECUTE FUNCTION check_recruiter_subscription_status();

-- Insérer des données de test (optionnel) - seulement si la table n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM recruiters WHERE email = 'be.loic23@gmail.com') THEN
        INSERT INTO recruiters (
            email, 
            name, 
            company, 
            plan_type, 
            subscription_status,
            subscription_start_date,
            subscription_end_date
        ) VALUES (
            'be.loic23@gmail.com',
            'Loic Bernard',
            'UX Jobs Pro',
            'max',
            'active',
            NOW(),
            NOW() + INTERVAL '1 year'
        );
    END IF;
END $$;

-- Commentaires sur la table
COMMENT ON TABLE recruiters IS 'Table des recruteurs avec gestion des abonnements et quotas';
COMMENT ON COLUMN recruiters.plan_type IS 'Type de plan: starter, max, premium, custom';
COMMENT ON COLUMN recruiters.subscription_status IS 'Statut de l''abonnement: active, inactive, cancelled, expired, trial';
