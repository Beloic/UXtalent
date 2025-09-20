#!/usr/bin/env node

/**
 * Script de test pour démontrer les performances du cache Redis
 * vs cache local
 */

import { redisCache } from '../src/cache/redisCache.js';
import { connectRedis } from '../src/config/redis.js';

// Données de test
const testData = {
  candidates: Array.from({ length: 100 }, (_, i) => ({
    id: `candidate-${i}`,
    name: `Candidat ${i}`,
    email: `candidate${i}@example.com`,
    skills: ['React', 'Node.js', 'TypeScript'],
    experience: 'Senior',
    location: 'Paris, France'
  })),
  jobs: Array.from({ length: 50 }, (_, i) => ({
    id: `job-${i}`,
    title: `Poste ${i}`,
    company: `Entreprise ${i}`,
    location: 'Paris, France',
    tags: ['React', 'Node.js', 'TypeScript'],
    seniority: 'Senior'
  }))
};

async function testRedisPerformance() {
  console.log('🚀 Test des performances Redis Cache\n');
  
  try {
    // Connecter Redis
    await connectRedis();
    console.log('✅ Redis connecté\n');
    
    // Test 1: Mise en cache de données
    console.log('📊 Test 1: Mise en cache de données');
    const startTime = Date.now();
    
    await redisCache.set('test:candidates', testData.candidates);
    await redisCache.set('test:jobs', testData.jobs);
    
    const setTime = Date.now() - startTime;
    console.log(`⏱️  Temps de mise en cache: ${setTime}ms\n`);
    
    // Test 2: Récupération depuis le cache
    console.log('📊 Test 2: Récupération depuis le cache');
    const getStartTime = Date.now();
    
    const cachedCandidates = await redisCache.get('test:candidates');
    const cachedJobs = await redisCache.get('test:jobs');
    
    const getTime = Date.now() - getStartTime;
    console.log(`⏱️  Temps de récupération: ${getTime}ms`);
    console.log(`📈 Données récupérées: ${cachedCandidates.length} candidats, ${cachedJobs.length} offres\n`);
    
    // Test 3: Test de charge (1000 requêtes)
    console.log('📊 Test 3: Test de charge (1000 requêtes)');
    const loadStartTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(redisCache.get('test:candidates'));
    }
    
    await Promise.all(promises);
    const loadTime = Date.now() - loadStartTime;
    console.log(`⏱️  Temps pour 1000 requêtes: ${loadTime}ms`);
    console.log(`📈 Moyenne par requête: ${(loadTime / 1000).toFixed(2)}ms\n`);
    
    // Test 4: Statistiques Redis
    console.log('📊 Test 4: Statistiques Redis');
    const stats = await redisCache.getStats();
    console.log(`📈 Entrées totales: ${stats.totalEntries}`);
    console.log(`💾 Utilisation mémoire: ${stats.memoryUsage}MB`);
    console.log(`🎯 Taux de hit: ${stats.hitRatio}%\n`);
    
    // Test 5: Comparaison avec/sans cache
    console.log('📊 Test 5: Comparaison performances');
    
    // Simuler une requête sans cache (simulation)
    const noCacheStart = Date.now();
    // Simulation d'une requête DB qui prend 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
    const noCacheTime = Date.now() - noCacheStart;
    
    // Requête avec cache
    const withCacheStart = Date.now();
    await redisCache.get('test:candidates');
    const withCacheTime = Date.now() - withCacheStart;
    
    console.log(`⏱️  Sans cache (simulation): ${noCacheTime}ms`);
    console.log(`⏱️  Avec cache Redis: ${withCacheTime}ms`);
    console.log(`🚀 Amélioration: ${Math.round((noCacheTime / withCacheTime) * 100)}x plus rapide\n`);
    
    // Nettoyage
    await redisCache.delete('test:candidates');
    await redisCache.delete('test:jobs');
    console.log('🧹 Données de test supprimées\n');
    
    console.log('✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests
testRedisPerformance().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
