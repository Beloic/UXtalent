// Configuration des URLs de l'API - Production uniquement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ux-jobs-pro-backend.onrender.com';


// Fonction pour construire une URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Fonction synchrone pour les cas où on ne peut pas attendre
export const buildApiUrlSync = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
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
