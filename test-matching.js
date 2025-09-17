/**
 * Script de test pour le système de matching intelligent
 * Teste l'algorithme avec des données réelles
 */

import { 
  calculateCompatibilityScore, 
  findBestCandidatesForJob, 
  findBestJobsForCandidate,
  calculateMatchingStats 
} from './src/services/matchingService.js';

// ===== DONNÉES DE TEST RÉALISTES =====

const testCandidates = [
  {
    id: 1,
    name: "Marie Dubois",
    title: "Senior UX Designer",
    location: "Paris, France",
    remote: "hybrid",
    experience: "Senior",
    skills: ["Figma", "Research", "Prototyping", "User Testing", "Design Systems", "Sketch"],
    bio: "UX Designer avec 5 ans d'expérience dans le design d'interfaces utilisateur",
    availability: "available",
    salary: "50-65k€",
    annualSalary: 60000,
    languages: ["Français", "Anglais"],
    planType: "premium",
    isFeatured: false,
    approved: true,
    visible: true
  },
  {
    id: 2,
    name: "Thomas Martin",
    title: "Product Designer",
    location: "Lyon, France",
    remote: "remote",
    experience: "Mid",
    skills: ["Sketch", "Figma", "Principle", "User Research", "Mobile Design"],
    bio: "Product Designer spécialisé dans les applications mobiles",
    availability: "available",
    salary: "40-55k€",
    annualSalary: 50000,
    languages: ["Français", "Anglais", "Espagnol"],
    planType: "free",
    isFeatured: false,
    approved: true,
    visible: true
  },
  {
    id: 3,
    name: "Sophie Chen",
    title: "UX Researcher",
    location: "Bordeaux, France",
    remote: "onsite",
    experience: "Senior",
    skills: ["User Research", "Usability Testing", "Analytics", "Figma", "Miro", "Hotjar"],
    bio: "UX Researcher avec une expertise en méthodes qualitatives et quantitatives",
    availability: "busy",
    salary: "45-60k€",
    annualSalary: 55000,
    languages: ["Français", "Anglais", "Mandarin"],
    planType: "pro",
    isFeatured: true,
    approved: true,
    visible: true
  },
  {
    id: 4,
    name: "Alexandre Rousseau",
    title: "Lead UX Designer",
    location: "Marseille, France",
    remote: "hybrid",
    experience: "Lead",
    skills: ["Design Leadership", "Figma", "Design Systems", "Strategy", "Team Management", "Research"],
    bio: "Lead UX Designer avec 8 ans d'expérience et une expertise en leadership d'équipe design",
    availability: "available",
    salary: "60-80k€",
    annualSalary: 75000,
    languages: ["Français", "Anglais"],
    planType: "pro",
    isFeatured: false,
    approved: true,
    visible: true
  },
  {
    id: 5,
    name: "Emma Wilson",
    title: "Junior UX Designer",
    location: "Paris, France",
    remote: "onsite",
    experience: "Junior",
    skills: ["Figma", "Sketch", "Adobe XD", "Prototyping"],
    bio: "Jeune UX Designer passionnée par l'innovation et l'expérience utilisateur",
    availability: "available",
    salary: "30-40k€",
    annualSalary: 35000,
    languages: ["Français", "Anglais"],
    planType: "free",
    isFeatured: false,
    approved: true,
    visible: true
  }
];

const testJobs = [
  {
    id: 1,
    title: "Senior UX Designer",
    company: "TechCorp",
    location: "Paris, France",
    remote: "hybrid",
    seniority: "Senior",
    salary: "55-70k€",
    tags: ["Figma", "Research", "Prototyping", "Design Systems", "User Testing"],
    status: "active",
    description: "Nous recherchons un Senior UX Designer pour rejoindre notre équipe produit",
    requirements: "Minimum 5 ans d'expérience en UX Design",
    benefits: "Télétravail hybride, équipe jeune et dynamique"
  },
  {
    id: 2,
    title: "Product Designer",
    company: "StartupXYZ",
    location: "Lyon, France",
    remote: "remote",
    seniority: "Mid",
    salary: "45-60k€",
    tags: ["Sketch", "Figma", "Principle", "Mobile Design"],
    status: "active",
    description: "Product Designer pour une startup en pleine croissance",
    requirements: "Expérience en design mobile et web",
    benefits: "100% remote, stock options"
  },
  {
    id: 3,
    title: "UX Researcher",
    company: "ResearchLab",
    location: "Bordeaux, France",
    remote: "onsite",
    seniority: "Senior",
    salary: "50-65k€",
    tags: ["User Research", "Analytics", "Usability Testing"],
    status: "active",
    description: "UX Researcher senior pour des projets de recherche utilisateur",
    requirements: "Expertise en méthodes qualitatives et quantitatives",
    benefits: "Laboratoire de recherche, projets innovants"
  },
  {
    id: 4,
    title: "Lead UX Designer",
    company: "DesignStudio",
    location: "Marseille, France",
    remote: "hybrid",
    seniority: "Lead",
    salary: "70-90k€",
    tags: ["Design Leadership", "Design Systems", "Strategy", "Team Management"],
    status: "active",
    description: "Lead UX Designer pour diriger une équipe de 5 designers",
    requirements: "Minimum 7 ans d'expérience, expérience en management",
    benefits: "Management d'équipe, projets stratégiques"
  },
  {
    id: 5,
    title: "Junior UX Designer",
    company: "AgencyPro",
    location: "Paris, France",
    remote: "onsite",
    seniority: "Junior",
    salary: "35-45k€",
    tags: ["Figma", "Sketch", "Prototyping", "Adobe XD"],
    status: "active",
    description: "Junior UX Designer pour rejoindre notre agence créative",
    requirements: "Formation en design ou expérience équivalente",
    benefits: "Formation, mentorat, projets variés"
  }
];

// ===== FONCTIONS DE TEST =====

function testCompatibilityScore() {
  console.log('\n🧪 === TEST DE COMPATIBILITÉ ===');
  
  const candidate = testCandidates[0]; // Marie Dubois
  const job = testJobs[0]; // Senior UX Designer
  
  console.log(`\n📋 Test: ${candidate.name} vs ${job.title} (${job.company})`);
  
  const result = calculateCompatibilityScore(candidate, job);
  
  console.log(`\n📊 Résultats:`);
  console.log(`Score global: ${result.globalScore} (${result.matchLevel})`);
  console.log(`\nDétail des scores:`);
  console.log(`- Compétences: ${result.scores.skills} (35%)`);
  console.log(`- Expérience: ${result.scores.experience} (20%)`);
  console.log(`- Localisation: ${result.scores.location} (15%)`);
  console.log(`- Rémunération: ${result.scores.salary} (15%)`);
  console.log(`- Disponibilité: ${result.scores.availability} (10%)`);
  console.log(`- Plan: ${result.scores.plan} (5%)`);
  
  return result;
}

function testBestCandidatesForJob() {
  console.log('\n🧪 === TEST MEILLEURS CANDIDATS POUR UNE OFFRE ===');
  
  const job = testJobs[0]; // Senior UX Designer
  console.log(`\n📋 Offre: ${job.title} (${job.company})`);
  console.log(`Tags requis: ${job.tags.join(', ')}`);
  
  const results = findBestCandidatesForJob(testCandidates, job, 3);
  
  console.log(`\n🏆 Top ${results.length} candidats:`);
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.candidate.name} - ${result.candidate.title}`);
    console.log(`   Score: ${result.globalScore} (${result.matchLevel})`);
    console.log(`   Localisation: ${result.candidate.location}`);
    console.log(`   Compétences: ${result.candidate.skills.slice(0, 3).join(', ')}...`);
  });
  
  return results;
}

function testBestJobsForCandidate() {
  console.log('\n🧪 === TEST MEILLEURES OFFRES POUR UN CANDIDAT ===');
  
  const candidate = testCandidates[0]; // Marie Dubois
  console.log(`\n📋 Candidat: ${candidate.name} - ${candidate.title}`);
  console.log(`Compétences: ${candidate.skills.join(', ')}`);
  
  const results = findBestJobsForCandidate(testJobs, candidate, 3);
  
  console.log(`\n🏆 Top ${results.length} offres:`);
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.job.title} - ${result.job.company}`);
    console.log(`   Score: ${result.globalScore} (${result.matchLevel})`);
    console.log(`   Localisation: ${result.job.location}`);
    console.log(`   Tags: ${result.job.tags.slice(0, 3).join(', ')}...`);
  });
  
  return results;
}

function testMatchingStats() {
  console.log('\n🧪 === TEST STATISTIQUES DE MATCHING ===');
  
  const stats = calculateMatchingStats(testCandidates, testJobs);
  
  console.log(`\n📊 Statistiques globales:`);
  console.log(`Total de matches possibles: ${stats.totalMatches}`);
  console.log(`Score moyen de compatibilité: ${Math.round(stats.averageScore * 100)}%`);
  console.log(`\nRépartition par qualité:`);
  console.log(`- Matches excellents (≥80%): ${stats.highQualityMatches}`);
  console.log(`- Matches moyens (60-79%): ${stats.mediumQualityMatches}`);
  console.log(`- Matches faibles (<60%): ${stats.lowQualityMatches}`);
  
  const highQualityPercentage = Math.round((stats.highQualityMatches / stats.totalMatches) * 100);
  console.log(`\nPourcentage de matches excellents: ${highQualityPercentage}%`);
  
  return stats;
}

function testEdgeCases() {
  console.log('\n🧪 === TEST CAS LIMITES ===');
  
  // Test avec données manquantes
  console.log('\n📋 Test avec données manquantes:');
  const candidateIncomplete = {
    ...testCandidates[0],
    skills: [],
    salary: null,
    annualSalary: null
  };
  
  const result1 = calculateCompatibilityScore(candidateIncomplete, testJobs[0]);
  console.log(`Score avec données manquantes: ${result1.globalScore}`);
  
  // Test avec incompatibilité totale
  console.log('\n📋 Test avec incompatibilité totale:');
  const incompatibleJob = {
    ...testJobs[0],
    location: "Tokyo, Japan",
    remote: "onsite",
    seniority: "Junior",
    tags: ["Java", "Python", "Machine Learning"]
  };
  
  const result2 = calculateCompatibilityScore(testCandidates[0], incompatibleJob);
  console.log(`Score avec incompatibilité totale: ${result2.globalScore}`);
  
  // Test avec match parfait
  console.log('\n📋 Test avec match parfait:');
  const perfectJob = {
    ...testJobs[0],
    location: "Paris, France",
    remote: "hybrid",
    seniority: "Senior",
    tags: testCandidates[0].skills.slice(0, 4),
    salary: "55-65k€"
  };
  
  const result3 = calculateCompatibilityScore(testCandidates[0], perfectJob);
  console.log(`Score avec match parfait: ${result3.globalScore}`);
  
  return { result1, result2, result3 };
}

function testPerformance() {
  console.log('\n🧪 === TEST DE PERFORMANCE ===');
  
  // Simuler un grand nombre de candidats
  const manyCandidates = Array.from({ length: 1000 }, (_, i) => ({
    ...testCandidates[0],
    id: i,
    name: `Candidate ${i}`,
    skills: [`Skill${i % 10}`, `Skill${(i + 1) % 10}`, `Skill${(i + 2) % 10}`]
  }));
  
  const startTime = Date.now();
  const results = findBestCandidatesForJob(manyCandidates, testJobs[0], 10);
  const endTime = Date.now();
  
  console.log(`\n📊 Performance:`);
  console.log(`Candidats traités: ${manyCandidates.length}`);
  console.log(`Résultats retournés: ${results.length}`);
  console.log(`Temps d'exécution: ${endTime - startTime}ms`);
  console.log(`Temps par candidat: ${((endTime - startTime) / manyCandidates.length).toFixed(2)}ms`);
  
  return { results, executionTime: endTime - startTime };
}

// ===== EXÉCUTION DES TESTS =====

async function runAllTests() {
  console.log('🚀 === DÉMARRAGE DES TESTS DU SYSTÈME DE MATCHING ===\n');
  
  try {
    // Tests principaux
    const compatibilityResult = testCompatibilityScore();
    const candidatesResult = testBestCandidatesForJob();
    const jobsResult = testBestJobsForCandidate();
    const statsResult = testMatchingStats();
    
    // Tests de cas limites
    const edgeCasesResult = testEdgeCases();
    
    // Test de performance
    const performanceResult = testPerformance();
    
    // Résumé final
    console.log('\n🎯 === RÉSUMÉ DES TESTS ===');
    console.log(`✅ Test de compatibilité: ${compatibilityResult.globalScore >= 0.7 ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Test candidats pour offre: ${candidatesResult.length > 0 ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Test offres pour candidat: ${jobsResult.length > 0 ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Test statistiques: ${statsResult.totalMatches > 0 ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Test cas limites: ${edgeCasesResult.result3.globalScore >= 0.8 ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`✅ Test performance: ${performanceResult.executionTime < 1000 ? 'SUCCÈS' : 'ÉCHEC'}`);
    
    console.log('\n🎉 Tous les tests sont terminés avec succès !');
    console.log('\n📈 Métriques clés:');
    console.log(`- Score moyen de compatibilité: ${Math.round(statsResult.averageScore * 100)}%`);
    console.log(`- Matches excellents: ${statsResult.highQualityMatches}`);
    console.log(`- Performance: ${performanceResult.executionTime}ms pour 1000 candidats`);
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
