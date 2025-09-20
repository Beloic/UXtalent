#!/usr/bin/env node

/**
 * Script de nettoyage automatique des logs
 * Supprime les anciens fichiers de logs selon les règles de rétention
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../logs');

// Configuration de rétention des logs
const RETENTION_RULES = {
  'app-*.log': 14, // 14 jours pour les logs d'application
  'error-*.log': 30, // 30 jours pour les logs d'erreurs
};

/**
 * Nettoie les anciens fichiers de logs selon les règles de rétention
 */
function cleanupLogs() {
  console.log('🧹 Début du nettoyage des logs...');
  
  if (!fs.existsSync(LOG_DIR)) {
    console.log('📁 Dossier logs non trouvé, rien à nettoyer');
    return;
  }

  const files = fs.readdirSync(LOG_DIR);
  let deletedCount = 0;
  const now = Date.now();

  files.forEach(file => {
    if (!file.endsWith('.log')) return;

    const filePath = path.join(LOG_DIR, file);
    const stat = fs.statSync(filePath);
    const fileAge = now - stat.mtime.getTime();

    // Déterminer la règle de rétention selon le type de fichier
    let maxAge = 7; // Par défaut, 7 jours
    
    if (file.startsWith('app-')) {
      maxAge = RETENTION_RULES['app-*.log'] * 24 * 60 * 60 * 1000;
    } else if (file.startsWith('error-')) {
      maxAge = RETENTION_RULES['error-*.log'] * 24 * 60 * 60 * 1000;
    } else {
      maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours par défaut
    }

    if (fileAge > maxAge) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️  Supprimé: ${file} (âge: ${Math.round(fileAge / (24 * 60 * 60 * 1000))} jours)`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${file}:`, error.message);
      }
    }
  });

  console.log(`✅ Nettoyage terminé: ${deletedCount} fichiers supprimés`);
}

/**
 * Affiche les statistiques des logs
 */
function showLogStats() {
  console.log('\n📊 Statistiques des logs:');
  
  if (!fs.existsSync(LOG_DIR)) {
    console.log('📁 Dossier logs non trouvé');
    return;
  }

  const files = fs.readdirSync(LOG_DIR);
  const logFiles = files.filter(f => f.endsWith('.log'));
  
  if (logFiles.length === 0) {
    console.log('📄 Aucun fichier de log trouvé');
    return;
  }

  let totalSize = 0;
  const fileStats = {};

  logFiles.forEach(file => {
    const filePath = path.join(LOG_DIR, file);
    const stat = fs.statSync(filePath);
    const size = stat.size;
    totalSize += size;
    
    const type = file.split('-')[0];
    if (!fileStats[type]) {
      fileStats[type] = { count: 0, size: 0 };
    }
    fileStats[type].count++;
    fileStats[type].size += size;
  });

  console.log(`📄 Total fichiers: ${logFiles.length}`);
  console.log(`💾 Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  Object.entries(fileStats).forEach(([type, stats]) => {
    console.log(`  ${type}: ${stats.count} fichiers, ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  });
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'clean':
      cleanupLogs();
      break;
    case 'stats':
      showLogStats();
      break;
    case 'help':
    default:
      console.log('🧹 Script de nettoyage des logs');
      console.log('');
      console.log('Usage:');
      console.log('  node cleanup-logs.js clean   - Nettoie les anciens logs');
      console.log('  node cleanup-logs.js stats   - Affiche les statistiques');
      console.log('  node cleanup-logs.js help    - Affiche cette aide');
      console.log('');
      console.log('Règles de rétention:');
      console.log('  - app-*.log: 14 jours');
      console.log('  - error-*.log: 30 jours');
      console.log('  - autres: 7 jours');
      break;
  }
}

export { cleanupLogs, showLogStats };
