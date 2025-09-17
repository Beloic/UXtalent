-- Script pour corriger la fonction validate_kanban_transition
-- À exécuter dans la console SQL de Supabase

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS validate_kanban_transition(INTEGER, INTEGER, INTEGER, UUID);

-- Créer la nouvelle fonction corrigée
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
