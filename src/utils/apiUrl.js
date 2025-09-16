// Utilitaire pour obtenir l'URL de base de l'API selon l'environnement
export const getApiBaseUrl = () => {
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

// Fonction pour construire une URL API complète
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Fonction pour remplacer les URLs hardcodées dans les fetch
export const apiUrl = (endpoint) => {
  return buildApiUrl(endpoint);
};
