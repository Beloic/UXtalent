// Cache en mémoire pour les plans des candidats
// Solution temporaire en attendant que Supabase fonctionne correctement

const planCache = new Map();

export const setCandidatePlan = (candidateId, planType) => {
  planCache.set(candidateId, {
    planType: planType,
    isFeatured: planType !== 'free',
    updatedAt: new Date().toISOString()
  });
  console.log('💾 Plan mis en cache:', { candidateId, planType });
};

export const getCandidatePlan = (candidateId) => {
  return planCache.get(candidateId);
};

export const getAllPlanCache = () => {
  return Object.fromEntries(planCache);
};

export const clearPlanCache = () => {
  planCache.clear();
};
