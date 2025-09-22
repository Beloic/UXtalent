import React, { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { useConnectionAwareLoading } from '../hooks/useLazyLoading';

/**
 * Composant wrapper pour le lazy loading optimisé
 */
const LazyComponent = ({ 
  children, 
  fallback, 
  errorFallback,
  preload = false,
  preloadDelay = 1000,
  retryAttempts = 3,
  loadingMessage = "Chargement...",
  errorMessage = "Erreur lors du chargement",
  onLoad,
  onError,
  className = ""
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isSlowConnection, shouldPreload } = useConnectionAwareLoading();

  // Gestion des erreurs avec retry
  const handleError = (error) => {
    console.error('Erreur dans LazyComponent:', error);
    setHasError(true);
    onError?.(error);
  };

  const handleRetry = () => {
    setHasError(false);
    setRetryCount(prev => prev + 1);
  };

  // Preloading intelligent basé sur la connexion
  useEffect(() => {
    if (preload && shouldPreload && !isSlowConnection) {
      const timer = setTimeout(() => {
        // Preload en arrière-plan
        React.lazy(() => Promise.resolve({ default: () => children }));
      }, preloadDelay);

      return () => clearTimeout(timer);
    }
  }, [preload, shouldPreload, isSlowConnection, preloadDelay, children]);

  // Composant de fallback personnalisé
  const DefaultFallback = () => (
    <motion.div
      className={`flex items-center justify-center min-h-screen ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {fallback || <LoadingSpinner message={loadingMessage} />}
    </motion.div>
  );

  // Composant d'erreur personnalisé
  const DefaultErrorFallback = () => (
    <motion.div
      className={`flex flex-col items-center justify-center min-h-screen p-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {errorMessage}
        </h2>
        <p className="text-gray-600 mb-6">
          {retryCount < retryAttempts 
            ? `Tentative ${retryCount + 1}/${retryAttempts}` 
            : "Impossible de charger le composant"
          }
        </p>
        {retryCount < retryAttempts && (
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </motion.div>
  );

  // Error Boundary pour capturer les erreurs
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      handleError(error);
    }

    render() {
      if (this.state.hasError) {
        return errorFallback || <DefaultErrorFallback />;
      }

      return this.props.children;
    }
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<DefaultFallback />}>
        <AnimatePresence mode="wait">
          <motion.div
            key="lazy-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => onLoad?.()}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyComponent;
