// Configuration Redis côté client (navigateur)
// Cette version ne dépend pas des APIs Node.js

import { logger } from '../logger/clientLogger.js';
import UpstashClient from './upstashClient.js';

// Configuration Redis côté client
// Les variables d'environnement ne sont pas disponibles côté client
// On utilise des valeurs par défaut ou des configurations statiques
const REDIS_URL = 'redis://localhost:6379';
const REDIS_PASSWORD = null;
const UPSTASH_REST_URL = null; // À configurer si nécessaire
const UPSTASH_REST_TOKEN = null; // À configurer si nécessaire
const IS_UPSTASH = !!(UPSTASH_REST_URL && UPSTASH_REST_TOKEN);

// Configuration pour Upstash vs Redis classique
let redisClient = null;

// Côté client, on ne peut pas utiliser Redis directement
// On utilise un mock ou on désactive Redis
if (IS_UPSTASH) {
  // Utiliser le client Upstash REST API si configuré
  redisClient = new UpstashClient(UPSTASH_REST_URL, UPSTASH_REST_TOKEN);
} else {
  // Côté client, créer un mock Redis qui ne fait rien
  redisClient = {
    isOpen: false,
    isConnected: false,
    connect: async () => {
      logger.warn('Redis non disponible côté client');
      return false;
    },
    disconnect: async () => {
      logger.warn('Redis non disponible côté client');
    },
    ping: async () => {
      logger.warn('Redis non disponible côté client');
      return false;
    },
    get: async () => {
      logger.warn('Redis non disponible côté client');
      return null;
    },
    set: async () => {
      logger.warn('Redis non disponible côté client');
      return false;
    },
    del: async () => {
      logger.warn('Redis non disponible côté client');
      return false;
    },
    exists: async () => {
      logger.warn('Redis non disponible côté client');
      return false;
    },
    ttl: async () => {
      logger.warn('Redis non disponible côté client');
      return -1;
    },
    expire: async () => {
      logger.warn('Redis non disponible côté client');
      return false;
    },
    keys: async () => {
      logger.warn('Redis non disponible côté client');
      return [];
    },
    dbSize: async () => {
      logger.warn('Redis non disponible côté client');
      return 0;
    },
    info: async () => {
      logger.warn('Redis non disponible côté client');
      return '';
    }
  };
}

// Fonction pour connecter Redis (mock côté client)
export const connectRedis = async () => {
  try {
    if (IS_UPSTASH) {
      // Upstash REST API
      await redisClient.connect();
      logger.info('🚀 Upstash Redis REST connection established');
    } else {
      // Redis classique - mock côté client
      logger.info('ℹ️ Redis désactivé côté client');
    }
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', { error: error.message });
    throw error;
  }
};

// Fonction pour déconnecter Redis (mock côté client)
export const disconnectRedis = async () => {
  try {
    if (IS_UPSTASH) {
      // Upstash REST API
      await redisClient.disconnect();
      logger.info('🔌 Upstash Redis REST connection closed');
    } else {
      // Redis classique - mock côté client
      logger.info('ℹ️ Redis désactivé côté client');
    }
  } catch (error) {
    logger.error('❌ Failed to disconnect from Redis:', { error: error.message });
  }
};

// Fonction pour vérifier la santé de Redis (mock côté client)
export const checkRedisHealth = async () => {
  try {
    if (IS_UPSTASH) {
      // Upstash REST API
      const pong = await redisClient.ping();
      return pong === 'PONG';
    } else {
      // Redis classique - mock côté client
      logger.warn('Redis non disponible côté client');
      return false;
    }
  } catch (error) {
    logger.error('❌ Redis health check failed:', { error: error.message });
    return false;
  }
};

// Fonction pour obtenir les statistiques Redis (mock côté client)
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
      // Redis classique - mock côté client
      return {
        connected: false,
        dbSize: 0,
        memory: 'Redis non disponible côté client'
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
