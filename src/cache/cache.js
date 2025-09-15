import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger/logger.js';
import { metrics } from '../metrics/metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du cache
const CACHE_DIR = path.join(__dirname, '../../cache');
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Créer le dossier cache s'il n'existe pas
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Classe Cache
class Cache {
  constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  // Générer une clé de cache unique
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  // Vérifier si une entrée est valide
  isValid(entry) {
    return Date.now() - entry.timestamp < CACHE_DURATION;
  }

  // Obtenir une valeur du cache
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      metrics.recordCacheMiss();
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      metrics.recordCacheMiss();
      return null;
    }

    logger.debug(`🔄 Cache hit pour ${key}`);
    metrics.recordCacheHit();
    return entry.data;
  }

  // Stocker une valeur dans le cache
  set(key, data) {
    const entry = {
      data,
      timestamp: Date.now(),
      key
    };

    this.cache.set(key, entry);
    logger.debug(`💾 Cache set pour ${key}`);

    // Mettre à jour les statistiques du cache
    metrics.setCacheStats(this.cache.size, JSON.stringify([...this.cache]).length);

    // Persister dans le fichier si nécessaire
    this.persistToFile(key, entry);
  }

  // Supprimer une entrée du cache
  delete(key) {
    this.cache.delete(key);
    logger.debug(`🗑️ Cache delete pour ${key}`);
  }

  // Vider tout le cache
  clear() {
    this.cache.clear();
    logger.info('🧹 Cache vidé');
  }

  // Obtenir les statistiques du cache
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache) {
      if (this.isValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRatio: 0, // À calculer avec des métriques supplémentaires
      memoryUsage: JSON.stringify([...this.cache]).length
    };
  }

  // Persister une entrée dans un fichier
  persistToFile(key, entry) {
    try {
      const filePath = path.join(CACHE_DIR, `${key.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
      fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      logger.error('Erreur lors de la persistance du cache', { error: error.message, key });
    }
  }

  // Charger le cache depuis les fichiers
  loadFromFiles() {
    try {
      const files = fs.readdirSync(CACHE_DIR);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(CACHE_DIR, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

          if (this.isValid(data)) {
            this.cache.set(data.key, data);
          } else {
            // Supprimer le fichier expiré
            fs.unlinkSync(filePath);
          }
        }
      }

      logger.info(`📖 Cache chargé depuis ${files.length} fichiers`);
    } catch (error) {
      logger.error('Erreur lors du chargement du cache', { error: error.message });
    }
  }

  // Démarrer l'intervalle de nettoyage automatique
  startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
  }

  // Nettoyer les entrées expirées
  cleanup() {
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 Nettoyage cache: ${cleaned} entrées supprimées`);
    }
  }
}

// Instance singleton du cache
export const cache = new Cache();

// Fonctions utilitaires pour le cache
export const cacheMiddleware = (req, res, next) => {
  // Ne pas utiliser le cache si un header Authorization est présent
  const hasAuthHeader = !!req.headers.authorization;
  const key = cache.generateKey(req.originalUrl, req.query);

  // Vérifier le cache pour les requêtes GET
  if (req.method === 'GET' && !hasAuthHeader) {
    const cachedData = cache.get(key);
    if (cachedData) {
      logger.debug(`🔄 Réponse depuis le cache pour ${req.originalUrl}`);
      return res.json(cachedData);
    }
  }

  // Intercepter la réponse pour la mettre en cache
  const originalJson = res.json;
  res.json = function(data) {
    // Mettre en cache uniquement les réponses réussies
    if (res.statusCode >= 200 && res.statusCode < 300 && req.method === 'GET' && !hasAuthHeader) {
      cache.set(key, data);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Charger le cache au démarrage
cache.loadFromFiles();

export default cache;
