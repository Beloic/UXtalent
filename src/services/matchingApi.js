/**
 * API de Matching Intelligent
 * Endpoints pour le système de recommandations
 */

import { 
  calculateCompatibilityScore, 
  findBestCandidatesForJob, 
  findBestJobsForCandidate,
  calculateMatchingStats 
} from './matchingService.js';
import { loadCandidates } from '../database/supabaseClient.js';
import { loadJobs } from '../database/jobsDatabase.js';

// ===== CACHE POUR LES PERFORMANCES =====
let candidatesCache = null;
let jobsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Met à jour le cache des données
 */
async function updateCache() {
  const now = Date.now();
  
  if (!cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
    try {
      console.log('🔄 Mise à jour du cache de matching...');
      candidatesCache = await loadCandidates();
      jobsCache = await loadJobs();
      cacheTimestamp = now;
      console.log(`✅ Cache mis à jour: ${candidatesCache.length} candidats, ${jobsCache.length} offres`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du cache:', error);
      throw error;
    }
  }
}

/**
 * GET /api/matching/candidates/:jobId
 * Trouve les meilleurs candidats pour une offre
 */
export async function getBestCandidatesForJob(jobId, options = {}) {
  try {
    await updateCache();
    
    // Trouver l'offre
    const job = jobsCache.find(j => j.id == jobId);
    if (!job) {
      throw new Error(`Offre non trouvée: ${jobId}`);
    }

    const {
      limit = 10,
      minScore = 0.3,
      includeDetails = true
    } = options;

    // Calculer les scores de compatibilité
    const results = findBestCandidatesForJob(candidatesCache, job, limit)
      .filter(result => result.globalScore >= minScore);

    if (!includeDetails) {
      return {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        totalCandidates: results.length,
        candidates: results.map(result => ({
          candidateId: result.candidate.id,
          name: result.candidate.name,
          title: result.candidate.title,
          profilePhoto: result.candidate.profilePhoto || result.candidate.photo,
          score: result.globalScore,
          matchLevel: result.matchLevel
        }))
      };
    }

    // Version détaillée
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      remote: job.remote,
      seniority: job.seniority,
      totalCandidates: results.length,
      candidates: results.map(result => ({
        candidateId: result.candidate.id,
        name: result.candidate.name,
        title: result.candidate.title,
        location: result.candidate.location,
        experience: result.candidate.experience,
        skills: result.candidate.skills,
        availability: result.candidate.availability,
        planType: result.candidate.planType,
        isFeatured: result.candidate.isFeatured,
        profilePhoto: result.candidate.profilePhoto || result.candidate.photo,
        score: result.globalScore,
        matchLevel: result.matchLevel,
        scoreBreakdown: {
          skills: result.scores.skills,
          experience: result.scores.experience,
          location: result.scores.location,
          salary: result.scores.salary,
          availability: result.scores.availability,
          plan: result.scores.plan
        }
      }))
    };
  } catch (error) {
    console.error('Erreur dans getBestCandidatesForJob:', error);
    throw error;
  }
}

/**
 * GET /api/matching/jobs/:candidateId
 * Trouve les meilleures offres pour un candidat
 */
export async function getBestJobsForCandidate(candidateId, options = {}) {
  try {
    await updateCache();
    
    // Trouver le candidat
    const candidate = candidatesCache.find(c => c.id == candidateId);
    if (!candidate) {
      throw new Error(`Candidat non trouvé: ${candidateId}`);
    }

    const {
      limit = 10,
      minScore = 0.3,
      includeDetails = true
    } = options;

    // Calculer les scores de compatibilité
    const results = findBestJobsForCandidate(jobsCache, candidate, limit)
      .filter(result => result.globalScore >= minScore);

    if (!includeDetails) {
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateTitle: candidate.title,
        totalJobs: results.length,
        jobs: results.map(result => ({
          jobId: result.job.id,
          title: result.job.title,
          company: result.job.company,
          score: result.globalScore,
          matchLevel: result.matchLevel
        }))
      };
    }

    // Version détaillée
    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateTitle: candidate.title,
      location: candidate.location,
      experience: candidate.experience,
      totalJobs: results.length,
      jobs: results.map(result => ({
        jobId: result.job.id,
        title: result.job.title,
        company: result.job.company,
        location: result.job.location,
        remote: result.job.remote,
        seniority: result.job.seniority,
        salary: result.job.salary,
        tags: result.job.tags,
        postedAt: result.job.postedAt,
        viewsCount: result.job.viewsCount,
        applicationsCount: result.job.applicationsCount,
        score: result.globalScore,
        matchLevel: result.matchLevel,
        scoreBreakdown: {
          skills: result.scores.skills,
          experience: result.scores.experience,
          location: result.scores.location,
          salary: result.scores.salary,
          availability: result.scores.availability,
          plan: result.scores.plan
        }
      }))
    };
  } catch (error) {
    console.error('Erreur dans getBestJobsForCandidate:', error);
    throw error;
  }
}

/**
 * POST /api/matching/feedback
 * Enregistre le feedback sur les recommandations
 */
export async function recordMatchingFeedback(feedbackData) {
  try {
    const {
      userId,
      userType, // 'candidate' ou 'recruiter'
      recommendationId,
      recommendationType, // 'candidate' ou 'job'
      action, // 'viewed', 'clicked', 'applied', 'contacted', 'dismissed'
      score,
      timestamp = new Date().toISOString()
    } = feedbackData;

    // Validation des données
    if (!userId || !userType || !recommendationId || !recommendationType || !action) {
      throw new Error('Données de feedback incomplètes');
    }

    // Ici, vous pourriez sauvegarder en base de données
    // Pour l'instant, on log juste les données
    console.log('📊 Feedback de matching:', {
      userId,
      userType,
      recommendationId,
      recommendationType,
      action,
      score,
      timestamp
    });

    return {
      success: true,
      message: 'Feedback enregistré avec succès',
      feedbackId: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('Erreur dans recordMatchingFeedback:', error);
    throw error;
  }
}

/**
 * GET /api/matching/stats
 * Retourne les statistiques de matching globales
 */
export async function getMatchingStats() {
  try {
    await updateCache();
    
    const stats = calculateMatchingStats(candidatesCache, jobsCache);
    
    return {
      timestamp: new Date().toISOString(),
      dataQuality: {
        totalCandidates: candidatesCache.length,
        totalJobs: jobsCache.length,
        approvedCandidates: candidatesCache.filter(c => c.approved).length,
        activeJobs: jobsCache.filter(j => j.status === 'active').length
      },
      matching: {
        totalPossibleMatches: stats.totalMatches,
        averageCompatibilityScore: Math.round(stats.averageScore * 100) / 100,
        highQualityMatches: stats.highQualityMatches,
        mediumQualityMatches: stats.mediumQualityMatches,
        lowQualityMatches: stats.lowQualityMatches,
        highQualityPercentage: Math.round((stats.highQualityMatches / stats.totalMatches) * 100) || 0
      },
      performance: {
        cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : 0,
        cacheSize: {
          candidates: candidatesCache.length,
          jobs: jobsCache.length
        }
      }
    };
  } catch (error) {
    console.error('Erreur dans getMatchingStats:', error);
    throw error;
  }
}

/**
 * GET /api/matching/score/:candidateId/:jobId
 * Calcule le score de compatibilité entre un candidat et une offre spécifiques
 */
export async function getCompatibilityScore(candidateId, jobId) {
  try {
    await updateCache();
    
    const candidate = candidatesCache.find(c => c.id == candidateId);
    const job = jobsCache.find(j => j.id == jobId);
    
    if (!candidate) {
      throw new Error(`Candidat non trouvé: ${candidateId}`);
    }
    
    if (!job) {
      throw new Error(`Offre non trouvée: ${jobId}`);
    }

    const result = calculateCompatibilityScore(candidate, job);
    
    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      compatibility: {
        globalScore: result.globalScore,
        matchLevel: result.matchLevel,
        scoreBreakdown: {
          skills: {
            score: result.scores.skills,
            weight: 0.35,
            weightedScore: result.scores.skills * 0.35,
            details: {
              candidateSkills: candidate.skills,
              jobTags: job.tags,
              matchingSkills: candidate.skills.filter(skill => 
                job.tags.some(tag => tag.toLowerCase() === skill.toLowerCase())
              )
            }
          },
          experience: {
            score: result.scores.experience,
            weight: 0.20,
            weightedScore: result.scores.experience * 0.20,
            details: {
              candidateExperience: candidate.experience,
              jobSeniority: job.seniority
            }
          },
          location: {
            score: result.scores.location,
            weight: 0.15,
            weightedScore: result.scores.location * 0.15,
            details: {
              candidateLocation: candidate.location,
              candidateRemote: candidate.remote,
              jobLocation: job.location,
              jobRemote: job.remote
            }
          },
          salary: {
            score: result.scores.salary,
            weight: 0.15,
            weightedScore: result.scores.salary * 0.15,
            details: {
              candidateSalary: candidate.salary,
              candidateAnnualSalary: candidate.annualSalary,
              jobSalary: job.salary
            }
          },
          availability: {
            score: result.scores.availability,
            weight: 0.10,
            weightedScore: result.scores.availability * 0.10,
            details: {
              candidateAvailability: candidate.availability
            }
          },
          plan: {
            score: result.scores.plan,
            weight: 0.05,
            weightedScore: result.scores.plan * 0.05,
            details: {
              candidatePlanType: candidate.planType,
              candidateIsFeatured: candidate.isFeatured
            }
          }
        }
      },
      recommendations: generateRecommendations(result, candidate, job)
    };
  } catch (error) {
    console.error('Erreur dans getCompatibilityScore:', error);
    throw error;
  }
}

/**
 * Génère des recommandations basées sur le score
 */
function generateRecommendations(result, candidate, job) {
  const recommendations = [];
  
  // Recommandations basées sur les scores faibles
  if (result.scores.skills < 0.5) {
    recommendations.push({
      type: 'skills',
      priority: 'high',
      message: 'Compétences techniques incompatibles',
      suggestion: `Le candidat devrait développer: ${job.tags.filter(tag => 
        !candidate.skills.some(skill => skill.toLowerCase() === tag.toLowerCase())
      ).join(', ')}`
    });
  }
  
  if (result.scores.experience < 0.7) {
    recommendations.push({
      type: 'experience',
      priority: 'medium',
      message: 'Niveau d\'expérience non optimal',
      suggestion: candidate.experience === 'Junior' && job.seniority === 'Senior' 
        ? 'Candidat sous-qualifié pour ce poste senior'
        : 'Candidat sur-qualifié pour ce poste'
    });
  }
  
  if (result.scores.location < 0.5) {
    recommendations.push({
      type: 'location',
      priority: 'medium',
      message: 'Localisation incompatible',
      suggestion: 'Considérer le travail à distance ou la relocalisation'
    });
  }
  
  if (result.scores.salary < 0.5) {
    recommendations.push({
      type: 'salary',
      priority: 'low',
      message: 'Fourchettes salariales incompatibles',
      suggestion: 'Négocier les attentes salariales'
    });
  }
  
  // Recommandations positives
  if (result.globalScore >= 0.8) {
    recommendations.push({
      type: 'overall',
      priority: 'positive',
      message: 'Match excellent !',
      suggestion: 'Candidat idéal pour ce poste'
    });
  }
  
  return recommendations;
}

/**
 * Force la mise à jour du cache
 */
export async function refreshCache() {
  cacheTimestamp = null;
  await updateCache();
  return {
    success: true,
    message: 'Cache mis à jour avec succès',
    timestamp: new Date().toISOString()
  };
}
