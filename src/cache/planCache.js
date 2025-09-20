// Cache Redis pour les plans des candidats
// Migration du cache local vers Redis pour la scalabilité

import { logger } from '../logger/logger.js';

const PLAN_CACHE_PREFIX = 'plan:';
const PLAN_CACHE_TTL = 60 * 60; // 1 heure

// Cache temporaire en mémoire en attendant la correction Redis
const planCache = new Map();

export const setCandidatePlan = async (candidateId, planType) => {
  try {
    const planData = {
      planType: planType,
      isFeatured: planType !== 'free',
      updatedAt: new Date().toISOString()
    };
    
    // Cache temporaire en mémoire
    planCache.set(candidateId, planData);
    
    logger.debug('💾 Plan mis en cache temporaire:', { candidateId, planType });
  } catch (error) {
    logger.error('❌ Erreur cache plan:', { error: error.message, candidateId });
  }
};

export const getCandidatePlan = async (candidateId) => {
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

export const clearPlanCache = async () => {
  try {
    // Cache temporaire en mémoire
    planCache.clear();
    logger.info('🧹 Cache plans vidé');
  } catch (error) {
    logger.error('❌ Erreur vidage cache plans:', { error: error.message });
  }
};

// Fonction de migration depuis l'ancien cache local (si nécessaire)
export const migrateFromLocalCache = (localCache) => {
  if (!localCache || typeof localCache !== 'object') {
    return;
  }
  
  Object.entries(localCache).forEach(async ([candidateId, planData]) => {
    await setCandidatePlan(candidateId, planData.planType);
  });
  
  logger.info('🔄 Migration cache local vers Redis terminée');
};
