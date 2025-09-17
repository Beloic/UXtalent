-- Script pour insérer des données de test dans toutes les tables
-- Exécutez ce script après avoir créé les tables avec create_all_tables.sql

-- ========================================
-- DONNÉES DE TEST CANDIDATES
-- ========================================

-- Insérer Loic Bernard (ID 26)
INSERT INTO candidates (
    id, name, email, title, location, remote, experience, bio, skills, 
    portfolio, linkedin, availability, daily_rate, annual_salary, 
    visible, approved, plan_type
) VALUES (
    26,
    'Loic Bernard',
    'loic.bernard@email.com',
    'Senior UX Designer',
    'Paris, France',
    'hybrid',
    'Senior',
    'UX Designer avec 8 ans d''expérience dans le design d''interfaces utilisateur. Passionné par la recherche utilisateur et la création d''expériences digitales intuitives. Expert en design systems et en prototypage.',
    ARRAY['Figma', 'Research', 'Prototyping', 'User Testing', 'Design Systems', 'Sketch', 'Adobe XD', 'InVision'],
    'https://loicbernard.design',
    'https://linkedin.com/in/loicbernard',
    'available',
    600,
    75000,
    true,
    true,
    'premium'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    title = EXCLUDED.title,
    location = EXCLUDED.location,
    bio = EXCLUDED.bio,
    skills = EXCLUDED.skills,
    daily_rate = EXCLUDED.daily_rate,
    annual_salary = EXCLUDED.annual_salary,
    updated_at = NOW();

-- Insérer d'autres candidats de test
INSERT INTO candidates (
    name, email, title, location, remote, experience, bio, skills, 
    portfolio, linkedin, availability, daily_rate, annual_salary, 
    visible, approved, plan_type
) VALUES 
(
    'Marie Dubois',
    'marie.dubois@email.com',
    'UX Designer',
    'Lyon, France',
    'remote',
    'Mid',
    'UX Designer avec 4 ans d''expérience. Spécialisée dans la recherche utilisateur et le design d''interfaces.',
    ARRAY['Figma', 'Research', 'Prototyping', 'User Testing'],
    'https://mariedubois.design',
    'https://linkedin.com/in/mariedubois',
    'available',
    450,
    55000,
    true,
    true,
    'free'
),
(
    'Thomas Martin',
    'thomas.martin@email.com',
    'Product Designer',
    'Marseille, France',
    'hybrid',
    'Senior',
    'Product Designer avec 6 ans d''expérience. Expert en design de produits digitaux et en stratégie UX.',
    ARRAY['Figma', 'Sketch', 'Principle', 'Design Systems', 'Strategy'],
    'https://thomasmartin.design',
    'https://linkedin.com/in/thomasmartin',
    'available',
    550,
    70000,
    true,
    true,
    'premium'
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- DONNÉES DE TEST JOBS
-- ========================================

-- Insérer des offres d'emploi de test
INSERT INTO jobs (
    title, company, location, remote, type, seniority, description, 
    requirements, benefits, tags, salary, recruiter_id, status
) VALUES 
(
    'UX Designer Senior',
    'TechCorp',
    'Paris, France',
    'hybrid',
    'CDI',
    'Senior',
    'Nous recherchons un UX Designer Senior pour rejoindre notre équipe produit. Vous serez responsable de la conception d''interfaces utilisateur innovantes et de la conduite de recherches utilisateur.',
    'Minimum 5 ans d''expérience en UX Design, Maîtrise de Figma, Expérience en recherche utilisateur, Connaissance des méthodologies agiles',
    'Télétravail flexible, Mutuelle, Tickets restaurant, Équipe jeune et dynamique',
    ARRAY['UX Design', 'Research', 'Figma', 'Senior'],
    '55-70k€',
    'recruiter-uuid-1',
    'active'
),
(
    'Product Designer',
    'StartupXYZ',
    'Lyon, France',
    'remote',
    'CDI',
    'Mid',
    'Rejoignez notre équipe produit en tant que Product Designer. Vous participerez à la conception de notre plateforme SaaS et travaillerez en étroite collaboration avec les développeurs.',
    '3-5 ans d''expérience, Maîtrise de Figma et Sketch, Expérience en design de produits digitaux, Bonne communication',
    '100% remote, Équity, Formation continue, Matériel fourni',
    ARRAY['Product Design', 'SaaS', 'Remote', 'Mid'],
    '45-60k€',
    'recruiter-uuid-2',
    'active'
),
(
    'UX Researcher',
    'DesignStudio',
    'Marseille, France',
    'hybrid',
    'CDI',
    'Mid',
    'Nous cherchons un UX Researcher pour mener des études utilisateur et améliorer l''expérience de nos produits. Vous travaillerez sur des projets variés avec des clients internationaux.',
    'Formation en psychologie cognitive ou UX, Expérience en recherche qualitative et quantitative, Maîtrise des outils de recherche',
    'Télétravail 3j/semaine, Projets internationaux, Formation UX',
    ARRAY['UX Research', 'Psychology', 'International', 'Mid'],
    '40-55k€',
    'recruiter-uuid-3',
    'active'
) ON CONFLICT DO NOTHING;

-- ========================================
-- DONNÉES DE TEST APPLICATIONS
-- ========================================

-- Insérer des candidatures de test
INSERT INTO applications (
    candidate_id, recruiter_id, job_id, first_name, last_name, 
    candidate_email, status, notes, applied_at
) VALUES 
-- Candidature de Loic Bernard pour l'offre UX Designer Senior
(
    26,
    'recruiter-uuid-1',
    1, -- ID de la première offre
    'Loic',
    'Bernard',
    'loic.bernard@email.com',
    'pending',
    'Profil très intéressant, expérience senior confirmée',
    NOW() - INTERVAL '2 days'
),
-- Candidature de Loic Bernard pour l'offre Product Designer
(
    26,
    'recruiter-uuid-2',
    2, -- ID de la deuxième offre
    'Loic',
    'Bernard',
    'loic.bernard@email.com',
    'reviewed',
    'Candidat qualifié, entretien prévu la semaine prochaine',
    NOW() - INTERVAL '1 day'
),
-- Candidature de Marie Dubois pour l'offre UX Designer Senior
(
    (SELECT id FROM candidates WHERE email = 'marie.dubois@email.com'),
    'recruiter-uuid-1',
    1,
    'Marie',
    'Dubois',
    'marie.dubois@email.com',
    'accepted',
    'Candidat retenu pour le poste',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (candidate_id, job_id) DO NOTHING;

-- ========================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ========================================

-- Vérifier les candidats
SELECT 
    'CANDIDATES' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN approved = true THEN 1 END) as approved_count
FROM candidates;

-- Vérifier les offres
SELECT 
    'JOBS' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM jobs;

-- Vérifier les candidatures
SELECT 
    'APPLICATIONS' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_count,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count
FROM applications;

-- Voir les candidatures avec détails
SELECT 
    a.id as application_id,
    a.first_name,
    a.last_name,
    a.candidate_email,
    a.status,
    a.applied_at,
    c.name as candidate_name,
    c.title as candidate_title,
    j.title as job_title,
    j.company as job_company
FROM applications a
LEFT JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN jobs j ON a.job_id = j.id
ORDER BY a.applied_at DESC;
