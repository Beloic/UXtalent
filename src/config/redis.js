import { createClient } from 'redis';
import { logger } from '../logger/logger.js';
import UpstashClient from './upstashClient.js';

// Configuration Redis - Support Upstash et Redis classique
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;
const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const IS_UPSTASH = !!(UPSTASH_REST_URL && UPSTASH_REST_TOKEN);
const DISABLE_REDIS = String(process.env.DISABLE_REDIS || '').toLowerCase() === 'true';

// État global de Redis
let redisConnectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;
let redisDisabled = false; // RÉACTIVÉ

// Configuration pour Upstash vs Redis classique
let redisClient;

if (DISABLE_REDIS) {
  // Mode désactivé: client mock no-op
  redisClient = {
    isOpen: false,
    isConnected: false,
    async connect() { logger.warn('⚠️ Redis désactivé (DISABLE_REDIS=true)'); return false; },
    async disconnect() { logger.warn('⚠️ Redis désactivé (DISABLE_REDIS=true)'); },
    async ping() { return false; },
    async get() { return null; },
    async set() { return false; },
    async setEx() { return false; },
    async setex() { return false; },
    async del() { return false; },
    async exists() { return 0; },
    async ttl() { return -1; },
    async expire() { return false; },
    async keys() { return []; },
    async dbSize() { return 0; },
    async info() { return ''; },
    async flushDb() { return false; }
  };
} else if (IS_UPSTASH) {
  // Utiliser le client Upstash REST API
  redisClient = new UpstashClient(UPSTASH_REST_URL, UPSTASH_REST_TOKEN);
} else {
  // Configuration Redis classique
  const redisOptions = {
    url: REDIS_URL,
    socket: {
      connectTimeout: 10000,
      lazyConnect: true,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('❌ Redis max retry attempts reached');
          return new Error('Max retries reached');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  };

  // Ajouter le mot de passe si fourni
  if (REDIS_PASSWORD) {
    redisOptions.password = REDIS_PASSWORD;
  }

  redisClient = createClient(redisOptions);
}

// Gestionnaires d'événements Redis (seulement pour Redis classique et non désactivé)
if (!IS_UPSTASH && !DISABLE_REDIS) {
  redisClient.on('error', (err) => {
    redisConnectionAttempts++;
    logger.error('❌ Redis Client Error:', { 
      error: err.message, 
      isUpstash: false, 
      attempts: redisConnectionAttempts 
    });
    
    // Désactiver Redis après trop de tentatives
    if (redisConnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      logger.warn('⚠️ Redis désactivé après trop de tentatives de connexion');
      redisDisabled = true;
      redisClient.disconnect();
    }
  });

  redisClient.on('connect', () => {
    logger.info('🔗 Redis Client Connected (Local)');
    redisConnectionAttempts = 0; // Reset counter on successful connection
    redisDisabled = false;
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis Client Ready (Local)');
  });

  redisClient.on('end', () => {
    logger.info('🔌 Redis Client Disconnected');
  });

  redisClient.on('reconnecting', () => {
    if (!redisDisabled) {
      logger.info('🔄 Redis Client Reconnecting...');
    }
  });
}

// Fonction pour connecter Redis
export const connectRedis = async () => {
  try {
    // Si Redis est désactivé, ne pas essayer de se connecter
    if (DISABLE_REDIS || redisDisabled) {
      logger.warn('⚠️ Redis désactivé, fonctionnement en mode dégradé');
      return false;
    }

    if (IS_UPSTASH) {
      // Upstash REST API
      await redisClient.connect();
      logger.info('🚀 Upstash Redis REST connection established');
    } else {
      // Redis classique
      if (!redisClient.isOpen) {
        await redisClient.connect();
        logger.info('🚀 Redis connection established');
      }
    }
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', { error: error.message });
    redisDisabled = true;
    return false;
  }
};

// Fonction pour déconnecter Redis
export const disconnectRedis = async () => {
  try {
    if (IS_UPSTASH) {
      // Upstash REST API
      await redisClient.disconnect();
      logger.info('🔌 Upstash Redis REST connection closed');
    } else {
      // Redis classique
      if (redisClient.isOpen) {
        await redisClient.disconnect();
        logger.info('🔌 Redis connection closed');
      }
    }
  } catch (error) {
    logger.error('❌ Failed to disconnect from Redis:', { error: error.message });
  }
};

// Fonction pour vérifier la santé de Redis
export const checkRedisHealth = async () => {
  try {
    // Si Redis est désactivé, retourner false
    if (DISABLE_REDIS || redisDisabled) {
      return false;
    }

    if (IS_UPSTASH) {
      // Upstash REST API
      const pong = await redisClient.ping();
      return pong === 'PONG';
    } else {
      // Redis classique
      if (!redisClient.isOpen) {
        return false;
      }
      const pong = await redisClient.ping();
      return pong === 'PONG';
    }
  } catch (error) {
    logger.error('❌ Redis health check failed:', { error: error.message });
    redisDisabled = true;
    return false;
  }
};

// Fonction pour obtenir les statistiques Redis
export const getRedisStats = async () => {
  try {
    if (IS_UPSTASH) {
      // Upstash REST API
      const dbSize = await redisClient.dbSize();
      return {
        connected: redisClient.isConnected,
        dbSize,
        memory: 'Upstash managed'
      };
    } else {
      // Redis classique
      const info = await redisClient.info('memory');
      const dbSize = await redisClient.dbSize();
      
      return {
        connected: redisClient.isOpen,
        dbSize,
        memory: info
      };
    }
  } catch (error) {
    logger.error('❌ Failed to get Redis stats:', { error: error.message });
    return {
      connected: false,
      dbSize: 0,
      memory: null
    };
  }
};

// Fonction pour réinitialiser Redis (utile pour les tests ou en cas de problème)
export const resetRedis = () => {
  redisConnectionAttempts = 0;
  redisDisabled = false;
  logger.info('🔄 Redis réinitialisé');
};

// Fonction pour vérifier si Redis est disponible
export const isRedisAvailable = () => {
  return !DISABLE_REDIS && !redisDisabled && redisClient.isOpen;
};

export { redisClient };
export default redisClient;
