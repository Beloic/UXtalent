-- Migration pour créer un trigger de webhook automatique lors de la création d'utilisateurs
-- Cela garantit que les profils candidats sont créés automatiquement

-- Fonction pour créer un profil candidat automatiquement
CREATE OR REPLACE FUNCTION public.create_candidate_profile_on_signup()
RETURNS trigger AS $$
BEGIN
  -- Vérifier si l'utilisateur a le rôle 'candidate'
  IF (NEW.raw_user_meta_data->>'role') = 'candidate' THEN
    -- Insérer un nouveau profil candidat
    INSERT INTO public.candidates (
      name,
      email,
      bio,
      title,
      location,
      remote,
      skills,
      portfolio,
      linkedin,
      github,
      daily_rate,
      annual_salary,
      status
    ) VALUES (
      COALESCE(
        CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name'),
        SPLIT_PART(NEW.email, '@', 1),
        'Nouveau Candidat'
      ),
      NEW.email,
      'Profil créé automatiquement lors de l''inscription.',
      '',
      '',
      'hybrid',
      '[]'::jsonb,
      '',
      '',
      '',
      NULL,
      NULL,
      'new'
    ) ON CONFLICT (email) DO NOTHING; -- Éviter les doublons
    
    -- Logger la création
    RAISE LOG 'Profil candidat créé automatiquement pour %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_candidate_profile_on_signup();

-- Commentaires pour documentation
COMMENT ON FUNCTION public.create_candidate_profile_on_signup() IS 'Crée automatiquement un profil candidat lors de l''inscription d''un utilisateur avec le rôle candidate';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger pour créer automatiquement les profils candidats à l''inscription';
