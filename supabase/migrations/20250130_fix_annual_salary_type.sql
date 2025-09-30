-- Migration pour corriger le type de la colonne annual_salary
-- Date: 2025-01-30
-- Description: Changement du type de annual_salary de INTEGER vers VARCHAR pour supporter les fourchettes de salaire

-- Changer le type de la colonne annual_salary de INTEGER vers VARCHAR
ALTER TABLE candidates 
ALTER COLUMN annual_salary TYPE VARCHAR(50);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN candidates.annual_salary IS 'Fourchette de salaire annuel (ex: 50k-60k€) ou montant numérique';

-- Mettre à jour les valeurs existantes qui sont des entiers vers des fourchettes
UPDATE candidates 
SET annual_salary = CASE 
  WHEN annual_salary IS NULL THEN NULL
  WHEN annual_salary::text ~ '^[0-9]+$' THEN 
    CASE 
      WHEN annual_salary::integer <= 40000 THEN '30k-40k€'
      WHEN annual_salary::integer <= 45000 THEN '35k-45k€'
      WHEN annual_salary::integer <= 50000 THEN '40k-50k€'
      WHEN annual_salary::integer <= 55000 THEN '45k-55k€'
      WHEN annual_salary::integer <= 60000 THEN '50k-60k€'
      WHEN annual_salary::integer <= 65000 THEN '55k-65k€'
      WHEN annual_salary::integer <= 70000 THEN '60k-70k€'
      WHEN annual_salary::integer <= 75000 THEN '65k-75k€'
      WHEN annual_salary::integer <= 80000 THEN '70k-80k€'
      WHEN annual_salary::integer <= 85000 THEN '75k-85k€'
      WHEN annual_salary::integer <= 90000 THEN '80k-90k€'
      WHEN annual_salary::integer <= 95000 THEN '85k-95k€'
      WHEN annual_salary::integer <= 100000 THEN '90k-100k€'
      WHEN annual_salary::integer <= 110000 THEN '95k-110k€'
      WHEN annual_salary::integer <= 120000 THEN '100k-120k€'
      WHEN annual_salary::integer <= 130000 THEN '110k-130k€'
      WHEN annual_salary::integer <= 140000 THEN '120k-140k€'
      WHEN annual_salary::integer <= 150000 THEN '130k-150k€'
      WHEN annual_salary::integer <= 160000 THEN '140k-160k€'
      ELSE '150k+€'
    END
  ELSE annual_salary::text
END
WHERE annual_salary IS NOT NULL;
