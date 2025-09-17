-- Insertion de données de test pour la table applications
-- Assurez-vous que les tables candidates, jobs et recruiters existent avant d'exécuter ce script

-- Exemple de candidatures pour Loic Bernard (candidate_id = 26)
-- Remplacez les job_id et recruiter_id par des valeurs existantes dans votre base

INSERT INTO applications (
    candidate_id,
    recruiter_id,
    job_id,
    first_name,
    last_name,
    candidate_email,
    status,
    notes,
    applied_at
) VALUES 
-- Candidature de Loic Bernard pour une offre UX Designer
(
    26, -- ID de Loic Bernard dans la table candidates
    'recruiter-uuid-1', -- UUID du recruteur (remplacez par un vrai UUID)
    1, -- ID de l'offre (remplacez par un vrai job_id)
    'Loic',
    'Bernard',
    'loic.bernard@email.com',
    'pending',
    'Candidature intéressante, profil senior UX',
    NOW() - INTERVAL '2 days'
),

-- Candidature de Loic Bernard pour une autre offre
(
    26, -- ID de Loic Bernard
    'recruiter-uuid-2', -- UUID d'un autre recruteur
    2, -- ID d'une autre offre
    'Loic',
    'Bernard', 
    'loic.bernard@email.com',
    'reviewed',
    'Candidat très qualifié, entretien prévu',
    NOW() - INTERVAL '1 day'
),

-- Candidature d'un autre candidat (si vous en avez d'autres)
(
    1, -- ID d'un autre candidat (remplacez par un vrai ID)
    'recruiter-uuid-1',
    1,
    'Marie',
    'Dubois',
    'marie.dubois@email.com',
    'accepted',
    'Candidat retenu pour le poste',
    NOW() - INTERVAL '3 days'
);

-- Vérification des données insérées
SELECT 
    a.id,
    a.candidate_id,
    a.recruiter_id,
    a.job_id,
    a.first_name,
    a.last_name,
    a.candidate_email,
    a.status,
    a.notes,
    a.applied_at,
    a.reviewed_at,
    a.created_at,
    a.updated_at
FROM applications a
ORDER BY a.applied_at DESC;
