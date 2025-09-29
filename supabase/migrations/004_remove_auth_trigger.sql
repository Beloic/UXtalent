-- Supprimer définitivement le trigger problématique sur auth.users
-- Ce trigger cause l'erreur "Database error saving new user" lors de l'inscription

-- Supprimer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la fonction associée
DROP FUNCTION IF EXISTS public.create_candidate_profile_on_signup();

-- Log pour confirmer la suppression
DO $$
BEGIN
    RAISE LOG 'Trigger auth.users supprimé définitivement - système d''inscription côté client activé';
END $$;
