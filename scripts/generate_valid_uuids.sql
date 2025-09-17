-- Script pour générer des UUIDs valides pour les recruteurs
-- Exécutez ce script pour obtenir des UUIDs valides à utiliser dans vos données

-- Générer des UUIDs aléatoires
SELECT 
    'Recruteur 1' as recruiter_name,
    gen_random_uuid() as recruiter_uuid
UNION ALL
SELECT 
    'Recruteur 2' as recruiter_name,
    gen_random_uuid() as recruiter_uuid
UNION ALL
SELECT 
    'Recruteur 3' as recruiter_name,
    gen_random_uuid() as recruiter_uuid
UNION ALL
SELECT 
    'Recruteur 4' as recruiter_name,
    gen_random_uuid() as recruiter_uuid
UNION ALL
SELECT 
    'Recruteur 5' as recruiter_name,
    gen_random_uuid() as recruiter_uuid;

-- UUIDs fixes pour les tests (plus facile à retenir)
SELECT 
    'Test Recruteur 1' as recruiter_name,
    '550e8400-e29b-41d4-a716-446655440001'::uuid as recruiter_uuid
UNION ALL
SELECT 
    'Test Recruteur 2' as recruiter_name,
    '550e8400-e29b-41d4-a716-446655440002'::uuid as recruiter_uuid
UNION ALL
SELECT 
    'Test Recruteur 3' as recruiter_name,
    '550e8400-e29b-41d4-a716-446655440003'::uuid as recruiter_uuid
UNION ALL
SELECT 
    'Test Recruteur 4' as recruiter_name,
    '550e8400-e29b-41d4-a716-446655440004'::uuid as recruiter_uuid
UNION ALL
SELECT 
    'Test Recruteur 5' as recruiter_name,
    '550e8400-e29b-41d4-a716-446655440005'::uuid as recruiter_uuid;
