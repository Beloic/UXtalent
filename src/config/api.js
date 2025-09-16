// Configuration des URLs de l'API
const API_BASE_URLS = [
  'https://ux-jobs-pro-backend.onrender.com',
  'http://localhost:3001',
  'http://localhost:5173'
];

// Mode offline temporaire - utilise des données locales si le serveur n'est pas accessible
const OFFLINE_MODE = true;

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

// Fonction pour construire une URL complète
export const buildApiUrl = async (endpoint) => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Fonction synchrone pour les cas où on ne peut pas attendre
export const buildApiUrlSync = (endpoint) => {
  const baseUrl = workingApiUrl || API_BASE_URLS[0];
  return `${baseUrl}${endpoint}`;
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
