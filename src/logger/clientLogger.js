// Logger côté client compatible navigateur
// Ne dépend pas des APIs Node.js comme process, fs, path

// Vérifier si on est côté client (navigateur)
const isClient = typeof window !== 'undefined';

// Configuration des niveaux de log
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Niveau de log par défaut
const DEFAULT_LEVEL = 'info';

// Obtenir le niveau de log depuis les variables d'environnement ou localStorage
const getLogLevel = () => {
  if (isClient) {
    // Côté client, utiliser localStorage ou une valeur par défaut
    return localStorage.getItem('LOG_LEVEL') || DEFAULT_LEVEL;
  }
  // Côté serveur, utiliser process.env (mais ce fichier ne devrait pas être utilisé côté serveur)
  return DEFAULT_LEVEL;
};

// Polyfill pour process.env côté client si nécessaire
if (isClient && typeof process === 'undefined') {
  window.process = {
    env: {
      LOG_LEVEL: localStorage.getItem('LOG_LEVEL') || DEFAULT_LEVEL,
      NODE_ENV: 'development'
    }
  };
}

// Formatage des messages de log
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    logMessage += ` | ${JSON.stringify(meta, null, 2)}`;
  }
  
  return logMessage;
};

// Logger principal côté client
class ClientLogger {
  constructor() {
    this.level = getLogLevel();
    this.logs = []; // Stocker les logs en mémoire pour debug
    this.maxLogs = 1000; // Limite de logs en mémoire
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = formatMessage(level, message, meta);
    
    // Afficher aussi dans la console en développement
    if (isClient && process.env.NODE_ENV === 'development') {
      try {
        switch (level) {
          case 'error':
            console.error(formattedMessage);
            break;
          case 'warn':
            console.warn(formattedMessage);
            break;
          case 'info':
            console.info(formattedMessage);
            break;
          case 'debug':
            console.debug(formattedMessage);
            break;
          default:
            console.log(formattedMessage);
        }
      } catch (_) {}
    }

    // Stocker en mémoire pour debug
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    });

    // Limiter le nombre de logs en mémoire
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Obtenir les logs stockés
  getLogs() {
    return this.logs;
  }

  // Vider les logs
  clearLogs() {
    this.logs = [];
  }

  // Changer le niveau de log
  setLevel(level) {
    if (LOG_LEVELS.hasOwnProperty(level)) {
      this.level = level;
      if (isClient) {
        localStorage.setItem('LOG_LEVEL', level);
      }
    }
  }
}

// Créer l'instance du logger côté client
export const logger = new ClientLogger();

// Fonctions utilitaires pour le logging spécialisé (compatibles avec le logger serveur)
export const logScrapingStart = (source, url) => {
  logger.info(`🔍 Début scraping ${source}`, { source, url, type: 'scraping_start' });
};

export const logScrapingEnd = (source, jobCount, duration) => {
  logger.info(`✅ Fin scraping ${source}`, {
    source,
    jobCount,
    duration,
    type: 'scraping_end'
  });
};

export const logScrapingError = (source, error, attempt) => {
  logger.error(`❌ Erreur scraping ${source}`, {
    source,
    error: error.message,
    stack: error.stack,
    attempt,
    type: 'scraping_error'
  });
};

export const logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`⚡ Performance: ${operation}`, {
    operation,
    duration,
    ...metadata,
    type: 'performance'
  });
};

export const logApiRequest = (method, url, statusCode, duration, userAgent) => {
  logger.info(`🌐 API Request: ${method} ${url}`, {
    method,
    url,
    statusCode,
    duration,
    userAgent,
    type: 'api_request'
  });
};

// Middleware pour logger les requêtes HTTP (version simplifiée côté client)
export const requestLogger = (req, res, next) => {
  // Cette fonction ne devrait pas être utilisée côté client
  // Elle est ici pour la compatibilité avec le logger serveur
  logger.warn('requestLogger utilisé côté client - cette fonction est destinée au serveur');
  if (next) next();
};

// Fonctions utilitaires pour les logs
export const getLogStats = () => {
  const logs = logger.getLogs();
  const stats = {
    totalLogs: logs.length,
    errorCount: logs.filter(log => log.level === 'error').length,
    warnCount: logs.filter(log => log.level === 'warn').length,
    infoCount: logs.filter(log => log.level === 'info').length,
    debugCount: logs.filter(log => log.level === 'debug').length
  };
  return stats;
};

export const cleanupOldLogs = () => {
  logger.clearLogs();
  return 0; // Retourner 0 pour la compatibilité avec le logger serveur
};

// Export par défaut
export default logger;
