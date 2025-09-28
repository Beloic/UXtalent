// Cache en mémoire pour les plans des candidats
// Redis supprimé - utilisation d'un cache local simple

import { logger } from '../logger/clientLogger.js';

const PLAN_CACHE_PREFIX = 'plan:';
const PLAN_CACHE_TTL = 60 * 60; // 1 heure

// Cache temporaire en mémoire (Redis supprimé)
const planCache = new Map();

export const setCandidatePlan = (candidateId, planType) => {
  try {
    const planData = {
      planType: planType,
      isFeatured: planType !== 'free',
      updatedAt: new Date().toISOString()
    };
    
    // Cache temporaire en mémoire
    planCache.set(candidateId, planData);
    
  } catch (error) {
  }
};

export const getCandidatePlan = (candidateId) => {
  try {
    // Cache temporaire en mémoire
    return planCache.get(candidateId) || null;
  } catch (error) {
    logger.error('❌ Erreur récupération cache plan:', { error: error.message, candidateId });
    return null;
  }
};

export const getAllPlanCache = async () => {
  try {
    // Cache temporaire en mémoire
    return Object.fromEntries(planCache);
  } catch (error) {
    logger.error('❌ Erreur récupération tous les plans cache:', { error: error.message });
    return {};
  }
};

export const clearPlanCache = () => {
  try {
    // Cache temporaire en mémoire
    planCache.clear();
  } catch (error) {
  }
};

export const clearCandidatePlan = (candidateId) => {
  try {
    // Supprimer le cache d'un candidat spécifique
    planCache.delete(candidateId);
  } catch (error) {
  }
};

// Fonction de migration depuis l'ancien cache local (Redis supprimé)
export const migrateFromLocalCache = (localCache) => {
  if (!localCache || typeof localCache !== 'object') {
    return;
  }
  
  Object.entries(localCache).forEach(async ([candidateId, planData]) => {
    await setCandidatePlan(candidateId, planData.planType);
  });
  
  logger.info('🔄 Migration cache local terminée');
};
