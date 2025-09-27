#!/usr/bin/env node

/**
 * Script pour générer le sitemap.xml dynamique
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://uxtalent.fr';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

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

// Fonction pour générer le sitemap XML
function generateSitemap(pages) {
  const currentDate = new Date().toISOString();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Génération du sitemap.xml...');
    
    // Pour l'instant, on génère seulement avec les pages statiques
    // Dans un environnement de production, on pourrait récupérer les pages dynamiques depuis la DB
    const allPages = [...staticPages];
    
    const sitemapXml = generateSitemap(allPages);
    
    // Écrire le fichier
    fs.writeFileSync(OUTPUT_FILE, sitemapXml, 'utf8');
    
    console.log(`✅ Sitemap généré avec succès : ${OUTPUT_FILE}`);
    console.log(`📊 ${allPages.length} pages incluses`);
    
    // Afficher les URLs incluses
    console.log('\n📋 URLs incluses :');
    allPages.forEach(page => {
      console.log(`  - ${BASE_URL}${page.url} (priorité: ${page.priority})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap :', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
