-- Script pour créer la table kanban et ses colonnes
-- Exécutez ce script dans Supabase SQL Editor

-- ========================================
-- TABLE KANBAN COLUMNS
-- ========================================
CREATE TABLE IF NOT EXISTS kanban_columns (
    -- ID de la colonne (auto-incrémenté)
    id SERIAL PRIMARY KEY,
    
    -- Informations de la colonne
    name VARCHAR(100) NOT NULL UNIQUE, -- 'À contacter', 'Entretien prévu', etc.
    title VARCHAR(100) NOT NULL, -- Titre affiché
    description TEXT, -- Description de la colonne
    
    -- Configuration visuelle
    color VARCHAR(50) DEFAULT 'bg-gray-100', -- Couleur de fond
    icon VARCHAR(50), -- Nom de l'icône Lucide
    
    -- Ordre d'affichage
    column_position INTEGER NOT NULL DEFAULT 0, -- Ordre dans le Kanban
    
    -- Configuration métier
    is_active BOOLEAN DEFAULT true, -- Colonne active ou non
    is_default BOOLEAN DEFAULT false, -- Colonne par défaut pour nouveaux candidats
    
    -- Règles de transition
    allowed_from TEXT[], -- Colonnes depuis lesquelles on peut venir
    allowed_to TEXT[], -- Colonnes vers lesquelles on peut aller
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE KANBAN CANDIDATE STATUS
-- ========================================
CREATE TABLE IF NOT EXISTS kanban_candidate_status (
    -- ID de la relation
    id SERIAL PRIMARY KEY,
    
    -- Références
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kanban_column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    
    -- Statut et historique
    status VARCHAR(100) NOT NULL, -- Statut actuel
    previous_status VARCHAR(100), -- Statut précédent
    
    -- Métadonnées
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Date du dernier déplacement
    moved_by UUID REFERENCES auth.users(id), -- Qui a déplacé le candidat
    notes TEXT, -- Notes spécifiques au statut
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte d'unicité : un candidat ne peut avoir qu'un statut par recruteur
    UNIQUE(candidate_id, recruiter_id)
);

-- ========================================
-- TABLE KANBAN TRANSITIONS
-- ========================================
CREATE TABLE IF NOT EXISTS kanban_transitions (
    -- ID de la transition
    id SERIAL PRIMARY KEY,
    
    -- Références
    from_column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    to_column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    
    -- Configuration de la transition
    is_allowed BOOLEAN DEFAULT true, -- Transition autorisée ou non
    requires_condition TEXT, -- Condition requise (ex: "has_appointment")
    error_message TEXT, -- Message d'erreur si transition interdite
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte d'unicité : une transition unique entre deux colonnes
    UNIQUE(from_column_id, to_column_id)
);

-- ========================================
-- INDEX POUR LES PERFORMANCES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_kanban_columns_position ON kanban_columns(column_position);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_active ON kanban_columns(is_active);
CREATE INDEX IF NOT EXISTS idx_kanban_candidate_status_candidate ON kanban_candidate_status(candidate_id);
CREATE INDEX IF NOT EXISTS idx_kanban_candidate_status_recruiter ON kanban_candidate_status(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_kanban_candidate_status_column ON kanban_candidate_status(kanban_column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_candidate_status_moved_at ON kanban_candidate_status(moved_at);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_from ON kanban_transitions(from_column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_to ON kanban_transitions(to_column_id);

-- ========================================
-- INSERTION DES COLONNES PAR DÉFAUT
-- ========================================
INSERT INTO kanban_columns (name, title, description, color, icon, column_position, is_default, allowed_from, allowed_to) VALUES
('À contacter', 'À contacter', 'Candidats à contacter', 'bg-gray-100', 'MessageSquare', 1, true, 
 ARRAY['Entretien prévu', 'Refusé'], 
 ARRAY['Entretien prévu', 'En cours', 'Accepté', 'Refusé']),

('Entretien prévu', 'Entretien prévu', 'Candidats avec rendez-vous programmé', 'bg-blue-100', 'Clock', 2, false,
 ARRAY['À contacter', 'En cours'], 
 ARRAY['À contacter', 'En cours', 'Accepté', 'Refusé']),

('En cours', 'En cours', 'Candidats en cours de processus', 'bg-yellow-100', 'UserCheck', 3, false,
 ARRAY['À contacter', 'Entretien prévu', 'Accepté'], 
 ARRAY['Entretien prévu', 'Accepté', 'Refusé']),

('Accepté', 'Accepté', 'Candidats acceptés', 'bg-green-100', 'CheckCircle', 4, false,
 ARRAY['En cours'], 
 ARRAY['En cours']),

('Refusé', 'Refusé', 'Candidats refusés', 'bg-red-100', 'XCircle', 5, false,
 ARRAY['À contacter', 'Entretien prévu', 'En cours'], 
 ARRAY['À contacter', 'Entretien prévu'])

ON CONFLICT (name) DO NOTHING;

-- ========================================
-- INSERTION DES TRANSITIONS PAR DÉFAUT
-- ========================================
-- Récupérer les IDs des colonnes pour créer les transitions
WITH column_ids AS (
    SELECT id, name FROM kanban_columns
),
transitions AS (
    SELECT 
        c1.id as from_id,
        c2.id as to_id,
        CASE 
            WHEN c1.name = 'À contacter' AND c2.name = 'Accepté' THEN false
            WHEN c1.name = 'Accepté' AND c2.name = 'Refusé' THEN false
            ELSE true
        END as is_allowed,
        CASE 
            WHEN c2.name = 'Entretien prévu' THEN 'has_appointment'
            ELSE null
        END as condition,
        CASE 
            WHEN c1.name = 'À contacter' AND c2.name = 'Accepté' THEN 'Doit passer par "En cours" d''abord'
            WHEN c1.name = 'Accepté' AND c2.name = 'Refusé' THEN 'Candidat déjà accepté'
            WHEN c2.name = 'Entretien prévu' THEN 'Aucun rendez-vous programmé'
            ELSE null
        END as error_msg
    FROM column_ids c1
    CROSS JOIN column_ids c2
    WHERE c1.id != c2.id
)
INSERT INTO kanban_transitions (from_column_id, to_column_id, is_allowed, requires_condition, error_message)
SELECT from_id, to_id, is_allowed, condition, error_msg
FROM transitions
ON CONFLICT (from_column_id, to_column_id) DO NOTHING;

-- ========================================
-- POLITIQUES RLS (Row Level Security)
-- ========================================

-- Activer RLS sur les tables
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_candidate_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_transitions ENABLE ROW LEVEL SECURITY;

-- Politique pour kanban_columns : lecture pour tous les utilisateurs authentifiés
CREATE POLICY "kanban_columns_read_policy" ON kanban_columns
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour kanban_candidate_status : accès basé sur le recruteur
CREATE POLICY "kanban_candidate_status_select_policy" ON kanban_candidate_status
    FOR SELECT USING (recruiter_id = auth.uid());

CREATE POLICY "kanban_candidate_status_insert_policy" ON kanban_candidate_status
    FOR INSERT WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "kanban_candidate_status_update_policy" ON kanban_candidate_status
    FOR UPDATE USING (recruiter_id = auth.uid());

CREATE POLICY "kanban_candidate_status_delete_policy" ON kanban_candidate_status
    FOR DELETE USING (recruiter_id = auth.uid());

-- Politique pour kanban_transitions : lecture pour tous les utilisateurs authentifiés
CREATE POLICY "kanban_transitions_read_policy" ON kanban_transitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour obtenir les colonnes Kanban actives
CREATE OR REPLACE FUNCTION get_active_kanban_columns()
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    title VARCHAR,
    description TEXT,
    color VARCHAR,
    icon VARCHAR,
    column_position INTEGER,
    is_default BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id,
        kc.name,
        kc.title,
        kc.description,
        kc.color,
        kc.icon,
        kc.column_position,
        kc.is_default
    FROM kanban_columns kc
    WHERE kc.is_active = true
    ORDER BY kc.column_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le statut Kanban d'un candidat pour un recruteur
CREATE OR REPLACE FUNCTION get_candidate_kanban_status(
    p_candidate_id INTEGER,
    p_recruiter_id UUID
)
RETURNS TABLE (
    status VARCHAR,
    kanban_column_id INTEGER,
    moved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kcs.status,
        kcs.kanban_column_id,
        kcs.moved_at,
        kcs.notes
    FROM kanban_candidate_status kcs
    WHERE kcs.candidate_id = p_candidate_id 
      AND kcs.recruiter_id = p_recruiter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour valider une transition
CREATE OR REPLACE FUNCTION validate_kanban_transition(
    p_from_column_id INTEGER,
    p_to_column_id INTEGER,
    p_candidate_id INTEGER,
    p_recruiter_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    transition_allowed BOOLEAN;
    condition_required TEXT;
    condition_met BOOLEAN := true;
BEGIN
    -- Vérifier si la transition est autorisée
    SELECT is_allowed INTO transition_allowed
    FROM kanban_transitions
    WHERE from_column_id = p_from_column_id 
      AND to_column_id = p_to_column_id;
    
    -- Si pas de transition définie, refuser
    IF transition_allowed IS NULL THEN
        RETURN false;
    END IF;
    
    -- Si transition interdite, refuser
    IF NOT transition_allowed THEN
        RETURN false;
    END IF;
    
    -- Vérifier les conditions spéciales
    SELECT requires_condition INTO condition_required
    FROM kanban_transitions
    WHERE from_column_id = p_from_column_id 
      AND to_column_id = p_to_column_id;
    
    -- Si condition requise, vérifier
    IF condition_required IS NOT NULL AND condition_required = 'has_appointment' THEN
        SELECT EXISTS(
            SELECT 1 FROM appointments 
            WHERE candidate_id = p_candidate_id::INTEGER
              AND recruiter_id = p_recruiter_id::UUID
              AND appointment_date >= CURRENT_DATE
        ) INTO condition_met;
    END IF;
    
    RETURN condition_met;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS POUR MAINTENIR LA COHÉRENCE
-- ========================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables
CREATE TRIGGER update_kanban_columns_updated_at
    BEFORE UPDATE ON kanban_columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_candidate_status_updated_at
    BEFORE UPDATE ON kanban_candidate_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_transitions_updated_at
    BEFORE UPDATE ON kanban_transitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ========================================
COMMENT ON TABLE kanban_columns IS 'Configuration des colonnes du tableau Kanban';
COMMENT ON TABLE kanban_candidate_status IS 'Statut des candidats dans le Kanban par recruteur';
COMMENT ON TABLE kanban_transitions IS 'Règles de transition entre les colonnes Kanban';

COMMENT ON COLUMN kanban_columns.column_position IS 'Ordre d''affichage des colonnes';
COMMENT ON COLUMN kanban_columns.is_default IS 'Colonne par défaut pour les nouveaux candidats';
COMMENT ON COLUMN kanban_candidate_status.moved_by IS 'Utilisateur qui a effectué le dernier déplacement';
COMMENT ON COLUMN kanban_transitions.requires_condition IS 'Condition requise pour la transition (ex: has_appointment)';
