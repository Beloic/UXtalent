#!/usr/bin/env node

/**
 * Script d'optimisation des performances UX Jobs Pro
 * Analyse et optimise les performances de l'application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const METRICS_FILE = path.join(__dirname, '../data/metrics.json');
const BUNDLE_ANALYSIS_FILE = path.join(__dirname, '../bundle-analysis.json');

/**
 * Analyser les métriques de performance
 */
function analyzePerformanceMetrics() {
  console.log('📊 Analyse des métriques de performance...');
  
  if (!fs.existsSync(METRICS_FILE)) {
    console.log('❌ Fichier de métriques non trouvé');
    return;
  }

  const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
  
  console.log('\n🔍 Métriques actuelles:');
  console.log(`📈 Temps de réponse moyen: ${metrics.performance?.averageResponseTime?.toFixed(2)}ms`);
  console.log(`💾 Cache hit ratio: ${metrics.cache?.hitRatio?.toFixed(2)}%`);
  console.log(`📊 Total requêtes: ${metrics.requests?.total || 0}`);
  
  // Analyser les requêtes les plus lentes
  if (metrics.performance?.slowestRequests?.length > 0) {
    console.log('\n🐌 Requêtes les plus lentes:');
    metrics.performance.slowestRequests.slice(0, 5).forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.route} - ${req.duration}ms`);
    });
  }
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  
  if (metrics.performance?.averageResponseTime > 100) {
    console.log('⚠️  Temps de réponse élevé - Optimiser les requêtes DB');
  }
  
  if (metrics.cache?.hitRatio < 50) {
    console.log('⚠️  Cache hit ratio faible - Améliorer la stratégie de cache');
  }
  
  if (metrics.requests?.total > 1000) {
    console.log('📈 Volume de requêtes élevé - Considérer la mise en cache');
  }
}

/**
 * Analyser la taille du bundle
 */
function analyzeBundleSize() {
  console.log('\n📦 Analyse de la taille du bundle...');
  
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    console.log('❌ Dossier dist non trouvé - Exécutez "npm run build" d\'abord');
    return;
  }

  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.log('❌ Dossier assets non trouvé');
    return;
  }

  const files = fs.readdirSync(assetsDir);
  let totalSize = 0;
  const fileAnalysis = [];

  files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;
    totalSize += stats.size;
    
    fileAnalysis.push({
      name: file,
      size: stats.size,
      sizeKB: sizeKB.toFixed(2)
    });
  });

  // Trier par taille
  fileAnalysis.sort((a, b) => b.size - a.size);

  console.log('\n📊 Analyse des fichiers:');
  fileAnalysis.forEach(file => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const type = file.name.endsWith('.js') ? 'JS' : file.name.endsWith('.css') ? 'CSS' : 'Other';
    console.log(`${type}: ${file.name} - ${file.sizeKB}KB (${sizeMB}MB)`);
  });

  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`\n📈 Taille totale: ${totalSizeMB}MB`);

  // Recommandations
  console.log('\n💡 Recommandations bundle:');
  
  if (totalSize > 2 * 1024 * 1024) { // > 2MB
    console.log('⚠️  Bundle trop lourd - Implémenter le code splitting');
  }
  
  const jsFiles = fileAnalysis.filter(f => f.name.endsWith('.js'));
  const largestJS = jsFiles[0];
  if (largestJS && largestJS.size > 1024 * 1024) { // > 1MB
    console.log(`⚠️  Fichier JS trop lourd: ${largestJS.name} (${(largestJS.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log('   - Séparer les vendors');
    console.log('   - Implémenter le lazy loading');
  }
}

/**
 * Générer un rapport d'optimisation
 */
function generateOptimizationReport() {
  console.log('\n📋 Génération du rapport d\'optimisation...');
  
  const report = {
    timestamp: new Date().toISOString(),
    recommendations: [
      {
        category: 'Bundle Optimization',
        priority: 'HIGH',
        actions: [
          'Implémenter le code splitting avec Vite',
          'Séparer les vendors (React, UI libraries)',
          'Activer la compression gzip/brotli',
          'Optimiser les images et assets'
        ]
      },
      {
        category: 'Database Optimization',
        priority: 'MEDIUM',
        actions: [
          'Optimiser les requêtes N+1 dans le forum',
          'Ajouter des index sur les colonnes fréquemment utilisées',
          'Implémenter la pagination efficace',
          'Utiliser des requêtes avec jointures'
        ]
      },
      {
        category: 'Cache Optimization',
        priority: 'MEDIUM',
        actions: [
          'Améliorer le hit ratio du cache Redis',
          'Implémenter des durées de cache intelligentes',
          'Ajouter un cache côté client',
          'Optimiser les clés de cache'
        ]
      },
      {
        category: 'Network Optimization',
        priority: 'LOW',
        actions: [
          'Activer HTTP/2',
          'Implémenter le service worker',
          'Optimiser les headers de cache',
          'Utiliser un CDN pour les assets statiques'
        ]
      }
    ]
  };

  const reportFile = path.join(__dirname, '../performance-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`✅ Rapport généré: ${reportFile}`);
  
  return report;
}

/**
 * Vérifier les optimisations déjà implémentées
 */
function checkImplementedOptimizations() {
  console.log('\n✅ Vérification des optimisations implémentées...');
  
  const optimizations = {
    'Code Splitting': false,
    'Cache Redis': false,
    'Database Indexing': false,
    'Image Optimization': false,
    'Compression': false
  };

  // Vérifier Vite config
  const viteConfig = path.join(__dirname, '../vite.config.js');
  if (fs.existsSync(viteConfig)) {
    const content = fs.readFileSync(viteConfig, 'utf8');
    if (content.includes('manualChunks')) {
      optimizations['Code Splitting'] = true;
    }
  }

  // Vérifier Redis cache
  const redisCache = path.join(__dirname, '../src/cache/redisCache.js');
  if (fs.existsSync(redisCache)) {
    optimizations['Cache Redis'] = true;
  }

  // Vérifier les optimisations DB
  const supabaseClient = path.join(__dirname, '../src/database/supabaseClient.js');
  if (fs.existsSync(supabaseClient)) {
    const content = fs.readFileSync(supabaseClient, 'utf8');
    if (content.includes('select(') && content.includes('id,')) {
      optimizations['Database Indexing'] = true;
    }
  }

  console.log('\n📊 État des optimisations:');
  Object.entries(optimizations).forEach(([name, implemented]) => {
    const status = implemented ? '✅' : '❌';
    console.log(`${status} ${name}`);
  });

  return optimizations;
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      analyzePerformanceMetrics();
      analyzeBundleSize();
      break;
    case 'report':
      generateOptimizationReport();
      break;
    case 'check':
      checkImplementedOptimizations();
      break;
    case 'all':
      analyzePerformanceMetrics();
      analyzeBundleSize();
      checkImplementedOptimizations();
      generateOptimizationReport();
      break;
    case 'help':
    default:
      console.log('🚀 Script d\'optimisation des performances UX Jobs Pro');
      console.log('');
      console.log('Usage:');
      console.log('  node optimize-performance.js analyze  - Analyser les performances');
      console.log('  node optimize-performance.js report  - Générer un rapport');
      console.log('  node optimize-performance.js check    - Vérifier les optimisations');
      console.log('  node optimize-performance.js all      - Exécuter toutes les analyses');
      console.log('  node optimize-performance.js help     - Afficher cette aide');
      break;
  }
}

export { 
  analyzePerformanceMetrics, 
  analyzeBundleSize, 
  generateOptimizationReport,
  checkImplementedOptimizations 
};
