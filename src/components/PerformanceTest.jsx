import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecruiter } from '../hooks/useRecruiter';
import { useRecruiterOptimized } from '../hooks/useRecruiterOptimized';

/**
 * Composant de test pour comparer les performances entre les hooks standard et optimisé
 */
const PerformanceTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Hook standard
  const standardHook = useRecruiter();
  
  // Hook optimisé
  const optimizedHook = useRecruiterOptimized();

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Hook Standard',
        description: 'Chargement séquentiel des données',
        hook: standardHook
      },
      {
        name: 'Hook Optimisé',
        description: 'Chargement parallèle avec cache',
        hook: optimizedHook
      }
    ];

    const results = [];

    for (const test of tests) {
      setCurrentTest(`Test: ${test.name}`);
      
      const startTime = Date.now();
      
      // Attendre que le chargement soit terminé
      await new Promise((resolve) => {
        const checkLoading = () => {
          if (!test.hook.loading) {
            resolve();
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      results.push({
        name: test.name,
        description: test.description,
        loadTime,
        success: !test.hook.error,
        error: test.hook.error?.message,
        dataSize: JSON.stringify(test.hook.recruiter || {}).length,
        hasCache: test.hook.loadTime !== undefined
      });
      
      // Attendre un peu entre les tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTestResults(results);
    setIsRunning(false);
    setCurrentTest('');
  };

  const getPerformanceColor = (loadTime) => {
    if (loadTime < 500) return 'text-green-600';
    if (loadTime < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceRating = (loadTime) => {
    if (loadTime < 500) return '🚀 Excellent';
    if (loadTime < 1000) return '⚡ Bon';
    if (loadTime < 2000) return '🐌 Moyen';
    return '🐢 Lent';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🚀 Test de Performance - Chargement des Données
          </h1>
          
          {/* Contrôles de test */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Tests de Performance
            </h2>
            
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={runPerformanceTest}
                disabled={isRunning}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isRunning
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Test en cours...' : 'Lancer le Test'}
              </button>
              
              {isRunning && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">{currentTest}</span>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Ce qui est testé :</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>Hook Standard :</strong> Chargement séquentiel (profil → stats → permissions)</li>
                <li>• <strong>Hook Optimisé :</strong> Chargement parallèle avec mise en cache</li>
                <li>• <strong>Métriques :</strong> Temps de chargement, taille des données, gestion d'erreurs</li>
              </ul>
            </div>
          </div>

          {/* Résultats des tests */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                📊 Résultats des Tests
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testResults.map((result, index) => (
                  <motion.div
                    key={result.name}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`border-2 rounded-lg p-6 ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {result.name}
                      </h3>
                      <div className={`text-sm font-semibold ${getPerformanceColor(result.loadTime)}`}>
                        {getPerformanceRating(result.loadTime)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {result.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Temps de chargement :</span>
                        <span className={`font-semibold ${getPerformanceColor(result.loadTime)}`}>
                          {result.loadTime}ms
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taille des données :</span>
                        <span className="font-semibold text-gray-900">
                          {(result.dataSize / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cache activé :</span>
                        <span className="font-semibold text-gray-900">
                          {result.hasCache ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Statut :</span>
                        <span className={`font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? '✅ Succès' : '❌ Erreur'}
                        </span>
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
                          <strong>Erreur :</strong> {result.error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Comparaison */}
              {testResults.length === 2 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">📈 Comparaison</h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Amélioration :</strong> {
                        testResults[1].loadTime < testResults[0].loadTime
                          ? `${Math.round(((testResults[0].loadTime - testResults[1].loadTime) / testResults[0].loadTime) * 100)}% plus rapide`
                          : 'Pas d\'amélioration détectée'
                      }
                    </p>
                    <p>
                      <strong>Réduction de la taille :</strong> {
                        testResults[1].dataSize < testResults[0].dataSize
                          ? `${Math.round(((testResults[0].dataSize - testResults[1].dataSize) / testResults[0].dataSize) * 100)}% moins de données`
                          : 'Même taille de données'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* État actuel des hooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Hook Standard
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chargement :</span>
                  <span className={standardHook.loading ? 'text-blue-600' : 'text-green-600'}>
                    {standardHook.loading ? 'En cours...' : 'Terminé'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Données :</span>
                  <span className="text-gray-900">
                    {standardHook.recruiter ? '✅ Chargées' : '❌ Non chargées'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erreur :</span>
                  <span className={standardHook.error ? 'text-red-600' : 'text-green-600'}>
                    {standardHook.error ? '❌ Oui' : '✅ Non'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Hook Optimisé
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chargement :</span>
                  <span className={optimizedHook.loading ? 'text-blue-600' : 'text-green-600'}>
                    {optimizedHook.loading ? 'En cours...' : 'Terminé'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Données :</span>
                  <span className="text-gray-900">
                    {optimizedHook.recruiter ? '✅ Chargées' : '❌ Non chargées'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temps de chargement :</span>
                  <span className="text-gray-900">
                    {optimizedHook.loadTime ? `${optimizedHook.loadTime}ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erreur :</span>
                  <span className={optimizedHook.error ? 'text-red-600' : 'text-green-600'}>
                    {optimizedHook.error ? '❌ Oui' : '✅ Non'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PerformanceTest;
