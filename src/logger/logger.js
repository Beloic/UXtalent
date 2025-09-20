import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Configuration du chemin pour Node.js
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Créer le dossier logs s'il n'existe pas
const LOG_DIR = path.join(__dirname, '../../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (Object.keys(meta).length > 0) {
      logMessage += ` | ${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  })
);

// Configuration des transports
const transports = [
  // Console pour le développement
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let logMessage = `${level}: ${message}`;

        if (Object.keys(meta).length > 0) {
          logMessage += ` | ${JSON.stringify(meta)}`;
        }

        return logMessage;
      })
    )
  }),

  // Fichier principal avec rotation quotidienne
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: customFormat
  }),

  // Fichier d'erreurs séparé
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: customFormat
  }),

  // Fichier spécifique pour le scraping
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'scraping-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    level: 'debug',
    format: customFormat
  })
];

// Créer l'instance logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
  exitOnError: false
});

// Fonctions utilitaires pour le logging spécialisé
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

// Middleware pour logger les requêtes HTTP
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logApiRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      req.get('User-Agent')
    );
  });

  next();
};

// Fonction pour obtenir les statistiques de logs
export const getLogStats = () => {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const stats = {
      totalFiles: files.length,
      logFiles: files.filter(f => f.endsWith('.log')).length,
      rotatedFiles: files.filter(f => f.includes('-')).length,
      totalSize: 0
    };

    files.forEach(file => {
      const filePath = path.join(LOG_DIR, file);
      const stat = fs.statSync(filePath);
      stats.totalSize += stat.size;
    });

    return stats;
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques de logs', { error: error.message });
    return { error: error.message };
  }
};

// Fonction pour nettoyer les anciens logs
export const cleanupOldLogs = (maxAgeDays = 30) => {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000; // Convertir en millisecondes
    const now = Date.now();
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(LOG_DIR, file);
      const stat = fs.statSync(filePath);

      if (now - stat.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      logger.info(`🧹 Nettoyage logs: ${deletedCount} fichiers supprimés`);
    }

    return deletedCount;
  } catch (error) {
    logger.error('Erreur lors du nettoyage des anciens logs', { error: error.message });
    return 0;
  }
};

// Gestionnaire d'erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Exception non capturée', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée', { reason, promise });
});

// Export par défaut
export default logger;
