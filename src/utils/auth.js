import { supabase } from '../lib/supabase';
import logger from '../logger/clientLogger';

/**
 * Utilitaire pour récupérer un token d'authentification valide
 * @returns {Promise<{token: string|null, error: string|null, user: object|null}>}
 */
export async function getAuthToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { token: null, error: error.message, user: null };
    }

    if (!session) {
      return { token: null, error: 'Aucune session active', user: null };
    }

    if (!session.access_token) {
      return { token: null, error: 'Token d\'accès manquant', user: null };
    }

    // Vérifier la validité du token (optionnel - Supabase le fait automatiquement)
    const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
    
    if (userError || !user) {
      return { token: null, error: 'Token invalide', user: null };
    }

    return { 
      token: session.access_token, 
      error: null, 
      user: user 
    };
  } catch (error) {
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

  const method = (options.method || 'GET').toUpperCase();
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const start = performance.now ? performance.now() : Date.now();

  if (error || !token) {
    logger.error('auth.fetch.token_error', { url, method, error, requestId });
    throw new Error(`Authentification échouée: ${error}`);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const durationMs = (performance.now ? performance.now() : Date.now()) - start;

    logger.info('auth.fetch.response', {
      url,
      method,
      status: res.status,
      ok: res.ok,
      durationMs: Math.round(durationMs),
      requestId
    });

    if (!res.ok) {
      // Essayer de lire un corps JSON/texte pour enrichir le log (sans jeter si erreur de parsing)
      let responseBodySnippet = null;
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.clone().json();
          responseBodySnippet = JSON.stringify(data).slice(0, 500);
        } else {
          const text = await res.clone().text();
          responseBodySnippet = text.slice(0, 500);
        }
      } catch (_) {}

      logger.error('auth.fetch.http_error', {
        url,
        method,
        status: res.status,
        requestId,
        responseBodySnippet
      });
    }

    return res;
  } catch (e) {
    const durationMs = (performance.now ? performance.now() : Date.now()) - start;
    logger.error('auth.fetch.network_error', { url, method, error: e.message, durationMs: Math.round(durationMs), requestId });
    throw e;
  }
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
