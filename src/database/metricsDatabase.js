import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METRICS_FILE = path.join(__dirname, '../../data/metrics.json');

// Initialiser les métriques si le fichier n'existe pas
const initializeMetrics = () => {
  if (!fs.existsSync(METRICS_FILE)) {
    const initialMetrics = {
      requests: {
        total: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
        byHour: {}
      },
      performance: {
        averageResponseTime: 0,
        slowestRequests: [],
        fastestRequests: []
      },
      errors: {
        total: 0,
        byType: {},
        byRoute: {}
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(METRICS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(METRICS_FILE, JSON.stringify(initialMetrics, null, 2));
    return initialMetrics;
  }
  
  return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
};

// Charger les métriques depuis la base de données
export const loadMetrics = () => {
  try {
    return initializeMetrics();
  } catch (error) {
    console.error('Erreur lors du chargement des métriques:', error);
    return initializeMetrics();
  }
};

// Sauvegarder les métriques dans la base de données
export const saveMetrics = (metrics) => {
  try {
    metrics.lastUpdated = new Date().toISOString();
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des métriques:', error);
  }
};

// Enregistrer une requête
export const recordRequest = (method, route, statusCode, duration) => {
  const metrics = loadMetrics();
  const now = new Date();
  const hour = now.getHours();
  
  // Incrémenter le total
  metrics.requests.total++;
  
  // Enregistrer par méthode
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
  
  // Enregistrer par route
  metrics.requests.byRoute[route] = (metrics.requests.byRoute[route] || 0) + 1;
  
  // Enregistrer par statut
  metrics.requests.byStatus[statusCode] = (metrics.requests.byStatus[statusCode] || 0) + 1;
  
  // Enregistrer par heure
  metrics.requests.byHour[hour] = (metrics.requests.byHour[hour] || 0) + 1;
  
  // Mettre à jour les performances
  const totalRequests = metrics.requests.total;
  const currentAvg = metrics.performance.averageResponseTime;
  metrics.performance.averageResponseTime = 
    (currentAvg * (totalRequests - 1) + duration) / totalRequests;
  
  // Ajouter aux requêtes lentes (garder seulement les 10 plus lentes)
  metrics.performance.slowestRequests.push({
    method,
    route,
    duration,
    timestamp: now.toISOString()
  });
  metrics.performance.slowestRequests.sort((a, b) => b.duration - a.duration);
  metrics.performance.slowestRequests = metrics.performance.slowestRequests.slice(0, 10);
  
  // Ajouter aux requêtes rapides (garder seulement les 10 plus rapides)
  metrics.performance.fastestRequests.push({
    method,
    route,
    duration,
    timestamp: now.toISOString()
  });
  metrics.performance.fastestRequests.sort((a, b) => a.duration - b.duration);
  metrics.performance.fastestRequests = metrics.performance.fastestRequests.slice(0, 10);
  
  saveMetrics(metrics);
};

// Enregistrer une erreur
export const recordError = (errorType, route, error) => {
  const metrics = loadMetrics();
  
  // Incrémenter le total d'erreurs
  metrics.errors.total++;
  
  // Enregistrer par type d'erreur
  metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
  
  // Enregistrer par route
  metrics.errors.byRoute[route] = (metrics.errors.byRoute[route] || 0) + 1;
  
  saveMetrics(metrics);
};

// Obtenir toutes les métriques
export const getAllMetrics = () => {
  return loadMetrics();
};

// Réinitialiser les métriques
export const resetMetrics = () => {
  const initialMetrics = initializeMetrics();
  saveMetrics(initialMetrics);
  return initialMetrics;
};
