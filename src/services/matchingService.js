/**
 * Service de Matching Intelligent
 * Algorithme de scoring de compatibilité entre candidats et offres
 */

// ===== CONFIGURATION DES POIDS =====
const SCORING_WEIGHTS = {
  SKILLS: 0.35,        // 35% - Compétences techniques
  EXPERIENCE: 0.20,     // 20% - Niveau d'expérience
  LOCATION: 0.15,       // 15% - Localisation et remote
  SALARY: 0.15,         // 15% - Rémunération
  AVAILABILITY: 0.10,  // 10% - Disponibilité
  PLAN: 0.05           // 5% - Plan premium (bonus visibilité)
};

// ===== NIVEAUX D'EXPÉRIENCE =====
const EXPERIENCE_LEVELS = {
  'Junior': 1,
  'Mid': 2,
  'Senior': 3,
  'Lead': 4
};

// ===== TYPES DE TRAVAIL =====
const REMOTE_TYPES = {
  'onsite': 1,
  'hybrid': 2,
  'remote': 3
};

/**
 * Calcule le score de compatibilité entre un candidat et une offre
 * @param {Object} candidate - Données du candidat
 * @param {Object} job - Données de l'offre
 * @returns {Object} - Score détaillé et score global
 */
export function calculateCompatibilityScore(candidate, job) {
  const scores = {
    skills: calculateSkillsScore(candidate.skills, job.tags),
    experience: calculateExperienceScore(candidate.experience, job.seniority),
    location: calculateLocationScore(candidate.location, candidate.remote, job.location, job.remote),
    salary: calculateSalaryScore(candidate.salary, candidate.annualSalary, job.salary),
    availability: calculateAvailabilityScore(candidate.availability),
    plan: calculatePlanScore(candidate.planType, candidate.isFeatured)
  };

  // Calcul du score global pondéré
  const globalScore = Object.entries(scores).reduce((total, [key, score]) => {
    const weight = SCORING_WEIGHTS[key.toUpperCase()];
    return total + (score * weight);
  }, 0);

  return {
    globalScore: Math.round(globalScore * 100) / 100, // Arrondi à 2 décimales
    scores,
    weights: SCORING_WEIGHTS,
    matchLevel: getMatchLevel(globalScore)
  };
}

/**
 * Score des compétences (35% du score total)
 * Compare les compétences du candidat avec les tags requis de l'offre
 */
function calculateSkillsScore(candidateSkills, jobTags) {
  if (!candidateSkills || !jobTags || candidateSkills.length === 0 || jobTags.length === 0) {
    return 0;
  }

  // Normaliser les compétences (minuscules, sans espaces)
  const normalizedCandidateSkills = candidateSkills.map(skill => 
    skill.toLowerCase().trim()
  );
  const normalizedJobTags = jobTags.map(tag => 
    tag.toLowerCase().trim()
  );

  // Calculer l'intersection
  const matchingSkills = normalizedJobTags.filter(tag => 
    normalizedCandidateSkills.includes(tag)
  );

  // Score basé sur le pourcentage de compétences requises possédées
  const matchRatio = matchingSkills.length / normalizedJobTags.length;
  
  // Bonus si le candidat a plus de compétences que requises
  const bonusRatio = Math.min(0.2, (normalizedCandidateSkills.length - normalizedJobTags.length) / normalizedJobTags.length);
  
  return Math.min(1, matchRatio + bonusRatio);
}

/**
 * Score d'expérience (20% du score total)
 * Compare le niveau d'expérience du candidat avec celui requis
 */
function calculateExperienceScore(candidateExperience, jobSeniority) {
  const candidateLevel = EXPERIENCE_LEVELS[candidateExperience] || 0;
  const jobLevel = EXPERIENCE_LEVELS[jobSeniority] || 0;

  if (candidateLevel === 0 || jobLevel === 0) {
    return 0.5; // Score neutre si données manquantes
  }

  // Score optimal si expérience exacte
  if (candidateLevel === jobLevel) {
    return 1.0;
  }

  // Score réduit si sous-qualifié
  if (candidateLevel < jobLevel) {
    const gap = jobLevel - candidateLevel;
    return Math.max(0.2, 1 - (gap * 0.3));
  }

  // Score réduit si sur-qualifié (mais moins pénalisant)
  if (candidateLevel > jobLevel) {
    const gap = candidateLevel - jobLevel;
    return Math.max(0.6, 1 - (gap * 0.15));
  }

  return 0.5;
}

/**
 * Score de localisation (15% du score total)
 * Compare la localisation et les préférences de travail à distance
 */
function calculateLocationScore(candidateLocation, candidateRemote, jobLocation, jobRemote) {
  let score = 0;

  // Score basé sur la compatibilité des préférences remote
  const candidateRemoteType = REMOTE_TYPES[candidateRemote] || 1;
  const jobRemoteType = REMOTE_TYPES[jobRemote] || 1;

  if (candidateRemoteType === jobRemoteType) {
    score += 0.6; // Correspondance exacte
  } else if (candidateRemoteType === 3 && jobRemoteType !== 3) {
    // Candidat remote peut faire onsite/hybrid
    score += 0.4;
  } else if (candidateRemoteType === 2 && jobRemoteType === 1) {
    // Candidat hybrid peut faire onsite
    score += 0.3;
  } else {
    score += 0.1; // Incompatibilité
  }

  // Score basé sur la localisation géographique
  if (candidateLocation && jobLocation) {
    const candidateCity = extractCity(candidateLocation);
    const jobCity = extractCity(jobLocation);
    
    if (candidateCity === jobCity) {
      score += 0.4; // Même ville
    } else if (isSameRegion(candidateCity, jobCity)) {
      score += 0.2; // Même région
    }
  }

  return Math.min(1, score);
}

/**
 * Score de rémunération (15% du score total)
 * Compare les attentes salariales du candidat avec l'offre
 */
function calculateSalaryScore(candidateSalaryRange, candidateAnnualSalary, jobSalary) {
  if (!jobSalary || (!candidateSalaryRange && !candidateAnnualSalary)) {
    return 0.5; // Score neutre si données manquantes
  }

  // Extraire les fourchettes salariales
  const candidateMin = extractSalaryMin(candidateSalaryRange, candidateAnnualSalary);
  const candidateMax = extractSalaryMax(candidateSalaryRange, candidateAnnualSalary);
  const jobMin = extractSalaryMin(jobSalary);
  const jobMax = extractSalaryMax(jobSalary);

  if (!candidateMin || !candidateMax || !jobMin || !jobMax) {
    return 0.5;
  }

  // Score optimal si les fourchettes se chevauchent
  if (candidateMin <= jobMax && candidateMax >= jobMin) {
    const overlap = Math.min(candidateMax, jobMax) - Math.max(candidateMin, jobMin);
    const totalRange = Math.max(candidateMax, jobMax) - Math.min(candidateMin, jobMin);
    return overlap / totalRange;
  }

  // Score réduit si pas de chevauchement
  const gap = Math.min(Math.abs(candidateMin - jobMax), Math.abs(candidateMax - jobMin));
  const avgSalary = (candidateMin + candidateMax + jobMin + jobMax) / 4;
  const gapRatio = gap / avgSalary;
  
  return Math.max(0.1, 1 - gapRatio);
}

/**
 * Score de disponibilité (10% du score total)
 */
function calculateAvailabilityScore(candidateAvailability) {
  switch (candidateAvailability) {
    case 'available':
      return 1.0;
    case 'busy':
      return 0.3;
    case 'unavailable':
      return 0.0;
    default:
      return 0.5;
  }
}

/**
 * Score du plan (5% du score total)
 * Bonus pour les candidats premium/pro
 */
function calculatePlanScore(planType, isFeatured) {
  if (isFeatured) return 1.0;
  
  switch (planType) {
    case 'pro':
      return 0.8;
    case 'premium':
      return 0.6;
    case 'free':
    default:
      return 0.4;
  }
}

/**
 * Détermine le niveau de match basé sur le score global
 */
function getMatchLevel(score) {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.8) return 'très bon';
  if (score >= 0.7) return 'bon';
  if (score >= 0.6) return 'correct';
  if (score >= 0.5) return 'moyen';
  return 'faible';
}

// ===== FONCTIONS UTILITAIRES =====

/**
 * Extrait le nom de la ville d'une localisation
 */
function extractCity(location) {
  if (!location) return '';
  return location.split(',')[0].trim().toLowerCase();
}

/**
 * Vérifie si deux villes sont dans la même région
 */
function isSameRegion(city1, city2) {
  const regions = {
    'paris': ['paris', 'versailles', 'boulogne-billancourt', 'saint-denis'],
    'lyon': ['lyon', 'villeurbanne', 'vénissieux'],
    'marseille': ['marseille', 'aix-en-provence'],
    'toulouse': ['toulouse'],
    'nice': ['nice', 'cannes'],
    'nantes': ['nantes'],
    'montpellier': ['montpellier'],
    'strasbourg': ['strasbourg'],
    'bordeaux': ['bordeaux']
  };

  for (const [region, cities] of Object.entries(regions)) {
    if (cities.includes(city1) && cities.includes(city2)) {
      return true;
    }
  }
  return false;
}

/**
 * Extrait le salaire minimum d'une fourchette
 */
function extractSalaryMin(salaryRange, annualSalary) {
  if (annualSalary) {
    return parseInt(annualSalary);
  }
  
  if (!salaryRange) return null;
  
  const match = salaryRange.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extrait le salaire maximum d'une fourchette
 */
function extractSalaryMax(salaryRange, annualSalary) {
  if (annualSalary) {
    return parseInt(annualSalary);
  }
  
  if (!salaryRange) return null;
  
  const matches = salaryRange.match(/(\d+).*?(\d+)/);
  if (matches && matches.length >= 3) {
    return parseInt(matches[2]);
  }
  
  const singleMatch = salaryRange.match(/(\d+)/);
  return singleMatch ? parseInt(singleMatch[1]) : null;
}

/**
 * Trouve les meilleurs candidats pour une offre
 * @param {Array} candidates - Liste des candidats
 * @param {Object} job - Offre d'emploi
 * @param {number} limit - Nombre maximum de résultats
 * @returns {Array} - Candidats triés par score de compatibilité
 */
export function findBestCandidatesForJob(candidates, job, limit = 10) {
  const candidatesWithScores = candidates
    .filter(candidate => candidate.approved && candidate.visible)
    .map(candidate => ({
      candidate,
      ...calculateCompatibilityScore(candidate, job)
    }))
    .filter(result => result.globalScore >= 0.3) // Seuil minimum de compatibilité
    .sort((a, b) => b.globalScore - a.globalScore);

  return candidatesWithScores.slice(0, limit);
}

/**
 * Trouve les meilleures offres pour un candidat
 * @param {Array} jobs - Liste des offres
 * @param {Object} candidate - Candidat
 * @param {number} limit - Nombre maximum de résultats
 * @returns {Array} - Offres triées par score de compatibilité
 */
export function findBestJobsForCandidate(jobs, candidate, limit = 10) {
  const jobsWithScores = jobs
    .filter(job => job.status === 'active')
    .map(job => ({
      job,
      ...calculateCompatibilityScore(candidate, job)
    }))
    .filter(result => result.globalScore >= 0.3) // Seuil minimum de compatibilité
    .sort((a, b) => b.globalScore - a.globalScore);

  return jobsWithScores.slice(0, limit);
}

/**
 * Calcule les statistiques de matching pour un ensemble de données
 * @param {Array} candidates - Liste des candidats
 * @param {Array} jobs - Liste des offres
 * @returns {Object} - Statistiques de compatibilité
 */
export function calculateMatchingStats(candidates, jobs) {
  const allScores = [];
  
  candidates.forEach(candidate => {
    jobs.forEach(job => {
      const score = calculateCompatibilityScore(candidate, job);
      allScores.push(score.globalScore);
    });
  });

  const validScores = allScores.filter(score => score > 0);
  
  return {
    totalMatches: validScores.length,
    averageScore: validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0,
    highQualityMatches: validScores.filter(score => score >= 0.8).length,
    mediumQualityMatches: validScores.filter(score => score >= 0.6 && score < 0.8).length,
    lowQualityMatches: validScores.filter(score => score < 0.6).length
  };
}
