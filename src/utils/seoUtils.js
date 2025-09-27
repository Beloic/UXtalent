/**
 * Utilitaires SEO pour optimiser les titres et métadonnées
 */

/**
 * Génère un titre SEO optimisé pour les pages
 * @param {string} title - Titre principal
 * @param {string} type - Type de contenu (profile, job, forum, etc.)
 * @param {string} suffix - Suffixe optionnel
 * @returns {string} Titre SEO optimisé
 */
export const generateSEOTitle = (title, type = '', suffix = 'UX Talent') => {
  const keywords = {
    profile: 'Designer UX/UI',
    job: 'Offre d\'emploi UX/UI',
    forum: 'Forum UX Talent',
    search: 'Analyse de Recherche UX Talent',
    dashboard: 'Tableau de bord UX Talent',
    pricing: 'Tarifs UX Talent',
    faq: 'FAQ UX Talent'
  };

  const keyword = keywords[type] || '';
  
  if (type && keyword) {
    return `${title} - ${keyword}`;
  }
  
  return `${title} - ${suffix}`;
};

/**
 * Génère une description SEO optimisée
 * @param {string} content - Contenu principal
 * @param {string} type - Type de contenu
 * @param {number} maxLength - Longueur maximale (défaut: 160)
 * @returns {string} Description SEO optimisée
 */
export const generateSEODescription = (content, type = '', maxLength = 160) => {
  const prefixes = {
    profile: 'Découvrez le profil de ',
    job: 'Poste de ',
    forum: 'Discussion sur ',
    search: 'Analyse des candidats pour ',
    dashboard: 'Gérez vos recrutements avec '
  };

  const prefix = prefixes[type] || '';
  const fullContent = prefix + content;
  
  if (fullContent.length <= maxLength) {
    return fullContent;
  }
  
  return fullContent.substring(0, maxLength - 3) + '...';
};

/**
 * Génère un alt text SEO optimisé pour les images
 * @param {string} name - Nom de la personne/objet
 * @param {string} type - Type d'image (profile, avatar, screenshot, etc.)
 * @param {string} context - Contexte supplémentaire
 * @returns {string} Alt text SEO optimisé
 */
export const generateSEOAltText = (name, type = '', context = '') => {
  const templates = {
    profile: `Photo de profil de ${name}, designer UX/UI`,
    avatar: `Avatar de ${name}, designer UX/UI`,
    screenshot: `Capture d'écran de ${name} - Plateforme UX Talent`,
    logo: `Logo ${name} - Plateforme de recrutement UX/UI`,
    company: `Logo de l'entreprise ${name}`
  };

  const template = templates[type] || `Image de ${name}`;
  
  if (context) {
    return `${template} - ${context}`;
  }
  
  return template;
};

/**
 * Génère des mots-clés SEO pour une page
 * @param {string} type - Type de page
 * @param {Array} additionalKeywords - Mots-clés supplémentaires
 * @returns {Array} Liste de mots-clés SEO
 */
export const generateSEOKeywords = (type, additionalKeywords = []) => {
  const baseKeywords = [
    'UX Talent',
    'recrutement UX/UI',
    'designer UX',
    'designer UI',
    'emploi UX',
    'emploi UI',
    'France'
  ];

  const typeKeywords = {
    profile: ['profil designer', 'portfolio UX', 'CV designer'],
    job: ['offre emploi', 'poste UX', 'recrutement designer'],
    forum: ['communauté UX', 'discussion design', 'conseils UX'],
    search: ['recherche candidats', 'matching UX', 'sélection designer'],
    dashboard: ['gestion recrutement', 'tableau de bord', 'suivi candidats']
  };

  const keywords = [...baseKeywords];
  
  if (typeKeywords[type]) {
    keywords.push(...typeKeywords[type]);
  }
  
  keywords.push(...additionalKeywords);
  
  return [...new Set(keywords)]; // Supprime les doublons
};

/**
 * Valide la hiérarchie des titres HTML
 * @param {Array} headings - Liste des balises de titre trouvées
 * @returns {Object} Résultat de la validation
 */
export const validateHeadingHierarchy = (headings) => {
  const errors = [];
  let h1Count = 0;
  let lastLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tag.replace('h', ''));
    
    if (heading.tag === 'h1') {
      h1Count++;
      if (h1Count > 1) {
        errors.push(`Multiple H1 found: "${heading.text}"`);
      }
    }
    
    if (level > lastLevel + 1) {
      errors.push(`Heading level skipped: ${heading.tag} "${heading.text}"`);
    }
    
    lastLevel = level;
  });

  return {
    isValid: errors.length === 0,
    errors,
    h1Count,
    recommendations: h1Count === 0 ? ['Add a main H1 heading'] : []
  };
};

/**
 * Optimise le contenu pour le SEO
 * @param {string} content - Contenu à optimiser
 * @param {string} keyword - Mot-clé principal
 * @param {number} targetDensity - Densité cible (défaut: 1-3%)
 * @returns {Object} Résultat de l'optimisation
 */
export const optimizeContentSEO = (content, keyword, targetDensity = 2) => {
  const wordCount = content.split(' ').length;
  const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  const currentDensity = (keywordCount / wordCount) * 100;
  
  const recommendations = [];
  
  if (currentDensity < targetDensity) {
    recommendations.push(`Augmenter la densité du mot-clé "${keyword}" (actuellement ${currentDensity.toFixed(1)}%)`);
  } else if (currentDensity > targetDensity + 1) {
    recommendations.push(`Réduire la densité du mot-clé "${keyword}" (actuellement ${currentDensity.toFixed(1)}%)`);
  }
  
  return {
    wordCount,
    keywordCount,
    density: currentDensity,
    isOptimized: Math.abs(currentDensity - targetDensity) <= 1,
    recommendations
  };
};
