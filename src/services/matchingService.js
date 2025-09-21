/**
 * Service de Matching Intelligent
 * Algorithme de scoring de compatibilité entre candidats et offres
 */

// ===== CONFIGURATION DES POIDS =====
const SCORING_WEIGHTS = {
  SKILLS: 0.35,        // 35% - Compétences techniques
  EXPERIENCE: 0.25,     // 25% - Niveau d'expérience (augmenté)
  LOCATION: 0.15,       // 15% - Localisation et remote
  SALARY: 0.15,         // 15% - Rémunération
  AVAILABILITY: 0.05,  // 5% - Disponibilité (réduit)
  PLAN: 0.05           // 5% - Plan premium (remis pour avantage premium)
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
 * Score des compétences (40% du score total)
 * Compare les compétences du candidat avec les tags requis de l'offre
 * Algorithme amélioré pour plus de différenciation
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

  // Calculer l'intersection exacte
  const exactMatches = normalizedJobTags.filter(tag => 
    normalizedCandidateSkills.includes(tag)
  );

  // Calculer les correspondances partielles (mots-clés dans les compétences)
  const partialMatches = normalizedJobTags.filter(tag => 
    normalizedCandidateSkills.some(skill => 
      skill.includes(tag) || tag.includes(skill)
    )
  );

  // Score de base : correspondances exactes (70% du score)
  const exactMatchRatio = exactMatches.length / normalizedJobTags.length;
  
  // Score bonus : correspondances partielles (20% du score)
  const partialMatchRatio = (partialMatches.length - exactMatches.length) / normalizedJobTags.length;
  
  // Bonus pour compétences supplémentaires (10% du score)
  const extraSkills = normalizedCandidateSkills.length - normalizedJobTags.length;
  const bonusRatio = Math.min(0.1, extraSkills / Math.max(normalizedJobTags.length, 1));
  
  // Score final avec pondération
  const finalScore = (exactMatchRatio * 0.7) + (partialMatchRatio * 0.2) + bonusRatio;
  
  return Math.min(1, finalScore);
}

/**
 * Score d'expérience (25% du score total)
 * Compare le niveau d'expérience du candidat avec celui requis
 * Algorithme amélioré pour plus de différenciation
 */
function calculateExperienceScore(candidateExperience, jobSeniority) {
  const candidateLevel = EXPERIENCE_LEVELS[candidateExperience] || 0;
  const jobLevel = EXPERIENCE_LEVELS[jobSeniority] || 0;

  if (candidateLevel === 0 || jobLevel === 0) {
    return 0.3; // Score plus bas si données manquantes
  }

  // Score optimal si expérience exacte
  if (candidateLevel === jobLevel) {
    return 1.0;
  }

  // Score réduit si sous-qualifié (plus pénalisant)
  if (candidateLevel < jobLevel) {
    const gap = jobLevel - candidateLevel;
    if (gap === 1) {
      return 0.7; // Junior pour poste Mid
    } else if (gap === 2) {
      return 0.4; // Junior pour poste Senior
    } else {
      return 0.1; // Gap trop important
    }
  }

  // Score réduit si sur-qualifié (moins pénalisant mais différencié)
  if (candidateLevel > jobLevel) {
    const gap = candidateLevel - jobLevel;
    if (gap === 1) {
      return 0.9; // Senior pour poste Mid
    } else if (gap === 2) {
      return 0.8; // Lead pour poste Mid
    } else {
      return 0.7; // Sur-qualification importante
    }
  }

  return 0.5;
}

/**
 * Score de localisation (15% du score total)
 * Compare la localisation et les préférences de travail à distance
 * Algorithme amélioré pour plus de précision
 */
function calculateLocationScore(candidateLocation, candidateRemote, jobLocation, jobRemote) {
  let score = 0;

  // Score basé sur la compatibilité des préférences remote (60% du score localisation)
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

  // Score basé sur la localisation géographique (40% du score localisation)
  if (candidateLocation && jobLocation) {
    const candidateCity = extractCity(candidateLocation);
    const jobCity = extractCity(jobLocation);
    
    if (candidateCity === jobCity) {
      score += 0.4; // Même ville = score parfait
    } else if (isSameRegion(candidateCity, jobCity)) {
      score += 0.2; // Même région
    } else if (isSameCountry(candidateCity, jobCity)) {
      score += 0.1; // Même pays
    }
    // Sinon score = 0 pour la partie géographique
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
 * Bonus pour les candidats premium/pro - Pro plus important que Premium
 */
function calculatePlanScore(planType, isFeatured) {
  // Candidat featured = score maximum
  if (isFeatured) return 1.0;
  
  switch (planType) {
    case 'pro':
      return 1.0; // Score maximum pour Pro
    case 'premium':
      return 0.7; // Score élevé pour Premium
    case 'free':
    default:
      return 0.3; // Score plus bas pour Free
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
 * Filtrage strict par région géographique française
 */
function isSameRegion(city1, city2) {
  // Si les villes sont identiques, elles sont dans la même région
  if (city1 === city2) {
    return true;
  }

  const regions = {
    'ile-de-france': ['paris', 'versailles', 'boulogne-billancourt', 'saint-denis', 'créteil', 'nanterre', 'argenteuil', 'montreuil', 'aubervilliers', 'asnières-sur-seine', 'colombes', 'courbevoie', 'rueil-malmaison', 'levallois-perret', 'neuilly-sur-seine', 'clichy', 'pantin', 'issy-les-moulineaux', 'antony', 'sèvres', 'meudon', 'fontenay-aux-roses', 'melun', 'evry', 'corbeil-essonnes', 'palaiseau', 'massy', 'saint-germain-en-laye', 'mantes-la-jolie', 'rambouillet', 'poissy', 'sartrouville', 'conflans-sainte-honorine', 'houilles', 'carrières-sur-seine', 'bezons', 'herblay', 'taverny', 'montmorency', 'sannois', 'ermont', 'franconville', 'cergy', 'pontoise', 'saint-ouen-l\'aumône', 'osny', 'menucourt', 'vaudherland', 'domont', 'bouffémont', 'saint-prix', 'bessancourt', 'frépillon', 'mériel', 'méry-sur-oise', 'nerville-la-forêt', 'presles', 'saint-leu-la-forêt', 'chauvry', 'margency', 'andilly', 'montlignon', 'saint-gratien', 'soisy-sous-montmorency', 'deuil-la-barre', 'groslay', 'sarcelles', 'garges-lès-gonesse', 'villiers-le-bel', 'arneville', 'gonesse', 'bonneuil-en-france', 'roissy-en-france', 'le-bourget', 'drancy', 'aulnay-sous-bois', 'le-raincy', 'livry-gargan', 'sevran', 'villetaneuse', 'epinay-sur-seine', 'saint-ouen', 'l\'ile-saint-denis', 'stains', 'pierrefitte-sur-seine'],
    'auvergne-rhone-alpes': ['lyon', 'villeurbanne', 'vénissieux', 'saint-priest', 'bron', 'vaulx-en-velin', 'caluire-et-cuire', 'décines-charpieu', 'meyzieu', 'oullins', 'saint-fons', 'tassin-la-demi-lune', 'écully', 'charbonnières-les-bains', 'francheville', 'sainte-foy-lès-lyon', 'la-mulatière', 'saint-genis-laval', 'saint-genis-les-ollières', 'chassieu', 'genas', 'mions', 'corbas', 'solaize', 'feyzin', 'saint-symphorien-d\'ozon', 'grigny', 'irigny', 'vernaison', 'millery', 'montagny', 'charly', 'saint-pierre-de-chandieu', 'toussieu', 'marennes', 'saint-laurent-de-mure', 'tignieu-jameyzieu', 'janieu', 'chamagnieu', 'diémoz', 'heyrieux', 'grenoble', 'saint-étienne', 'clermont-ferrand', 'annecy', 'valence', 'chambéry', 'bourges', 'orléans', 'chartres'],
    'provence-alpes-cote-azur': ['marseille', 'aix-en-provence', 'aubagne', 'cassis', 'la-ciotat', 'marignane', 'vitrolles', 'les-pennes-mirabeau', 'plan-de-cuques', 'allauh', 'septèmes-les-vallons', 'gignac-la-nerthe', 'nice', 'cannes', 'antibes', 'grasse', 'menton', 'monaco', 'monte-carlo', 'cap-d\'ail', 'beaulieu-sur-mer', 'saint-jean-cap-ferrat', 'villefranche-sur-mer', 'eze', 'la-turbie', 'peille', 'lucéram', 'contes', 'berre-les-alpes', 'aspremont', 'carros', 'gattières', 'le-broc', 'saint-jeannet', 'vence', 'saint-paul-de-vence', 'tourrettes-sur-loup', 'le-rouret', 'valbonne', 'mougins', 'le-cannet', 'vallauris', 'golfe-juan', 'juan-les-pins', 'biot', 'toulon'],
    'occitanie': ['toulouse', 'colomiers', 'tournefeuille', 'blagnac', 'muret', 'ramonville-saint-agne', 'auzeville-tolosane', 'castanet-tolosan', 'escouloubre', 'l\'union', 'saint-jean', 'balma', 'montpellier', 'lattes', 'castelnau-le-lez', 'le-cres', 'jacou', 'clapiers', 'grabels', 'saint-jean-de-vedas', 'lavérune', 'villeneuve-lès-maguelone', 'fabrègues', 'pignan', 'saint-georges-d\'orques', 'murviel-lès-montpellier', 'saint-jean-de-cuculles', 'saint-bauzille-de-montmel', 'saint-gély-du-fesc', 'combaillaux', 'saint-hilaire-de-beauvoir', 'saint-jean-de-cornies', 'saint-mathieu-de-tréviers', 'saint-vincent-de-barbeyrargues', 'saturargues', 'saussan', 'saussines', 'sauteyrargues', 'sauve', 'sauviac', 'savignargues', 'sérignan', 'sérignan-du-comtat', 'sérignan-le-comtat', 'perpignan', 'nîmes'],
    'pays-de-la-loire': ['nantes', 'saint-nazaire', 'saint-herblain', 'reze', 'orvault', 'vertou', 'couëron', 'bouguenais', 'carquefou', 'saint-sebastien-sur-loire', 'la-chapelle-sur-erdre', 'treillieres', 'sucé-sur-erdre', 'thouaré-sur-loire', 'sainte-luce-sur-loire', 'saint-julien-de-concelles', 'haute-goulaine', 'le-loroux-bottereau', 'la-regrippiere', 'vallet', 'le-landreau', 'la-chapelle-heulin', 'le-palais', 'saint-fiacre-sur-maine', 'maisdon-sur-sevre', 'aigrefeuille-sur-maine', 'remouillé', 'vieillevigne', 'saint-philbert-de-grand-lieu', 'bouaye', 'brains', 'indre', 'le-pellerin', 'cheix-en-retz', 'porte-saint-père', 'rouans', 'saint-mars-de-coutais', 'saint-léger-les-vignes', 'saint-aignan-grandlieu', 'le-mans', 'angers', 'tours'],
    'grand-est': ['strasbourg', 'schiltigheim', 'bischheim', 'hoenheim', 'oberhausbergen', 'obernai', 'sélestat', 'colmar', 'mulhouse', 'saint-louis', 'huningue', 'reims', 'metz', 'nancy', 'troyes', 'chalons-en-champagne'],
    'nouvelle-aquitaine': ['bordeaux', 'mérignac', 'pessac', 'talence', 'villenave-d\'ornon', 'bègles', 'gradignan', 'le-bouscat', 'cestas', 'eysines', 'bruges', 'le-haillan', 'limoges', 'poitiers', 'la-rochelle', 'pau', 'bayonne'],
    'hauts-de-france': ['lille', 'roubaix', 'tourcoing', 'villeneuve-d\'ascq', 'dunkerque', 'calais', 'boulogne-sur-mer', 'amiens', 'beauvais', 'compiegne'],
    'bretagne': ['rennes', 'brest', 'quimper', 'lorient', 'vannes', 'saint-brieuc', 'saint-malo'],
    'normandie': ['rouen', 'caen', 'le-havre', 'cherbourg', 'evreux', 'alençon'],
    'centre-val-de-loire': ['orléans', 'tours', 'bourges', 'chartres', 'blois', 'châteauroux'],
    'bourgogne-franche-comte': ['dijon', 'besançon', 'mâcon', 'auxerre', 'nevers'],
    'corse': ['ajaccio', 'bastia', 'porto-vecchio', 'calvi']
  };

  // Recherche dans quelle région se trouve chaque ville
  let region1 = null;
  let region2 = null;

  for (const [region, cities] of Object.entries(regions)) {
    if (cities.includes(city1)) {
      region1 = region;
    }
    if (cities.includes(city2)) {
      region2 = region;
    }
  }

  // Retourne true seulement si les deux villes sont dans la même région
  return region1 !== null && region2 !== null && region1 === region2;
}

/**
 * Vérifie si deux villes sont dans le même pays
 */
function isSameCountry(city1, city2) {
  const frenchCities = [
    'paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'montpellier',
    'strasbourg', 'bordeaux', 'lille', 'rennes', 'reims', 'saint-étienne',
    'le havre', 'toulon', 'grenoble', 'dijon', 'angers', 'nîmes', 'villeurbanne',
    'saint-denis', 'le mans', 'aix-en-provence', 'clermont-ferrand', 'brest',
    'tours', 'limoges', 'amiens', 'annecy', 'perpignan', 'boulogne-billancourt',
    'orléans', 'mulhouse', 'rouen', 'caen', 'besançon', 'metz', 'dunkerque',
    'saint-pierre', 'fort-de-france', 'cayenne', 'saint-denis', 'saint-paul'
  ];
  
  return frenchCities.includes(city1) && frenchCities.includes(city2);
}

/**
 * Vérifie si un candidat est géographiquement compatible avec une offre
 * Logique stricte pour éviter les suggestions inappropriées
 */
function isGeographicallyCompatible(candidateLocation, candidateRemote, jobLocation, jobRemote) {
  // Si l'offre est 100% remote, tous les candidats sont compatibles
  if (jobRemote === 'remote') {
    return true;
  }
  
  // Si le candidat accepte le remote et l'offre est hybrid/remote, c'est compatible
  if (candidateRemote === 'remote' && (jobRemote === 'hybrid' || jobRemote === 'remote')) {
    return true;
  }
  
  // Si l'offre est onsite ou hybrid, vérifier la proximité géographique STRICTEMENT
  if (jobRemote === 'onsite' || jobRemote === 'hybrid') {
    if (!candidateLocation || !jobLocation) {
      return false; // Données manquantes = incompatible
    }
    
    const candidateCity = extractCity(candidateLocation);
    const jobCity = extractCity(jobLocation);
    
    // Même ville = toujours compatible
    if (candidateCity === jobCity) {
      return true;
    }
    
    // Pour les offres onsite : SEULEMENT même ville acceptée
    if (jobRemote === 'onsite') {
      return false; // Pas de flexibilité pour les offres onsite
    }
    
    // Pour les offres hybrid : même région acceptée
    if (jobRemote === 'hybrid') {
      return isSameRegion(candidateCity, jobCity);
    }
    
    // Villes très éloignées = incompatible
    return false;
  }
  
  // Par défaut, considérer comme incompatible
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
    .filter(candidate => candidate.status === 'approved')
    .filter(candidate => {
      // Filtrage géographique strict : rejeter les candidats géographiquement incompatibles
      return isGeographicallyCompatible(candidate.location, candidate.remote, job.location, job.remote);
    })
    .map(candidate => {
      const compatibilityScore = calculateCompatibilityScore(candidate, job);
      
      // Bonus pour les plans premium/pro
      let planBonus = 0;
      if (candidate.planType === 'pro') {
        planBonus = 0.2; // +20% pour Pro
      } else if (candidate.planType === 'premium') {
        planBonus = 0.1; // +10% pour Premium
      }
      
      return {
        candidate,
        ...compatibilityScore,
        globalScore: compatibilityScore.globalScore + planBonus
      };
    })
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
