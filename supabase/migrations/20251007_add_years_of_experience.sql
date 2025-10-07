-- Ajouter la colonne years_of_experience au modèle candidates
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS years_of_experience integer;

COMMENT ON COLUMN public.candidates.years_of_experience IS 'Nombre d\'années d\'expérience du candidat';

