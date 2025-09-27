import React from 'react';

/**
 * Composant pour générer un sitemap XML dynamique
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.pages - Liste des pages statiques
 * @param {Array} props.dynamicPages - Liste des pages dynamiques
 * @returns {string} Sitemap XML
 */
export default function Sitemap({ pages = [], dynamicPages = [] }) {
  const baseUrl = 'https://uxtalent.fr';
  const currentDate = new Date().toISOString();
  
  // Pages statiques par défaut
  const defaultPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/recruiters', priority: '0.9', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { url: '/pricing/recruiters', priority: '0.8', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
    { url: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
    { url: '/login', priority: '0.5', changefreq: 'monthly' },
    { url: '/register', priority: '0.6', changefreq: 'monthly' }
  ];
  
  const allPages = [...defaultPages, ...pages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${dynamicPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Fonction pour générer le sitemap côté serveur
 * @param {Array} candidates - Liste des candidats
 * @param {Array} jobs - Liste des offres d'emploi
 * @param {Array} forumPosts - Liste des posts du forum
 * @returns {string} Sitemap XML
 */
export const generateSitemap = (candidates = [], jobs = [], forumPosts = []) => {
  const baseUrl = 'https://uxtalent.fr';
  const currentDate = new Date().toISOString();
  
  // Pages statiques
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/recruiters', priority: '0.9', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { url: '/pricing/recruiters', priority: '0.8', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
    { url: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
    { url: '/login', priority: '0.5', changefreq: 'monthly' },
    { url: '/register', priority: '0.6', changefreq: 'monthly' }
  ];
  
  // Pages dynamiques - profils candidats
  const candidatePages = candidates.map(candidate => ({
    url: `/my-profile/talent/${candidate.id}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: candidate.updated_at || currentDate
  }));
  
  // Pages dynamiques - offres d'emploi
  const jobPages = jobs.map(job => ({
    url: `/recruiter-dashboard/offer/${job.id}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: job.updated_at || currentDate
  }));
  
  // Pages dynamiques - posts du forum
  const forumPages = forumPosts.map(post => ({
    url: `/my-profile/forum/${post.id}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: post.updated_at || currentDate
  }));
  
  const allPages = [...staticPages, ...candidatePages, ...jobPages, ...forumPages];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
};
