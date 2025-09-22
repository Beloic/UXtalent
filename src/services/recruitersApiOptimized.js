import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { supabase } from '../lib/supabase';

// Service API optimisé pour les recruteurs avec mise en cache
class RecruitersApiOptimized {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Générer une clé de cache
  generateCacheKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}${paramString ? `?${paramString}` : ''}`;
  }

  // Vérifier si le cache est valide
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  // Récupérer depuis le cache
  getFromCache(key) {
    const cacheEntry = this.cache.get(key);
    if (this.isCacheValid(cacheEntry)) {
      console.log(`🚀 [CACHE_HIT] ${key}`);
      return cacheEntry.data;
    }
    return null;
  }

  // Mettre en cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 [CACHE_SET] ${key}`);
  }

  // Nettoyer le cache
  clearCache() {
    this.cache.clear();
    console.log('🧹 [CACHE_CLEAR] Cache vidé');
  }

  // Récupérer toutes les données du recruteur en une seule requête (OPTIMISÉ)
  async getCompleteProfile() {
    const cacheKey = this.generateCacheKey('/api/recruiters/me/complete');
    
    // Vérifier le cache
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }

      const startTime = Date.now();
      
      const response = await fetch(buildApiUrl('/api/recruiters/me/complete'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const loadTime = Date.now() - startTime;
      
      console.log(`⚡ [OPTIMIZED_API] Données récupérées en ${loadTime}ms`);
      
      // Mettre en cache
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération complète du profil:', error);
      throw error;
    }
  }

  // Récupérer le profil uniquement (plus rapide)
  async getProfile() {
    const cacheKey = this.generateCacheKey('/api/recruiters/me');
    
    // Vérifier le cache
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters/me'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre en cache
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  // Précharger les données en arrière-plan
  async preloadData() {
    try {
      console.log('🔄 [PRELOAD] Préchargement des données en arrière-plan...');
      await this.getCompleteProfile();
      console.log('✅ [PRELOAD] Données préchargées avec succès');
    } catch (error) {
      console.warn('⚠️ [PRELOAD] Échec du préchargement:', error.message);
    }
  }

  // Invalider le cache pour un utilisateur spécifique
  invalidateUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes('/api/recruiters/me')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`🗑️ [CACHE_INVALIDATE] ${key}`);
    });
  }
}

// Instance singleton
export const recruitersApiOptimized = new RecruitersApiOptimized();

// Fonctions d'export pour compatibilité
export const fetchRecruiterProfileOptimized = () => recruitersApiOptimized.getProfile();
export const fetchRecruiterCompleteOptimized = () => recruitersApiOptimized.getCompleteProfile();
export const preloadRecruiterData = () => recruitersApiOptimized.preloadData();
export const clearRecruiterCache = () => recruitersApiOptimized.clearCache();
export const invalidateRecruiterCache = (userId) => recruitersApiOptimized.invalidateUserCache(userId);
