import { recordMetric, recordError } from '../database/supabaseClient.js';

// Middleware de métriques stateless
export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Intercepter la réponse pour mesurer la durée
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const method = req.method;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;
    
    // Enregistrer la requête de manière asynchrone (non-bloquant)
    setImmediate(() => {
      try {
        recordMetric(method, route, statusCode, duration);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des métriques:', error);
      }
    });
    
    // Appeler la méthode send originale
    return originalSend.call(this, data);
  };
  
  // Intercepter les erreurs
  const originalJson = res.json;
  res.json = function(data) {
    if (res.statusCode >= 400) {
      const method = req.method;
      const route = req.route ? req.route.path : req.path;
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      
      // Enregistrer l'erreur de manière asynchrone (non-bloquant)
      setImmediate(() => {
        try {
          recordError(errorType, route, data);
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de l\'erreur:', error);
        }
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};
