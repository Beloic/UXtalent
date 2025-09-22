import { useCallback, useEffect, useState } from 'react';

/**
 * Hook personnalisé pour optimiser le lazy loading avec preloading
 * @param {Function} importFunction - Fonction d'import du composant
 * @param {Object} options - Options de configuration
 * @returns {Object} - État du chargement et fonctions utilitaires
 */
export const useLazyLoading = (importFunction, options = {}) => {
  const {
    preload = false,
    preloadDelay = 1000,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [preloaded, setPreloaded] = useState(false);

  // Fonction de chargement avec retry
  const loadComponent = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await importFunction();
      setIsLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error('Erreur lors du chargement du composant:', err);
      setError(err);
      setIsLoading(false);
      
      // Retry automatique
      if (retryCount < retryAttempts) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadComponent();
        }, retryDelay);
      }
    }
  }, [importFunction, isLoading, retryCount, retryAttempts, retryDelay]);

  // Preloading optionnel
  useEffect(() => {
    if (preload && !preloaded) {
      const timer = setTimeout(() => {
        loadComponent();
        setPreloaded(true);
      }, preloadDelay);

      return () => clearTimeout(timer);
    }
  }, [preload, preloaded, preloadDelay, loadComponent]);

  return {
    isLoading,
    error,
    retryCount,
    loadComponent,
    retry: () => {
      setRetryCount(0);
      setError(null);
      loadComponent();
    }
  };
};

/**
 * Hook pour le preloading intelligent basé sur les interactions utilisateur
 */
export const useSmartPreloading = () => {
  const [preloadedComponents, setPreloadedComponents] = useState(new Set());

  const preloadComponent = useCallback((importFunction, componentName) => {
    if (preloadedComponents.has(componentName)) return;

    // Preload en arrière-plan
    importFunction().then(() => {
      setPreloadedComponents(prev => new Set([...prev, componentName]));
    }).catch(error => {
      console.warn(`Échec du preloading de ${componentName}:`, error);
    });
  }, [preloadedComponents]);

  const isPreloaded = useCallback((componentName) => {
    return preloadedComponents.has(componentName);
  }, [preloadedComponents]);

  return {
    preloadComponent,
    isPreloaded,
    preloadedComponents: Array.from(preloadedComponents)
  };
};

/**
 * Hook pour détecter les connexions lentes et ajuster le comportement
 */
export const useConnectionAwareLoading = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Détection de la vitesse de connexion
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateConnectionStatus = () => {
        // Considérer comme lent si < 1.5 Mbps ou RTT > 200ms
        const isSlow = connection.effectiveType === 'slow-2g' || 
                      connection.effectiveType === '2g' ||
                      connection.downlink < 1.5 ||
                      connection.rtt > 200;
        
        setIsSlowConnection(isSlow);
      };

      updateConnectionStatus();
      connection.addEventListener('change', updateConnectionStatus);

      return () => {
        connection.removeEventListener('change', updateConnectionStatus);
      };
    }
  }, []);

  return {
    isSlowConnection,
    shouldPreload: !isSlowConnection,
    loadingStrategy: isSlowConnection ? 'on-demand' : 'aggressive'
  };
};
