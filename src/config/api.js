// Configuration des URLs de l'API
// Utiliser l'API Render en production, localhost en développement
const DEFAULT_API_BASE_URL = 'https://ux-jobs-pro-backend.onrender.com'; // API Render
const LOCAL_API_BASE_URL = 'http://localhost:3001';
const RENDER_API_BASE_URL = 'https://ux-jobs-pro-backend.onrender.com';

// Détecter si on est en développement (localhost)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Utiliser l'API locale en développement, Render en production
const API_BASE_URL = isDevelopment ? LOCAL_API_BASE_URL : DEFAULT_API_BASE_URL;


// Fonction pour construire une URL complète
export const buildApiUrl = (endpoint) => {
  // Endpoints spéciaux qui ne doivent pas avoir de slash final
  const specialEndpoints = ['/me', '/stats', '/permissions'];
  
  // Ajouter un slash final si l'endpoint commence par /api/ et ne contient pas de paramètres de requête
  // mais pas pour les endpoints spéciaux
  const shouldAddSlash = endpoint.startsWith('/api/') && 
                       !endpoint.endsWith('/') && 
                       !endpoint.includes('?') &&
                       !specialEndpoints.some(special => endpoint.endsWith(special));
  
  const normalizedEndpoint = shouldAddSlash ? `${endpoint}/` : endpoint;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

// Fonction synchrone pour les cas où on ne peut pas attendre
export const buildApiUrlSync = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Fonction pour utiliser le backend Render (si nécessaire)
export const buildRenderApiUrl = (endpoint) => {
  return `${RENDER_API_BASE_URL}${endpoint}`;
};

// URLs spécifiques
export const API_ENDPOINTS = {
  CANDIDATES: '/api/candidates/',
  RECRUITERS: '/api/recruiters/',
  JOBS: '/api/jobs/',
  FORUM_POSTS: '/api/forum/posts/',
  FORUM_STATS: '/api/forum/stats/',
  METRICS: '/api/metrics/',
  STATS: '/api/stats/',
  // Endpoints de matching
  MATCHING_CANDIDATES: '/api/matching/candidates/',
  MATCHING_JOBS: '/api/matching/jobs/',
  MATCHING_SCORE: '/api/matching/score/',
  MATCHING_STATS: '/api/matching/stats/',
  MATCHING_FEEDBACK: '/api/matching/feedback/'
};
