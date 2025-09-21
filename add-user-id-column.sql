-- Ajouter la colonne user_id à la table candidates
ALTER TABLE candidates 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_candidates_user_id ON candidates(user_id);

-- Optionnel : Rendre la colonne user_id unique pour éviter les doublons
-- ALTER TABLE candidates ADD CONSTRAINT unique_user_id UNIQUE(user_id);

-- Vérifier la structure mise à jour
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'candidates' 
ORDER BY ordinal_position;
