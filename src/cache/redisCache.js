import { redisClient, connectRedis } from '../config/redis.js';
import { logger } from '../logger/logger.js';
import { metrics } from '../metrics/metrics.js';

// Configuration du cache Redis
const CACHE_DURATION = 30 * 60; // 30 minutes en secondes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes en millisecondes

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
      this.isConnected = connected && redisClient.isOpen;
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
      // Si Redis est désactivé, ne pas essayer de se reconnecter
      if (!this.isConnected && redisClient.isOpen === false) {
        return false;
      }
      
      if (!this.isConnected || !redisClient.isOpen) {
        await this.connect();
      }
      return this.isConnected && redisClient.isOpen;
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
    if (!(await this.checkConnection())) {
      metrics.recordCacheMiss();
      return null;
    }

    try {
      const data = await redisClient.get(key);
      
      if (!data) {
        metrics.recordCacheMiss();
        return null;
      }

      logger.debug(`🔄 Redis Cache hit pour ${key}`);
      metrics.recordCacheHit();
      return JSON.parse(data);
    } catch (error) {
      logger.error('❌ Redis Cache get error:', { error: error.message, key });
      metrics.recordCacheMiss();
      return null;
    }
  }

  // Stocker une valeur dans le cache
  async set(key, data, ttl = CACHE_DURATION) {
    if (!(await this.checkConnection())) {
      logger.warn('⚠️ Redis not connected, skipping cache set');
      return false;
    }

    try {
      const serializedData = JSON.stringify(data);
      await redisClient.set(key, serializedData, { EX: ttl });
      
      logger.debug(`💾 Redis Cache set pour ${key} (TTL: ${ttl}s)`);
      
      // Mettre à jour les statistiques du cache
      const dbSize = await redisClient.dbSize();
      metrics.setCacheStats(dbSize, serializedData.length);
      
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
      const info = await redisClient.info('memory');
      
      // Parser les informations mémoire Redis
      const memoryInfo = {};
      info.split('\r\n').forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          memoryInfo[key] = value;
        }
      });

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
  // Ne pas utiliser le cache si un header Authorization est présent
  const hasAuthHeader = !!req.headers.authorization;
  const key = redisCache.generateKey(req.originalUrl, req.query);

  // Vérifier le cache pour les requêtes GET
  if (req.method === 'GET' && !hasAuthHeader) {
    redisCache.get(key).then(cachedData => {
      if (cachedData) {
        logger.debug(`🔄 Réponse depuis Redis cache pour ${req.originalUrl}`);
        return res.json(cachedData);
      }
      next();
    }).catch(error => {
      logger.error('❌ Redis cache middleware error:', { error: error.message });
      next();
    });
  } else {
    next();
  }

  // Intercepter la réponse pour la mettre en cache
  const originalJson = res.json;
  res.json = function(data) {
    // Mettre en cache uniquement les réponses réussies
    if (res.statusCode >= 200 && res.statusCode < 300 && req.method === 'GET' && !hasAuthHeader) {
      redisCache.set(key, data).catch(error => {
        logger.error('❌ Redis cache set error in middleware:', { error: error.message });
      });
    }

    return originalJson.call(this, data);
  };
};

export default redisCache;
