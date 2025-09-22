/**
 * Configuration pour l'optimisation du lazy loading
 */

// Composants prioritaires (chargés immédiatement)
export const PRIORITY_COMPONENTS = [
  'LandingPage',
  'RecruiterLandingPage', 
  'LoginPage',
  'RegisterPage',
  'Layout',
  'ProtectedRoute',
  'PublicRoute'
];

// Composants lourds (lazy loading)
export const HEAVY_COMPONENTS = [
  'RecruiterDashboard',
  'MyProfilePage',
  'CandidatesListPage',
  'CandidateDetailPage',
  'ForumPage',
  'JobsPage',
  'JobDetailPage',
  'PublishJobPage',
  'SearchAnalysisPage'
];

// Composants moyens (lazy loading avec preloading)
export const MEDIUM_COMPONENTS = [
  'AddProfilePage',
  'ProfileStatsPage',
  'ForumPostPage'
];

// Configuration des stratégies de chargement
export const LOADING_STRATEGIES = {
  // Chargement immédiat pour les composants critiques
  immediate: {
    components: PRIORITY_COMPONENTS,
    preload: false,
    retryAttempts: 0
  },
  
  // Chargement paresseux pour les composants lourds
  lazy: {
    components: HEAVY_COMPONENTS,
    preload: false,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Chargement paresseux avec preloading pour les composants moyens
  lazyWithPreload: {
    components: MEDIUM_COMPONENTS,
    preload: true,
    preloadDelay: 2000,
    retryAttempts: 2,
    retryDelay: 1500
  }
};

// Messages de chargement personnalisés
export const LOADING_MESSAGES = {
  'RecruiterDashboard': 'Chargement du tableau de bord...',
  'MyProfilePage': 'Chargement du profil...',
  'CandidatesListPage': 'Chargement des candidats...',
  'CandidateDetailPage': 'Chargement du profil candidat...',
  'ForumPage': 'Chargement du forum...',
  'JobsPage': 'Chargement des offres d\'emploi...',
  'JobDetailPage': 'Chargement de l\'offre d\'emploi...',
  'PublishJobPage': 'Chargement du formulaire de publication...',
  'SearchAnalysisPage': 'Chargement de l\'analyse de recherche...',
  'AddProfilePage': 'Chargement du formulaire de profil...',
  'ProfileStatsPage': 'Chargement des statistiques...',
  'ForumPostPage': 'Chargement du post...'
};

// Messages d'erreur personnalisés
export const ERROR_MESSAGES = {
  'RecruiterDashboard': 'Impossible de charger le tableau de bord',
  'MyProfilePage': 'Impossible de charger le profil',
  'CandidatesListPage': 'Impossible de charger la liste des candidats',
  'CandidateDetailPage': 'Impossible de charger le profil candidat',
  'ForumPage': 'Impossible de charger le forum',
  'JobsPage': 'Impossible de charger les offres d\'emploi',
  'JobDetailPage': 'Impossible de charger l\'offre d\'emploi',
  'PublishJobPage': 'Impossible de charger le formulaire de publication',
  'SearchAnalysisPage': 'Impossible de charger l\'analyse de recherche',
  'AddProfilePage': 'Impossible de charger le formulaire de profil',
  'ProfileStatsPage': 'Impossible de charger les statistiques',
  'ForumPostPage': 'Impossible de charger le post'
};

// Configuration des timeouts
export const TIMEOUTS = {
  slowConnection: 10000, // 10s pour connexions lentes
  normalConnection: 5000, // 5s pour connexions normales
  fastConnection: 3000 // 3s pour connexions rapides
};

// Configuration du preloading intelligent
export const PRELOADING_CONFIG = {
  // Délai avant preloading (ms)
  delay: 2000,
  
  // Composants à preloader après interaction utilisateur
  onHover: [
    'CandidateDetailPage',
    'JobDetailPage',
    'ForumPostPage'
  ],
  
  // Composants à preloader après navigation
  onNavigation: [
    'RecruiterDashboard',
    'MyProfilePage',
    'CandidatesListPage'
  ],
  
  // Composants à preloader après connexion
  onAuth: [
    'MyProfilePage',
    'RecruiterDashboard'
  ]
};

// Fonction utilitaire pour obtenir la stratégie de chargement
export const getLoadingStrategy = (componentName) => {
  if (PRIORITY_COMPONENTS.includes(componentName)) {
    return LOADING_STRATEGIES.immediate;
  }
  
  if (HEAVY_COMPONENTS.includes(componentName)) {
    return LOADING_STRATEGIES.lazy;
  }
  
  if (MEDIUM_COMPONENTS.includes(componentName)) {
    return LOADING_STRATEGIES.lazyWithPreload;
  }
  
  // Par défaut, lazy loading
  return LOADING_STRATEGIES.lazy;
};

// Fonction utilitaire pour obtenir le message de chargement
export const getLoadingMessage = (componentName) => {
  return LOADING_MESSAGES[componentName] || 'Chargement...';
};

// Fonction utilitaire pour obtenir le message d'erreur
export const getErrorMessage = (componentName) => {
  return ERROR_MESSAGES[componentName] || 'Erreur lors du chargement';
};
