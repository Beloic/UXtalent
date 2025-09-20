import { createClient } from 'redis';
import { logger } from '../logger/logger.js';

// Configuration Redis - Support Upstash et Redis classique
const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || process.env.UPSTASH_REDIS_REST_TOKEN || null;
const IS_UPSTASH = !!process.env.UPSTASH_REDIS_REST_URL;

// Options de configuration Redis - Adapté pour Upstash
const redisOptions = {
  url: REDIS_URL,
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
    tls: IS_UPSTASH ? {} : undefined // TLS pour Upstash
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('❌ Redis server refused connection');
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('❌ Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('❌ Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
};

// Ajouter le mot de passe si fourni
if (REDIS_PASSWORD) {
  redisOptions.password = REDIS_PASSWORD;
}

// Créer le client Redis
export const redisClient = createClient(redisOptions);

// Gestionnaires d'événements Redis
redisClient.on('error', (err) => {
  logger.error('❌ Redis Client Error:', { error: err.message, isUpstash: IS_UPSTASH });
});

redisClient.on('connect', () => {
  logger.info(`🔗 Redis Client Connected ${IS_UPSTASH ? '(Upstash)' : '(Local)'}`);
});

redisClient.on('ready', () => {
  logger.info(`✅ Redis Client Ready ${IS_UPSTASH ? '(Upstash)' : '(Local)'}`);
});

redisClient.on('end', () => {
  logger.info('🔌 Redis Client Disconnected');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Redis Client Reconnecting...');
});

// Fonction pour connecter Redis
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('🚀 Redis connection established');
    }
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', { error: error.message });
    throw error;
  }
};

// Fonction pour déconnecter Redis
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logger.info('🔌 Redis connection closed');
    }
  } catch (error) {
    logger.error('❌ Failed to disconnect from Redis:', { error: error.message });
  }
};

// Fonction pour vérifier la santé de Redis
export const checkRedisHealth = async () => {
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error('❌ Redis health check failed:', { error: error.message });
    return false;
  }
};

// Fonction pour obtenir les statistiques Redis
export const getRedisStats = async () => {
  try {
    const info = await redisClient.info('memory');
    const dbSize = await redisClient.dbSize();
    
    return {
      connected: redisClient.isOpen,
      dbSize,
      memory: info
    };
  } catch (error) {
    logger.error('❌ Failed to get Redis stats:', { error: error.message });
    return {
      connected: false,
      dbSize: 0,
      memory: null
    };
  }
};

export default redisClient;
