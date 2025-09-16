// Configuration des URLs de l'API selon l'environnement
const getApiBaseUrls = () => {
  // En production (Vercel), utiliser le même domaine
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return [window.location.origin];
  }
  
  // En développement, utiliser localhost
  return [
    'http://localhost:3001',
    'http://localhost:5173'
  ];
};

const API_BASE_URLS = getApiBaseUrls();

// Cache pour l'URL qui fonctionne
let workingApiUrl = null;

// Fonction pour tester si une URL fonctionne
const testApiUrl = async (url) => {
  try {
    const response = await fetch(`${url}/api/jobs`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(2000) // Timeout de 2 secondes
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Fonction pour obtenir l'URL de base de l'API
export const getApiBaseUrl = async () => {
  // Si on a déjà une URL qui fonctionne, l'utiliser
  if (workingApiUrl) {
    return workingApiUrl;
  }
  
  // Essayer chaque URL jusqu'à en trouver une qui fonctionne
  for (const url of API_BASE_URLS) {
    if (await testApiUrl(url)) {
      workingApiUrl = url;
      console.log(`✅ API URL trouvée: ${url}`);
      return url;
    }
  }
  
  // Si aucune URL ne fonctionne, utiliser la première par défaut
  console.warn('⚠️ Aucune URL API ne fonctionne, utilisation de la première par défaut');
  return API_BASE_URLS[0];
};

// URLs spécifiques
export const API_ENDPOINTS = {
  CANDIDATES: '/api/candidates',
  JOBS: '/api/jobs',
  ADMIN_JOBS: '/api/admin/jobs',
  FORUM_POSTS: '/api/forum/posts',
  FORUM_STATS: '/api/forum/stats',
  METRICS: '/api/metrics',
  STATS: '/api/stats'
};

// Fonction utilitaire pour obtenir l'URL de base selon l'environnement
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // En production (Vercel), utiliser le même domaine
    if (window.location.hostname.includes('vercel.app')) {
      return window.location.origin;
    }
    // En développement, utiliser localhost
    return 'http://localhost:3001';
  }
  // Côté serveur, utiliser localhost par défaut
  return 'http://localhost:3001';
};

// Fonction pour construire une URL API complète (asynchrone pour compatibilité)
export const buildApiUrl = async (endpoint) => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Fonction synchrone pour les cas où on ne peut pas attendre
export const buildApiUrlSync = (endpoint) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${endpoint}`;
};
