// Cache Redis pour les plans des candidats
// Migration du cache local vers Redis pour la scalabilité

import { redisClient } from '../config/redis.js';
import { logger } from '../logger/logger.js';

const PLAN_CACHE_PREFIX = 'plan:';
const PLAN_CACHE_TTL = 60 * 60; // 1 heure

export const setCandidatePlan = async (candidateId, planType) => {
  try {
    const planData = {
      planType: planType,
      isFeatured: planType !== 'free',
      updatedAt: new Date().toISOString()
    };
    
    const key = `${PLAN_CACHE_PREFIX}${candidateId}`;
    await redisClient.setEx(key, PLAN_CACHE_TTL, JSON.stringify(planData));
    
    logger.debug('💾 Plan mis en cache Redis:', { candidateId, planType });
  } catch (error) {
    logger.error('❌ Erreur cache Redis plan:', { error: error.message, candidateId });
  }
};

export const getCandidatePlan = async (candidateId) => {
  try {
    const key = `${PLAN_CACHE_PREFIX}${candidateId}`;
    const data = await redisClient.get(key);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    logger.error('❌ Erreur récupération cache Redis plan:', { error: error.message, candidateId });
    return null;
  }
};

export const getAllPlanCache = async () => {
  try {
    const keys = await redisClient.keys(`${PLAN_CACHE_PREFIX}*`);
    const plans = {};
    
    for (const key of keys) {
      const candidateId = key.replace(PLAN_CACHE_PREFIX, '');
      const planData = await redisClient.get(key);
      
      if (planData) {
        plans[candidateId] = JSON.parse(planData);
      }
    }
    
    return plans;
  } catch (error) {
    logger.error('❌ Erreur récupération tous les plans cache Redis:', { error: error.message });
    return {};
  }
};

export const clearPlanCache = async () => {
  try {
    const keys = await redisClient.keys(`${PLAN_CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info('🧹 Cache Redis plans vidé:', { count: keys.length });
    }
  } catch (error) {
    logger.error('❌ Erreur vidage cache Redis plans:', { error: error.message });
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
