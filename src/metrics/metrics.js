import fs from 'fs';
import path from 'path';
import { logger } from '../logger/logger.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Configuration des métriques
const METRICS_FILE = path.join(__dirname, '../../data/metrics.json');
const MAX_METRICS_HISTORY = 1000;

// Classe Metrics
class MetricsCollector {
  constructor() {
    this.metrics = {
      scraping: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        totalJobsCollected: 0,
        averageDuration: 0,
        lastRun: null,
        bySource: {}
      },
      api: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        endpoints: {},
        lastRequest: null
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRatio: 0,
        totalEntries: 0,
        memoryUsage: 0
      },
      system: {
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        lastUpdate: null
      }
    };

    this.loadMetrics();
  }

  // Charger les métriques depuis le fichier
  loadMetrics() {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        const data = fs.readFileSync(METRICS_FILE, 'utf8');
        const savedMetrics = JSON.parse(data);
        this.metrics = { ...this.metrics, ...savedMetrics };
        logger.info('📊 Métriques chargées depuis le fichier');
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des métriques', { error: error.message });
    }
  }

  // Sauvegarder les métriques dans le fichier
  saveMetrics() {
    try {
      // Créer le dossier data s'il n'existe pas
      const dataDir = path.dirname(METRICS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(METRICS_FILE, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde des métriques', { error: error.message });
    }
  }

  // Métriques de scraping
  recordScrapingRun(source, success, jobCount, duration) {
    const scraping = this.metrics.scraping;

    scraping.totalRuns++;
    if (success) {
      scraping.successfulRuns++;
    } else {
      scraping.failedRuns++;
    }

    scraping.totalJobsCollected += jobCount;
    scraping.averageDuration = ((scraping.averageDuration * (scraping.totalRuns - 1)) + duration) / scraping.totalRuns;
    scraping.lastRun = new Date().toISOString();

    // Métriques par source
    if (!scraping.bySource[source]) {
      scraping.bySource[source] = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        totalJobsCollected: 0,
        averageDuration: 0
      };
    }

    const sourceMetrics = scraping.bySource[source];
    sourceMetrics.totalRuns++;
    if (success) {
      sourceMetrics.successfulRuns++;
    } else {
      sourceMetrics.failedRuns++;
    }
    sourceMetrics.totalJobsCollected += jobCount;
    sourceMetrics.averageDuration = ((sourceMetrics.averageDuration * (sourceMetrics.totalRuns - 1)) + duration) / sourceMetrics.totalRuns;

    this.saveMetrics();
    logger.info(`📊 Métriques scraping mises à jour`, { source, success, jobCount, duration });
  }

  // Métriques API
  recordApiRequest(method, endpoint, statusCode, duration) {
    const api = this.metrics.api;

    api.totalRequests++;
    if (statusCode >= 200 && statusCode < 400) {
      api.successfulRequests++;
    } else {
      api.failedRequests++;
    }

    api.averageResponseTime = ((api.averageResponseTime * (api.totalRequests - 1)) + duration) / api.totalRequests;
    api.lastRequest = new Date().toISOString();

    // Métriques par endpoint
    if (!api.endpoints[endpoint]) {
      api.endpoints[endpoint] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0
      };
    }

    const endpointMetrics = api.endpoints[endpoint];
    endpointMetrics.totalRequests++;
    if (statusCode >= 200 && statusCode < 400) {
      endpointMetrics.successfulRequests++;
    } else {
      endpointMetrics.failedRequests++;
    }
    endpointMetrics.averageResponseTime = ((endpointMetrics.averageResponseTime * (endpointMetrics.totalRequests - 1)) + duration) / endpointMetrics.totalRequests;

    this.saveMetrics();
  }

  // Métriques du cache
  recordCacheHit() {
    this.metrics.cache.hits++;
    this.updateCacheStats();
  }

  recordCacheMiss() {
    this.metrics.cache.misses++;
    this.updateCacheStats();
  }

  updateCacheStats() {
    const cache = this.metrics.cache;
    const total = cache.hits + cache.misses;
    cache.hitRatio = total > 0 ? (cache.hits / total) * 100 : 0;
    this.saveMetrics();
  }

  setCacheStats(totalEntries, memoryUsage) {
    this.metrics.cache.totalEntries = totalEntries;
    this.metrics.cache.memoryUsage = memoryUsage;
    this.saveMetrics();
  }

  // Métriques système
  updateSystemStats() {
    const memUsage = process.memoryUsage();
    this.metrics.system.memoryUsage = memUsage.heapUsed;
    this.metrics.system.uptime = process.uptime();
    this.metrics.system.lastUpdate = new Date().toISOString();

    // CPU usage (simplifié)
    this.metrics.system.cpuUsage = process.cpuUsage().user / 1000000; // Convertir en secondes

    this.saveMetrics();
  }

  // Obtenir toutes les métriques
  getAllMetrics() {
    return {
      ...this.metrics,
      summary: {
        scrapingSuccessRate: this.metrics.scraping.totalRuns > 0 ?
          (this.metrics.scraping.successfulRuns / this.metrics.scraping.totalRuns) * 100 : 0,
        apiSuccessRate: this.metrics.api.totalRequests > 0 ?
          (this.metrics.api.successfulRequests / this.metrics.api.totalRequests) * 100 : 0,
        cacheEfficiency: this.metrics.cache.hitRatio,
        systemHealth: this.metrics.system.uptime > 0 ? 'healthy' : 'unknown'
      }
    };
  }

  // Réinitialiser les métriques
  resetMetrics() {
    this.metrics = {
      scraping: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        totalJobsCollected: 0,
        averageDuration: 0,
        lastRun: null,
        bySource: {}
      },
      api: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        endpoints: {},
        lastRequest: null
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRatio: 0,
        totalEntries: 0,
        memoryUsage: 0
      },
      system: {
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        lastUpdate: null
      }
    };

    this.saveMetrics();
    logger.info('🔄 Métriques réinitialisées');
  }

  // Nettoyer les anciennes métriques
  cleanup() {
    // Garder seulement les métriques récentes
    const maxHistory = MAX_METRICS_HISTORY;
    // Cette fonction pourrait être étendue pour nettoyer l'historique des métriques

    logger.info('🧹 Nettoyage des métriques effectué');
  }
}

// Instance singleton
export const metrics = new MetricsCollector();

// Middleware pour mesurer les performances des requêtes API
export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.recordApiRequest(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
};

// Fonction pour mesurer les performances des opérations
export const measurePerformance = async (operationName, operation) => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    logger.info(`⚡ Performance: ${operationName}`, { duration, success: true });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Performance error: ${operationName}`, { duration, error: error.message });
    throw error;
  }
};

// Mise à jour périodique des métriques système
setInterval(() => {
  metrics.updateSystemStats();
}, 60000); // Toutes les minutes

export default metrics;
