-- Désactiver le trigger qui cause des erreurs lors de l'inscription
-- Le système d'inscription automatique fonctionne maintenant côté client

-- Supprimer le trigger problématique
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la fonction associée
DROP FUNCTION IF EXISTS public.create_candidate_profile_on_signup();

-- Log pour confirmer la suppression
DO $$
BEGIN
    RAISE LOG 'Trigger auth.users supprimé - système d''inscription automatique côté client activé';
END $$;
