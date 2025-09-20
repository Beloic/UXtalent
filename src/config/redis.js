import { createClient } from 'redis';
import { logger } from '../logger/logger.js';
import UpstashClient from './upstashClient.js';

// Configuration Redis - Support Upstash et Redis classique
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;
const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const IS_UPSTASH = !!(UPSTASH_REST_URL && UPSTASH_REST_TOKEN);

// Configuration pour Upstash vs Redis classique
let redisClient;

if (IS_UPSTASH) {
  // Utiliser le client Upstash REST API
  redisClient = new UpstashClient(UPSTASH_REST_URL, UPSTASH_REST_TOKEN);
} else {
  // Configuration Redis classique
  const redisOptions = {
    url: REDIS_URL,
    socket: {
      connectTimeout: 10000,
      lazyConnect: true
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

  redisClient = createClient(redisOptions);
}

// Gestionnaires d'événements Redis (seulement pour Redis classique)
if (!IS_UPSTASH) {
  redisClient.on('error', (err) => {
    logger.error('❌ Redis Client Error:', { error: err.message, isUpstash: false });
  });

  redisClient.on('connect', () => {
    logger.info('🔗 Redis Client Connected (Local)');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis Client Ready (Local)');
  });

  redisClient.on('end', () => {
    logger.info('🔌 Redis Client Disconnected');
  });

  redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis Client Reconnecting...');
  });
}

// Fonction pour connecter Redis
export const connectRedis = async () => {
  try {
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
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', { error: error.message });
    throw error;
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
    if (IS_UPSTASH) {
      // Upstash REST API
      const pong = await redisClient.ping();
      return pong === 'PONG';
    } else {
      // Redis classique
      const pong = await redisClient.ping();
      return pong === 'PONG';
    }
  } catch (error) {
    logger.error('❌ Redis health check failed:', { error: error.message });
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

export { redisClient };
export default redisClient;
