import React, { useState, useEffect } from 'react';
import { RecruiterSubscriptionGuard } from './RecruiterSubscriptionGuard';

/**
 * Composant de test pour vérifier le comportement du RecruiterSubscriptionGuard
 */
const SubscriptionGuardTest = () => {
  const [testCase, setTestCase] = useState('loading');
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simuler différents états de recruteur
  const testCases = {
    loading: {
      name: 'Chargement',
      description: 'État initial pendant le chargement des données'
    },
    active: {
      name: 'Abonnement actif',
      description: 'Recruteur avec abonnement actif'
    },
    cancelled: {
      name: 'Abonnement annulé',
      description: 'Recruteur avec abonnement annulé'
    },
    expired: {
      name: 'Abonnement expiré',
      description: 'Recruteur avec abonnement expiré'
    },
    suspended: {
      name: 'Compte suspendu',
      description: 'Recruteur avec compte suspendu'
    }
  };

  // Simuler le chargement des données
  useEffect(() => {
    setLoading(true);
    
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Définir les données selon le cas de test
      switch (testCase) {
        case 'active':
          setRecruiter({
            id: 1,
            subscription_status: 'active',
            status: 'active',
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        case 'cancelled':
          setRecruiter({
            id: 2,
            subscription_status: 'cancelled',
            status: 'active',
            subscription_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        case 'expired':
          setRecruiter({
            id: 3,
            subscription_status: 'expired',
            status: 'active',
            subscription_end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        case 'suspended':
          setRecruiter({
            id: 4,
            subscription_status: 'active',
            status: 'suspended',
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        default:
          setRecruiter(null);
      }
    }, 2000); // 2 secondes de simulation

    return () => clearTimeout(timer);
  }, [testCase]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test du RecruiterSubscriptionGuard
        </h1>
        
        {/* Contrôles de test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cas de test
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(testCases).map(([key, test]) => (
              <button
                key={key}
                onClick={() => setTestCase(key)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  testCase === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold mb-2">{test.name}</h3>
                <p className="text-sm text-gray-600">{test.description}</p>
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">État actuel :</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Cas de test :</strong> {testCases[testCase].name}</p>
              <p><strong>Chargement :</strong> {loading ? 'Oui' : 'Non'}</p>
              <p><strong>Recruteur :</strong> {recruiter ? 'Défini' : 'Null'}</p>
              {recruiter && (
                <>
                  <p><strong>Statut abonnement :</strong> {recruiter.subscription_status}</p>
                  <p><strong>Statut compte :</strong> {recruiter.status}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Zone de test du composant */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Rendu du composant
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg min-h-96">
            <RecruiterSubscriptionGuard 
              recruiter={recruiter} 
              loading={loading}
            >
              <div className="p-8 text-center">
                <div className="text-green-600 text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Accès autorisé
                </h3>
                <p className="text-gray-600">
                  Le contenu protégé s'affiche ici car l'abonnement est actif.
                </p>
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Statut :</strong> {recruiter?.subscription_status} | 
                    <strong> Compte :</strong> {recruiter?.status}
                  </p>
                </div>
              </div>
            </RecruiterSubscriptionGuard>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Instructions de test
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>1. <strong>Chargement :</strong> Affiche un spinner simple pendant 2 secondes</p>
            <p>2. <strong>Abonnement actif :</strong> Affiche le contenu protégé</p>
            <p>3. <strong>Abonnement annulé/expiré :</strong> Affiche la popup "Accès suspendu"</p>
            <p>4. <strong>Compte suspendu :</strong> Affiche la popup "Accès suspendu"</p>
            <p className="mt-4 font-semibold">
              ✅ Le problème de la popup au rechargement devrait être résolu !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGuardTest;
