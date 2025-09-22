import { redisClient, connectRedis } from '../config/redis.js';
import { logger } from '../logger/logger.js';
import { metrics } from '../metrics/metrics.js';

// Configuration du cache Redis optimisée
const CACHE_DURATION = {
  CANDIDATES: 15 * 60, // 15 minutes pour les candidats
  JOBS: 10 * 60, // 10 minutes pour les offres
  FORUM: 5 * 60, // 5 minutes pour le forum
  METRICS: 2 * 60, // 2 minutes pour les métriques
  DEFAULT: 5 * 60 // 5 minutes par défaut
};
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes en millisecondes

// Classe Cache Redis
class RedisCache {
  constructor() {
    this.isConnected = false;
    this.startCleanupInterval();
    this.connect();
  }

  // Se connecter à Redis
  async connect() {
    try {
      const connected = await connectRedis();
      
      // Vérifier si c'est un client Upstash ou Redis classique
      const isUpstash = redisClient.constructor.name === 'UpstashClient';
      
      if (isUpstash) {
        this.isConnected = connected && redisClient.isConnected;
      } else {
        this.isConnected = connected && redisClient.isOpen;
      }
      
      if (this.isConnected) {
        logger.info('✅ Redis Cache connected');
      } else {
        logger.warn('⚠️ Redis non disponible, fonctionnement en mode dégradé');
        this.isConnected = false;
      }
    } catch (error) {
      logger.error('❌ Redis Cache connection failed:', { error: error.message });
      this.isConnected = false;
    }
  }

  // Vérifier la connexion Redis
  async checkConnection() {
    try {
      // Vérifier si c'est un client Upstash ou Redis classique
      const isUpstash = redisClient.constructor.name === 'UpstashClient';
      
      // Si Redis est désactivé, ne pas essayer de se reconnecter
      if (!this.isConnected && !isUpstash && redisClient.isOpen === false) {
        return false;
      }
      
      if (!this.isConnected || (!isUpstash && !redisClient.isOpen)) {
        await this.connect();
      }
      
      // Vérifier la connexion selon le type de client
      if (isUpstash) {
        return this.isConnected && redisClient.isConnected;
      } else {
        return this.isConnected && redisClient.isOpen;
      }
    } catch (error) {
      logger.error('❌ Redis connection check failed:', { error: error.message });
      this.isConnected = false;
      return false;
    }
  }

  // Générer une clé de cache unique
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `cache:${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  // Obtenir une valeur du cache
  async get(key) {
    if (!this.isConnected) {
      await this.checkConnection();
      if (!this.isConnected) {
        logger.debug(`🚫 Redis non connecté - pas de cache pour ${key}`);
        metrics.recordCacheMiss();
        return null;
      }
    }

    try {
      const result = await redisClient.get(key);
      if (result) {
        logger.debug(`✅ Redis Cache hit pour ${key}`);
        metrics.recordCacheHit();
        return JSON.parse(result);
      } else {
        logger.debug(`❌ Redis Cache miss pour ${key}`);
        metrics.recordCacheMiss();
        return null;
      }
    } catch (error) {
      logger.error('❌ Redis Cache get error:', { error: error.message, key });
      metrics.recordCacheMiss();
      return null;
    }
  }

  // Stocker une valeur dans le cache
  async set(key, data, cacheType = 'DEFAULT') {
    if (!this.isConnected) {
      await this.checkConnection();
      if (!this.isConnected) {
        logger.debug(`🚫 Redis non connecté - pas de cache set pour ${key}`);
        return false;
      }
    }

    try {
      const ttl = CACHE_DURATION[cacheType] || CACHE_DURATION.DEFAULT;
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      logger.debug(`💾 Redis Cache set pour ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('❌ Redis Cache set error:', { error: error.message, key });
      return false;
    }
  }

  // Supprimer une entrée du cache
  async delete(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await redisClient.del(key);
      logger.debug(`🗑️ Redis Cache delete pour ${key}`);
      return true;
    } catch (error) {
      logger.error('❌ Redis Cache delete error:', { error: error.message, key });
      return false;
    }
  }

  // Supprimer plusieurs clés avec un pattern
  async deletePattern(pattern) {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.debug(`🗑️ Redis Cache delete pattern ${pattern}: ${keys.length} keys`);
      }
      return keys.length;
    } catch (error) {
      logger.error('❌ Redis Cache delete pattern error:', { error: error.message, pattern });
      return 0;
    }
  }

  // Vider tout le cache
  async clear() {
    if (!this.isConnected) {
      return false;
    }

    try {
      await redisClient.flushDb();
      logger.info('🧹 Redis Cache vidé');
      return true;
    } catch (error) {
      logger.error('❌ Redis Cache clear error:', { error: error.message });
      return false;
    }
  }

  // Obtenir les statistiques du cache
  async getStats() {
    if (!this.isConnected) {
      return {
        connected: false,
        totalEntries: 0,
        memoryUsage: 0,
        hitRatio: 0
      };
    }

    try {
      const dbSize = await redisClient.dbSize();
      
      // Vérifier si c'est un client Upstash ou Redis classique
      const isUpstash = redisClient.constructor.name === 'UpstashClient';
      
      let memoryInfo = {};
      if (!isUpstash && typeof redisClient.info === 'function') {
        // Redis classique
        const info = await redisClient.info('memory');
        
        // Parser les informations mémoire Redis
        info.split('\r\n').forEach(line => {
          if (line.includes(':')) {
            const [key, value] = line.split(':');
            memoryInfo[key] = value;
          }
        });
      } else if (isUpstash && typeof redisClient.info === 'function') {
        // Upstash REST API
        const info = await redisClient.info('memory');
        memoryInfo = { used_memory_human: 'Upstash managed' };
      }

      return {
        connected: true,
        totalEntries: dbSize,
        memoryUsage: parseInt(memoryInfo.used_memory_human) || 0,
        hitRatio: metrics.getAllMetrics().cache.hitRatio
      };
    } catch (error) {
      logger.error('❌ Redis Cache stats error:', { error: error.message });
      return {
        connected: false,
        totalEntries: 0,
        memoryUsage: 0,
        hitRatio: 0
      };
    }
  }

  // Vérifier si une clé existe
  async exists(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('❌ Redis Cache exists error:', { error: error.message, key });
      return false;
    }
  }

  // Obtenir le TTL d'une clé
  async getTTL(key) {
    if (!this.isConnected) {
      return -1;
    }

    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error('❌ Redis Cache TTL error:', { error: error.message, key });
      return -1;
    }
  }

  // Renouveler le TTL d'une clé
  async renewTTL(key, ttl = CACHE_DURATION) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await redisClient.expire(key, ttl);
      logger.debug(`🔄 Redis Cache TTL renewed pour ${key}`);
      return true;
    } catch (error) {
      logger.error('❌ Redis Cache renew TTL error:', { error: error.message, key });
      return false;
    }
  }

  // Démarrer l'intervalle de nettoyage automatique
  startCleanupInterval() {
    setInterval(async () => {
      await this.cleanup();
    }, CLEANUP_INTERVAL);
  }

  // Nettoyer les entrées expirées (Redis le fait automatiquement, mais on peut ajouter de la logique custom)
  async cleanup() {
    if (!this.isConnected) {
      return;
    }

    try {
      // Redis gère automatiquement l'expiration, mais on peut ajouter de la logique custom ici
      const stats = await this.getStats();
      if (stats.totalEntries > 1000) {
        logger.info(`🧹 Redis Cache cleanup: ${stats.totalEntries} entrées`);
      }
    } catch (error) {
      logger.error('❌ Redis Cache cleanup error:', { error: error.message });
    }
  }

  // Obtenir toutes les clés avec un pattern
  async getKeys(pattern = 'cache:*') {
    if (!this.isConnected) {
      return [];
    }

    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      logger.error('❌ Redis Cache get keys error:', { error: error.message, pattern });
      return [];
    }
  }
}

// Instance singleton du cache Redis
export const redisCache = new RedisCache();

// Middleware pour le cache Redis
export const redisCacheMiddleware = (req, res, next) => {
  // Vérifier si Redis est disponible
  if (!redisCache.isConnected) {
    logger.debug(`🚫 Redis non connecté - pas de cache pour ${req.originalUrl}`);
    next();
    return;
  }

  // Générer la clé de cache basée sur l'URL et les paramètres
  const cacheKey = redisCache.generateKey(req.originalUrl, req.query);
  
  // Essayer de récupérer depuis le cache
  redisCache.get(cacheKey).then(cachedData => {
    if (cachedData) {
      logger.debug(`✅ Cache hit pour ${req.originalUrl}`);
      res.json(cachedData);
      return;
    }
    
    // Si pas de cache, continuer et intercepter la réponse
    const originalJson = res.json;
    res.json = function(data) {
      // Stocker dans le cache (déterminer le type de cache basé sur l'URL)
      let cacheType = 'DEFAULT';
      if (req.originalUrl.includes('/candidates')) cacheType = 'CANDIDATES';
      else if (req.originalUrl.includes('/jobs')) cacheType = 'JOBS';
      else if (req.originalUrl.includes('/forum')) cacheType = 'FORUM';
      else if (req.originalUrl.includes('/metrics')) cacheType = 'METRICS';
      
      redisCache.set(cacheKey, data, cacheType);
      
      // Appeler la méthode originale
      originalJson.call(this, data);
    };
    
    next();
  }).catch(error => {
    logger.error('❌ Redis Cache middleware error:', { error: error.message, url: req.originalUrl });
    next();
  });
};

export default redisCache;
