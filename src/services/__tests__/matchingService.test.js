/**
 * Tests unitaires pour le service de matching
 */

import { 
  calculateCompatibilityScore, 
  findBestCandidatesForJob, 
  findBestJobsForCandidate,
  calculateMatchingStats 
} from '../matchingService.js';

// ===== DONNÉES DE TEST =====

const testCandidate = {
  id: 1,
  name: "Marie Dubois",
  title: "Senior UX Designer",
  location: "Paris, France",
  remote: "hybrid",
  experience: "Senior",
  skills: ["Figma", "Research", "Prototyping", "User Testing", "Design Systems"],
  bio: "UX Designer avec 5 ans d'expérience",
  availability: "available",
  salary: "50-65k€",
  annualSalary: 60000,
  languages: ["Français", "Anglais"],
  planType: "premium",
  isFeatured: false,
  approved: true,
  visible: true
};

const testJob = {
  id: 1,
  title: "Senior UX Designer",
  company: "TechCorp",
  location: "Paris, France",
  remote: "hybrid",
  seniority: "Senior",
  salary: "55-70k€",
  tags: ["Figma", "Research", "Prototyping", "Design Systems"],
  status: "active"
};

const testCandidates = [
  testCandidate,
  {
    id: 2,
    name: "Thomas Martin",
    title: "Product Designer",
    location: "Lyon, France",
    remote: "remote",
    experience: "Mid",
    skills: ["Sketch", "Figma", "Principle"],
    availability: "available",
    salary: "40-55k€",
    planType: "free",
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
    skills: ["User Research", "Analytics", "Figma"],
    availability: "busy",
    salary: "45-60k€",
    planType: "pro",
    approved: true,
    visible: true
  }
];

const testJobs = [
  testJob,
  {
    id: 2,
    title: "Product Designer",
    company: "StartupXYZ",
    location: "Lyon, France",
    remote: "remote",
    seniority: "Mid",
    salary: "45-60k€",
    tags: ["Sketch", "Figma", "Principle"],
    status: "active"
  },
  {
    id: 3,
    title: "UX Researcher",
    company: "ResearchLab",
    location: "Bordeaux, France",
    remote: "onsite",
    seniority: "Senior",
    salary: "50-65k€",
    tags: ["User Research", "Analytics"],
    status: "active"
  }
];

// ===== TESTS =====

describe('MatchingService', () => {
  describe('calculateCompatibilityScore', () => {
    test('devrait calculer un score élevé pour un match parfait', () => {
      const result = calculateCompatibilityScore(testCandidate, testJob);
      
      expect(result.globalScore).toBeGreaterThan(0.8);
      expect(result.scores.skills).toBeGreaterThan(0.8);
      expect(result.scores.experience).toBe(1.0);
      expect(result.scores.location).toBeGreaterThan(0.8);
      expect(result.matchLevel).toBe('excellent');
    });

    test('devrait calculer un score faible pour un match incompatible', () => {
      const incompatibleJob = {
        ...testJob,
        location: "Tokyo, Japan",
        remote: "onsite",
        seniority: "Junior",
        tags: ["Java", "Python", "Machine Learning"]
      };

      const result = calculateCompatibilityScore(testCandidate, incompatibleJob);
      
      expect(result.globalScore).toBeLessThan(0.5);
      expect(result.scores.skills).toBeLessThan(0.3);
      expect(result.scores.location).toBeLessThan(0.3);
      expect(result.matchLevel).toBe('faible');
    });

    test('devrait gérer les données manquantes', () => {
      const candidateWithMissingData = {
        ...testCandidate,
        skills: [],
        salary: null,
        annualSalary: null
      };

      const result = calculateCompatibilityScore(candidateWithMissingData, testJob);
      
      expect(result.globalScore).toBeGreaterThan(0);
      expect(result.scores.skills).toBe(0);
      expect(result.scores.salary).toBe(0.5);
    });

    test('devrait calculer correctement le score des compétences', () => {
      const candidateSkills = ["Figma", "Research", "Prototyping"];
      const jobTags = ["Figma", "Research", "Prototyping", "Design Systems"];
      
      const result = calculateCompatibilityScore(
        { ...testCandidate, skills: candidateSkills },
        { ...testJob, tags: jobTags }
      );
      
      // 3/4 compétences requises = 75% + bonus pour compétences supplémentaires
      expect(result.scores.skills).toBeGreaterThan(0.7);
      expect(result.scores.skills).toBeLessThan(1.0);
    });

    test('devrait calculer correctement le score d\'expérience', () => {
      // Test candidat sous-qualifié
      const juniorCandidate = { ...testCandidate, experience: "Junior" };
      const result1 = calculateCompatibilityScore(juniorCandidate, testJob);
      expect(result1.scores.experience).toBeLessThan(0.8);

      // Test candidat sur-qualifié
      const leadCandidate = { ...testCandidate, experience: "Lead" };
      const result2 = calculateCompatibilityScore(leadCandidate, testJob);
      expect(result2.scores.experience).toBeGreaterThan(0.6);
      expect(result2.scores.experience).toBeLessThan(1.0);
    });

    test('devrait calculer correctement le score de localisation', () => {
      // Test même ville
      const result1 = calculateCompatibilityScore(testCandidate, testJob);
      expect(result1.scores.location).toBeGreaterThan(0.8);

      // Test villes différentes mais même région
      const lyonJob = { ...testJob, location: "Villeurbanne, France" };
      const result2 = calculateCompatibilityScore(testCandidate, lyonJob);
      expect(result2.scores.location).toBeGreaterThan(0.5);

      // Test villes très éloignées
      const tokyoJob = { ...testJob, location: "Tokyo, Japan" };
      const result3 = calculateCompatibilityScore(testCandidate, tokyoJob);
      expect(result3.scores.location).toBeLessThan(0.5);
    });

    test('devrait calculer correctement le score de rémunération', () => {
      // Test fourchettes qui se chevauchent
      const result1 = calculateCompatibilityScore(testCandidate, testJob);
      expect(result1.scores.salary).toBeGreaterThan(0.7);

      // Test fourchettes incompatibles
      const highSalaryJob = { ...testJob, salary: "100-120k€" };
      const result2 = calculateCompatibilityScore(testCandidate, highSalaryJob);
      expect(result2.scores.salary).toBeLessThan(0.5);
    });

    test('devrait calculer correctement le score de disponibilité', () => {
      const availableCandidate = { ...testCandidate, availability: "available" };
      const result1 = calculateCompatibilityScore(availableCandidate, testJob);
      expect(result1.scores.availability).toBe(1.0);

      const busyCandidate = { ...testCandidate, availability: "busy" };
      const result2 = calculateCompatibilityScore(busyCandidate, testJob);
      expect(result2.scores.availability).toBe(0.3);

      const unavailableCandidate = { ...testCandidate, availability: "unavailable" };
      const result3 = calculateCompatibilityScore(unavailableCandidate, testJob);
      expect(result3.scores.availability).toBe(0.0);
    });

    test('devrait calculer correctement le score du plan', () => {
      const freeCandidate = { ...testCandidate, planType: "free", isFeatured: false };
      const result1 = calculateCompatibilityScore(freeCandidate, testJob);
      expect(result1.scores.plan).toBe(0.4);

      const premiumCandidate = { ...testCandidate, planType: "premium", isFeatured: false };
      const result2 = calculateCompatibilityScore(premiumCandidate, testJob);
      expect(result2.scores.plan).toBe(0.6);

      const featuredCandidate = { ...testCandidate, planType: "free", isFeatured: true };
      const result3 = calculateCompatibilityScore(featuredCandidate, testJob);
      expect(result3.scores.plan).toBe(1.0);
    });
  });

  describe('findBestCandidatesForJob', () => {
    test('devrait retourner les candidats triés par score décroissant', () => {
      const results = findBestCandidatesForJob(testCandidates, testJob, 2);
      
      expect(results).toHaveLength(2);
      expect(results[0].globalScore).toBeGreaterThanOrEqual(results[1].globalScore);
      expect(results[0].candidate.id).toBe(1); // Marie Dubois devrait être en premier
    });

    test('devrait filtrer les candidats non approuvés ou non visibles', () => {
      const candidatesWithInvisible = [
        ...testCandidates,
        {
          id: 4,
          name: "Invisible Candidate",
          approved: false,
          visible: true
        },
        {
          id: 5,
          name: "Hidden Candidate",
          approved: true,
          visible: false
        }
      ];

      const results = findBestCandidatesForJob(candidatesWithInvisible, testJob);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.candidate.approved && r.candidate.visible)).toBe(true);
    });

    test('devrait respecter la limite de résultats', () => {
      const results = findBestCandidatesForJob(testCandidates, testJob, 1);
      expect(results).toHaveLength(1);
    });

    test('devrait filtrer les candidats avec un score trop faible', () => {
      const incompatibleJob = {
        ...testJob,
        location: "Tokyo, Japan",
        tags: ["Java", "Python"]
      };

      const results = findBestCandidatesForJob(testCandidates, incompatibleJob);
      
      // Tous les candidats devraient avoir un score < 0.3 et être filtrés
      expect(results).toHaveLength(0);
    });
  });

  describe('findBestJobsForCandidate', () => {
    test('devrait retourner les offres triées par score décroissant', () => {
      const results = findBestJobsForCandidate(testJobs, testCandidate, 2);
      
      expect(results).toHaveLength(2);
      expect(results[0].globalScore).toBeGreaterThanOrEqual(results[1].globalScore);
    });

    test('devrait filtrer les offres non actives', () => {
      const jobsWithInactive = [
        ...testJobs,
        {
          id: 4,
          title: "Inactive Job",
          status: "closed"
        }
      ];

      const results = findBestJobsForCandidate(jobsWithInactive, testCandidate);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.job.status === "active")).toBe(true);
    });
  });

  describe('calculateMatchingStats', () => {
    test('devrait calculer les statistiques correctement', () => {
      const stats = calculateMatchingStats(testCandidates, testJobs);
      
      expect(stats.totalMatches).toBeGreaterThan(0);
      expect(stats.averageScore).toBeGreaterThan(0);
      expect(stats.averageScore).toBeLessThanOrEqual(1);
      expect(stats.highQualityMatches).toBeGreaterThanOrEqual(0);
      expect(stats.mediumQualityMatches).toBeGreaterThanOrEqual(0);
      expect(stats.lowQualityMatches).toBeGreaterThanOrEqual(0);
      
      // Vérifier que la somme des catégories correspond au total
      const totalCategorized = stats.highQualityMatches + stats.mediumQualityMatches + stats.lowQualityMatches;
      expect(totalCategorized).toBe(stats.totalMatches);
    });

    test('devrait gérer les listes vides', () => {
      const stats = calculateMatchingStats([], []);
      
      expect(stats.totalMatches).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.highQualityMatches).toBe(0);
      expect(stats.mediumQualityMatches).toBe(0);
      expect(stats.lowQualityMatches).toBe(0);
    });
  });

  describe('Fonctions utilitaires', () => {
    test('devrait extraire correctement les villes', () => {
      // Cette fonction est privée, mais on peut tester indirectement via calculateLocationScore
      const parisCandidate = { ...testCandidate, location: "Paris, France" };
      const parisJob = { ...testJob, location: "Paris, France" };
      
      const result = calculateCompatibilityScore(parisCandidate, parisJob);
      expect(result.scores.location).toBeGreaterThan(0.8);
    });

    test('devrait extraire correctement les salaires', () => {
      // Test indirect via calculateSalaryScore
      const candidateWithSalary = { ...testCandidate, salary: "50-65k€" };
      const jobWithSalary = { ...testJob, salary: "55-70k€" };
      
      const result = calculateCompatibilityScore(candidateWithSalary, jobWithSalary);
      expect(result.scores.salary).toBeGreaterThan(0.7);
    });
  });
});

// ===== TESTS DE PERFORMANCE =====

describe('Performance Tests', () => {
  test('devrait traiter un grand nombre de candidats rapidement', () => {
    const startTime = Date.now();
    
    // Simuler 1000 candidats
    const manyCandidates = Array.from({ length: 1000 }, (_, i) => ({
      ...testCandidate,
      id: i,
      name: `Candidate ${i}`,
      skills: [`Skill${i % 10}`, `Skill${(i + 1) % 10}`]
    }));

    const results = findBestCandidatesForJob(manyCandidates, testJob, 10);
    const endTime = Date.now();
    
    expect(results).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(1000); // Moins d'1 seconde
  });
});
