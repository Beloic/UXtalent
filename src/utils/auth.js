import { supabase } from '../lib/supabase';

/**
 * Utilitaire pour récupérer un token d'authentification valide
 * @returns {Promise<{token: string|null, error: string|null, user: object|null}>}
 */
export async function getAuthToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('🔐 [getAuthToken] Erreur lors de la récupération de la session:', error);
      return { token: null, error: error.message, user: null };
    }

    if (!session) {
      console.log('🔐 [getAuthToken] Aucune session active');
      return { token: null, error: 'Aucune session active', user: null };
    }

    if (!session.access_token) {
      console.log('🔐 [getAuthToken] Session sans access_token');
      return { token: null, error: 'Token d\'accès manquant', user: null };
    }

    // Vérifier la validité du token (optionnel - Supabase le fait automatiquement)
    const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
    
    if (userError || !user) {
      console.error('🔐 [getAuthToken] Token invalide:', userError);
      return { token: null, error: 'Token invalide', user: null };
    }

    console.log('✅ [getAuthToken] Token valide récupéré pour:', user.email);
    return { 
      token: session.access_token, 
      error: null, 
      user: user 
    };
  } catch (error) {
    console.error('🔐 [getAuthToken] Erreur inattendue:', error);
    return { token: null, error: error.message, user: null };
  }
}

/**
 * Utilitaire pour faire des requêtes API authentifiées
 * @param {string} url - URL de l'API
 * @param {object} options - Options fetch (method, body, etc.)
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(url, options = {}) {
  const { token, error, user } = await getAuthToken();
  
  if (error || !token) {
    console.error('🔐 [authenticatedFetch] Impossible de récupérer le token:', error);
    throw new Error(`Authentification échouée: ${error}`);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  console.log('📡 [authenticatedFetch] Requête vers:', url, {
    method: options.method || 'GET',
    hasAuth: !!token,
    userEmail: user?.email
  });

  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Vérifier si l'utilisateur est authentifié et a le bon rôle
 * @param {string|string[]} requiredRoles - Rôle(s) requis
 * @returns {Promise<{isAuthenticated: boolean, hasRole: boolean, user: object|null, error: string|null}>}
 */
export async function checkUserRole(requiredRoles) {
  const { token, error, user } = await getAuthToken();
  
  if (error || !token || !user) {
    return {
      isAuthenticated: false,
      hasRole: false,
      user: null,
      error: error || 'Non authentifié'
    };
  }

  const userRole = user.user_metadata?.role;
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const hasRole = userRole && rolesArray.includes(userRole);

  return {
    isAuthenticated: true,
    hasRole,
    user,
    error: null,
    userRole
  };
}
