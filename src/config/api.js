// Configuration des URLs de l'API
// Utiliser localhost en développement, production en prod
const DEFAULT_API_BASE_URL = 'https://ux-jobs-pro-backend.onrender.com';
const LOCAL_API_BASE_URL = 'http://localhost:3001';

// Détecter si on est en développement (localhost)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? LOCAL_API_BASE_URL : DEFAULT_API_BASE_URL;


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
  FORUM_POSTS: '/api/forum/posts',
  FORUM_STATS: '/api/forum/stats',
  METRICS: '/api/metrics',
  STATS: '/api/stats',
  // Endpoints de matching
  MATCHING_CANDIDATES: '/api/matching/candidates',
  MATCHING_JOBS: '/api/matching/jobs',
  MATCHING_SCORE: '/api/matching/score',
  MATCHING_STATS: '/api/matching/stats',
  MATCHING_FEEDBACK: '/api/matching/feedback'
};
