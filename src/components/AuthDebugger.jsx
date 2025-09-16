import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthToken, checkUserRole, authenticatedFetch } from '../utils/auth';

export default function AuthDebugger() {
  const { user, isAuthenticated, session } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAuthDebug = async () => {
    setLoading(true);
    console.log('🔍 [AuthDebugger] Démarrage du diagnostic d\'authentification...');

    try {
      // Test 1: Informations du contexte Auth
      const contextInfo = {
        isAuthenticated,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role,
          email_confirmed: user.email_confirmed_at ? true : false
        } : null,
        session: session ? {
          hasAccessToken: !!session.access_token,
          tokenPreview: session.access_token ? `${session.access_token.substring(0, 20)}...` : null
        } : null
      };

      // Test 2: Récupération du token avec notre helper
      const tokenResult = await getAuthToken();

      // Test 3: Vérification du rôle
      const roleResult = await checkUserRole(['candidate', 'recruiter', 'admin']);

      // Test 4: Test d'appel API
      let apiTestResult = null;
      try {
        const response = await authenticatedFetch('https://ux-jobs-pro-backend.onrender.com/api/candidates');
        apiTestResult = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };
      } catch (error) {
        apiTestResult = {
          success: false,
          error: error.message
        };
      }

      const debugData = {
        contextInfo,
        tokenResult,
        roleResult,
        apiTestResult,
        timestamp: new Date().toISOString()
      };

      setDebugInfo(debugData);
      console.log('🔍 [AuthDebugger] Résultats du diagnostic:', debugData);

    } catch (error) {
      console.error('❌ [AuthDebugger] Erreur lors du diagnostic:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCandidatesAPI = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('https://ux-jobs-pro-backend.onrender.com/api/candidates');
      const data = await response.json();
      setTestResult({
        success: true,
        status: response.status,
        data: data,
        candidatesCount: data.candidates?.length || 0
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      runAuthDebug();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔐 Diagnostic d'authentification</h3>
        <p className="text-yellow-700">Utilisateur non authentifié. Veuillez vous connecter pour effectuer le diagnostic.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Diagnostic d'authentification</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={runAuthDebug}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
          </button>
          
          <button
            onClick={testCandidatesAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Tester API candidats'}
          </button>
        </div>

        {debugInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Résultats du diagnostic:</h4>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className="font-semibold mb-2">
              {testResult.success ? '✅ Test API réussi' : '❌ Test API échoué'}
            </h4>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
