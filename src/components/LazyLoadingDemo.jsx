import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { getLoadingMessage, getErrorMessage } from '../config/lazyLoading';

// Composants lourds simulés pour la démonstration
const HeavyComponent1 = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div className="p-8 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Composant Lourd 1
            </h3>
            <p className="text-blue-700">
              Ce composant simule un chargement lourd avec un délai de 2 secondes.
            </p>
            <div className="mt-4 p-4 bg-blue-100 rounded">
              <p className="text-sm text-blue-800">
                Contenu complexe avec beaucoup de données et de logique métier.
              </p>
            </div>
          </div>
        )
      });
    }, 2000);
  })
);

const HeavyComponent2 = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div className="p-8 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">
              Composant Lourd 2
            </h3>
            <p className="text-green-700">
              Ce composant simule un chargement lourd avec un délai de 3 secondes.
            </p>
            <div className="mt-4 p-4 bg-green-100 rounded">
              <p className="text-sm text-green-800">
                Autre contenu complexe avec des composants et des hooks personnalisés.
              </p>
            </div>
          </div>
        )
      });
    }, 3000);
  })
);

const HeavyComponent3 = lazy(() => 
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simuler une erreur de chargement
      reject(new Error('Erreur de chargement simulée'));
    }, 1500);
  })
);

const LazyLoadingDemo = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [showErrorDemo, setShowErrorDemo] = useState(false);

  const components = [
    { id: 'component1', name: 'Composant 1', component: HeavyComponent1 },
    { id: 'component2', name: 'Composant 2', component: HeavyComponent2 },
    { id: 'component3', name: 'Composant 3 (Erreur)', component: HeavyComponent3 }
  ];

  const handleComponentLoad = (componentId) => {
  };

  const handleComponentError = (error) => {
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Démonstration du Lazy Loading
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Composants disponibles
          </h2>
          <p className="text-gray-600 mb-6">
            Cliquez sur un composant pour le charger de manière paresseuse.
            Observez les différents états de chargement et les animations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {components.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setActiveComponent(comp.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  activeComponent === comp.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold mb-2">{comp.name}</h3>
                <p className="text-sm text-gray-600">
                  {comp.id === 'component3' 
                    ? 'Simule une erreur de chargement'
                    : 'Chargement paresseux avec délai'
                  }
                </p>
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setActiveComponent(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Zone d'affichage des composants */}
        <div className="min-h-96 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Zone de chargement
          </h3>
          
          {activeComponent ? (
            <Suspense 
              fallback={
                <LoadingSpinner 
                  message={getLoadingMessage(activeComponent)} 
                />
              }
            >
              <motion.div
                key={activeComponent}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {components.find(comp => comp.id === activeComponent)?.component && 
                  React.createElement(
                    components.find(comp => comp.id === activeComponent).component,
                    {
                      onLoad: () => handleComponentLoad(activeComponent),
                      onError: handleComponentError
                    }
                  )
                }
              </motion.div>
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-lg">Sélectionnez un composant pour commencer</p>
                <p className="text-sm mt-2">
                  Le lazy loading permet de charger les composants uniquement quand ils sont nécessaires
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informations sur les performances */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Avantages du Lazy Loading
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Performance</h4>
              <ul className="space-y-1">
                <li>• Réduction de la taille du bundle initial</li>
                <li>• Chargement plus rapide de la page d'accueil</li>
                <li>• Amélioration du First Contentful Paint</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Expérience utilisateur</h4>
              <ul className="space-y-1">
                <li>• Indicateurs de chargement visuels</li>
                <li>• Gestion des erreurs avec retry</li>
                <li>• Animations fluides</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LazyLoadingDemo;
