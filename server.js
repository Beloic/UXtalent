import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { 
  loadCandidates, 
  getCandidateStats, 
  addCandidate, 
  updateCandidate, 
  deleteCandidate,
  updateCandidatePlan,
  addPost,
  updatePost,
  deletePost,
  addReply,
  deleteReply,
  togglePostLike,
  toggleReplyLike,
  incrementPostViews,
  getForumStats,
  getCategories,
  getPosts,
  getPostById,
  getAllMetrics,
  resetMetrics,
  recordMetric,
  getProfileViewsStats,
  getProfileViewsToday,
  getProfileViewsByDay,
  getProfileViewsByPeriod,
  trackProfileView,
  addToFavorites,
  removeFromFavorites,
  getRecruiterFavorites,
  isCandidateFavorited,
} from './src/database/supabaseClient.js';
import {
  loadAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsForCandidate,
  getNextAppointmentForCandidate,
} from './src/database/appointmentsDatabase.js';
import {
  getRecruiterSearches,
  createRecruiterSearch,
  updateRecruiterSearch,
  deleteRecruiterSearch,
  getRecruiterSearchById,
  getRecruiterCompany,
  upsertRecruiterCompany,
  deleteRecruiterCompany,
  getRecruiterSearchStats,
  searchCandidatesByCriteria,
} from './src/database/recruiterDatabase.js';
import { metricsMiddleware } from './src/middleware/metricsMiddleware.js';
import { logger, requestLogger } from './src/logger/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTU4NDAsImV4cCI6MjA3MzE3MTg0MH0.v6886_P_zJuTv-fsZZRydSaVfQ0qLqY56SQJgWePpY8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(metricsMiddleware);

// Middleware de debug pour les routes candidats
app.use('/api/candidates', (req, res, next) => {
  console.log('📋 [CANDIDATES] Requête:', req.method, req.url);
  console.log('📋 [CANDIDATES] Headers:', {
    authorization: req.headers.authorization ? 'Présent' : 'Absent',
    contentType: req.headers['content-type']
  });
  next();
});

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Fonction utilitaire pour générer un ID entier temporaire basé sur l'email
const generateTempUserId = (email) => {
  const userIdHash = email.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(userIdHash) % 10000; // ID entre 0 et 9999
};

// Import du middleware de rôles
import { 
  requireRole, 
  requirePermission, 
  requireOwnership,
  ROLES, 
  PERMISSIONS 
} from './src/middleware/roleMiddleware.js';

// Middleware d'authentification (maintenant géré par requireRole)
const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Middleware d\'authentification appelé');
    console.log('🔐 [AUTH] URL:', req.url);
    console.log('🔐 [AUTH] Method:', req.method);
    
    const authHeader = req.headers.authorization;
    console.log('🔐 [AUTH] Authorization header:', authHeader ? 'Présent' : 'Absent');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH] Token d\'authentification requis');
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    console.log('🔐 [AUTH] Token extrait:', token.substring(0, 20) + '...');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('❌ [AUTH] Token invalide ou utilisateur non trouvé:', error?.message);
      return res.status(401).json({ error: 'Token invalide' });
    }

    console.log('✅ [AUTH] Utilisateur authentifié:', user.email);
    console.log('✅ [AUTH] Rôle utilisateur:', user.user_metadata?.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Erreur d\'authentification:', error);
    return res.status(401).json({ error: 'Erreur d\'authentification' });
  }
};

// Serveur stateless - pas de données en mémoire

// Routes API

// GET /api/candidates - Récupérer tous les candidats (stateless)
app.get('/api/candidates', async (req, res) => {
  try {
    // Charger les données depuis la DB à chaque requête (stateless)
    const CANDIDATES = await loadCandidates();

    const { search, remote, experience, availability, location, salaryRange, sortBy = 'recent' } = req.query;

    let filteredCandidates = [...CANDIDATES];

    // Filtrage par recherche
    if (search) {
      const query = search.toLowerCase();
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.title.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query) ||
        candidate.bio.toLowerCase().includes(query) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Filtrage par remote
    if (remote) {
      const remoteFilters = Array.isArray(remote) ? remote : [remote];
      filteredCandidates = filteredCandidates.filter(candidate => remoteFilters.includes(candidate.remote));
    }

    // Filtrage par expérience
    if (experience) {
      const experienceFilters = Array.isArray(experience) ? experience : [experience];
      filteredCandidates = filteredCandidates.filter(candidate => experienceFilters.includes(candidate.experience));
    }

    // Filtrage par disponibilité
    if (availability) {
      const availabilityFilters = Array.isArray(availability) ? availability : [availability];
      filteredCandidates = filteredCandidates.filter(candidate => availabilityFilters.includes(candidate.availability));
    }

    // Filtrage par localisation
    if (location) {
      const locationFilters = Array.isArray(location) ? location : [location];
      filteredCandidates = filteredCandidates.filter(candidate => 
        locationFilters.some(loc => candidate.location.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    // Filtrage par fourchette salariale
    if (salaryRange) {
      const salaryFilters = Array.isArray(salaryRange) ? salaryRange : [salaryRange];
      filteredCandidates = filteredCandidates.filter(candidate => {
        // Utiliser annualSalary en priorité, sinon dailyRate converti en annuel (x 220 jours)
        const candidateSalary = candidate.annualSalary || (candidate.dailyRate ? candidate.dailyRate * 220 : null);
        if (!candidateSalary) return false;
        
        // Convertir les fourchettes en plages numériques pour comparaison
        const getSalaryRange = (salary) => {
          if (typeof salary === 'string') {
            // Format "50-65k€" ou "50-65k"
            const match = salary.match(/(\d+)-(\d+)/);
            if (match) {
              return { min: parseInt(match[1]) * 1000, max: parseInt(match[2]) * 1000 };
            }
            // Format "45" (juste un nombre)
            const singleMatch = salary.match(/(\d+)/);
            if (singleMatch) {
              const num = parseInt(singleMatch[1]) * 1000;
              return { min: num, max: num };
            }
          }
          return null;
        };
        
        return salaryFilters.some(range => {
          const filterRange = getSalaryRange(range);
          if (!filterRange) return false;
          
          // Vérifier si le salaire du candidat est dans la fourchette
          return candidateSalary >= filterRange.min && candidateSalary <= filterRange.max;
        });
      });
    }

    // Vérifier l'authentification avec système de rôles
    const authHeader = req.headers.authorization;
    let visibleCandidates, totalHiddenCandidates;
    let isAuthenticated = false;
    let userRole = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Vérifier le token admin spécial
      if (token === 'admin-token') {
        console.log('🔑 Token admin détecté - accès complet à TOUS les candidats');
        userRole = ROLES.ADMIN;
        visibleCandidates = filteredCandidates; // Tous les candidats, même non approuvés
        totalHiddenCandidates = 0;
        isAuthenticated = true;
      } else {
        // Récupérer l'utilisateur et son rôle depuis le token
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !authUser) {
          console.log('❌ Token invalide');
          // Retourner au mode freemium
          visibleCandidates = filteredCandidates.filter(c => c.approved === true);
          totalHiddenCandidates = filteredCandidates.length - visibleCandidates.length;
          isAuthenticated = false;
        } else {
          userRole = authUser.user_metadata?.role;
          console.log(`✅ Utilisateur authentifié avec le rôle: ${userRole}`);
          
          if (userRole === ROLES.RECRUITER) {
            // Les recruteurs voient tous les candidats approuvés
            visibleCandidates = filteredCandidates.filter(c => c.approved === true);
            totalHiddenCandidates = filteredCandidates.length - visibleCandidates.length;
            isAuthenticated = true;
          } else if (userRole === ROLES.CANDIDATE) {
            // Les candidats voient seulement les premiers candidats approuvés + leur propre profil
            const approvedCandidates = filteredCandidates.filter(c => c.approved === true);
            const ownProfile = filteredCandidates.filter(c => c.userId === authUser.id);
            
            // Limiter à 4 profils complets pour les candidats
            const maxVisibleForCandidates = 4;
            visibleCandidates = [
              ...approvedCandidates.slice(0, maxVisibleForCandidates),
              ...ownProfile.filter(c => !approvedCandidates.slice(0, maxVisibleForCandidates).some(ac => ac.id === c.id))
            ];
            
            totalHiddenCandidates = approvedCandidates.length - maxVisibleForCandidates;
            isAuthenticated = true;
          } else {
            // Rôle non reconnu, mode freemium
            console.log(`⚠️ Rôle non reconnu: ${userRole}`);
            visibleCandidates = filteredCandidates.filter(c => c.approved === true);
            totalHiddenCandidates = filteredCandidates.length - visibleCandidates.length;
            isAuthenticated = false;
          }
        }
      }
    } else {
      // Pas d'authentification - appliquer le freemium basé sur les champs visible et approved
      console.log('🔒 Pas d\'authentification - système freemium activé (visible:true et approved:true uniquement)');
      // IMPORTANT: Filtrer les candidats rejetés pour les visiteurs non authentifiés
      filteredCandidates = filteredCandidates.filter(c => c.approved === true);
      const publicCandidates = filteredCandidates.filter(c => c.visible === true);
      // Option: masquer la moitié des profils publics pour renforcer le freemium
      const halfIndex = Math.ceil(publicCandidates.length / 2);
      visibleCandidates = publicCandidates.slice(0, halfIndex);
      // Le nombre de candidats cachés = candidats non-publics + candidats publics non affichés
      const hiddenNonPublic = filteredCandidates.length - publicCandidates.length;
      const hiddenPublic = publicCandidates.length - visibleCandidates.length;
      totalHiddenCandidates = hiddenNonPublic + hiddenPublic;
    }
    
    // Tri avec mise en avant des plans Premium et Pro
    visibleCandidates.sort((a, b) => {
      // Si c'est une carte d'inscription, la mettre à la fin
      if (a.isSignupCard) return 1;
      if (b.isSignupCard) return -1;
      
      // Priorité des plans : Pro > Premium > Free
      const planPriority = { 'pro': 3, 'premium': 2, 'free': 1 };
      const aPlanPriority = planPriority[a.planType] || 1;
      const bPlanPriority = planPriority[b.planType] || 1;
      
      // Si les plans sont différents, trier par priorité de plan
      if (aPlanPriority !== bPlanPriority) {
        return bPlanPriority - aPlanPriority;
      }
      
      // Si les plans sont identiques, appliquer le tri demandé
      if (sortBy === 'recent') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'experience') {
        const experienceOrder = { Junior: 1, Mid: 2, Senior: 3, Lead: 4 };
        return (experienceOrder[b.experience] || 0) - (experienceOrder[a.experience] || 0);
      }
      
      // Par défaut, trier par date de mise à jour
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    // Ajouter la carte d'inscription si il y a des candidats masqués
    if (!isAuthenticated && totalHiddenCandidates > 0) {
      visibleCandidates.push({
        id: 'signup-card',
        isSignupCard: true,
        hiddenCount: totalHiddenCandidates
      });
    }

    // Désactiver le masquage forcé pour les utilisateurs authentifiés
    // Conserver le masquage uniquement pour les visiteurs non authentifiés (logique précédente déjà appliquée)

    res.json({
      candidates: visibleCandidates,
      total: visibleCandidates.length,
      totalHidden: totalHiddenCandidates,
      authenticated: isAuthenticated,
      role: userRole,
      filters: { search, remote, experience, availability, location, salaryRange, sortBy }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des candidats', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/candidates/:id - Récupérer un candidat spécifique (stateless)
app.get('/api/candidates/:id', async (req, res) => {
  try {
    console.log('🔍 [GET_CANDIDATE] Récupération candidat:', req.params.id);
    
    // Charger les données depuis la DB (stateless)
    const CANDIDATES = await loadCandidates();

    const candidate = CANDIDATES.find(c => c.id == req.params.id);

    if (!candidate) {
      console.log('❌ [GET_CANDIDATE] Candidat non trouvé:', req.params.id);
      return res.status(404).json({ error: 'Candidat non trouvé' });
    }

    console.log('✅ [GET_CANDIDATE] Candidat trouvé:', candidate.name);
    console.log('📝 [GET_CANDIDATE] Notes actuelles:', candidate.notes || 'Aucune note');

    const authHeader = req.headers.authorization;
    const hasAuth = !!authHeader && authHeader.startsWith('Bearer ');

    // Si non authentifié et candidat non public, refuser l'accès
    if (!hasAuth && candidate.visible === false) {
      console.log('🔒 [GET_CANDIDATE] Accès refusé - candidat non public');
      return res.status(404).json({ error: 'Candidat non trouvé' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('❌ [GET_CANDIDATE] Erreur lors de la récupération du candidat:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/candidates/profile/:email - Récupérer le profil d'un utilisateur par email (stateless)
app.get('/api/candidates/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    // Charger les données depuis la DB (stateless)
    const CANDIDATES = await loadCandidates();
    
    const candidate = CANDIDATES.find(c => c.email === email);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat non trouvé' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/stats - Statistiques des candidats
app.get('/api/stats', (req, res) => {
  const stats = getCandidateStats();
  res.json(stats);
});

// POST /api/candidates - Ajouter un nouveau candidat
app.post('/api/candidates', async (req, res) => {
  try {
    // Traiter le champ yearsOfExperience avant l'envoi à Supabase
    const candidateData = { ...req.body };
    
    // Si des années d'expérience sont spécifiées, les intégrer dans la bio
    if (candidateData.yearsOfExperience && candidateData.yearsOfExperience.trim()) {
      const years = candidateData.yearsOfExperience.trim();
      const experienceLevel = candidateData.experience || 'Mid';
      
      // Ajouter les années d'expérience au début de la bio
      candidateData.bio = `Années d'expérience: ${years} ans (${experienceLevel})\n\n${candidateData.bio || ''}`;
      
      // Supprimer le champ yearsOfExperience car il n'existe pas en base
      delete candidateData.yearsOfExperience;
    }
    
    const candidates = await loadCandidates();
    
    // Si le candidat a un userId, vérifier s'il existe déjà
    if (candidateData.userId) {
      const existingCandidate = candidates.find(c => c.userId === candidateData.userId);
      if (existingCandidate) {
        // Mettre à jour le candidat existant
        const updatedCandidate = await updateCandidate(existingCandidate.id, candidateData);
        res.status(200).json(updatedCandidate);
        return;
      }
    }
    
    const newCandidate = addCandidate(candidateData);
    res.status(201).json(newCandidate);
  } catch (error) {
    logger.error('Erreur lors de l\'ajout du candidat', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de l\'ajout du candidat' });
  }
});

// PUT /api/candidates/:id - Mettre à jour un candidat
app.put('/api/candidates/:id', async (req, res) => {
  try {
    // Traiter le champ yearsOfExperience avant l'envoi à Supabase
    const candidateData = { ...req.body };
    
    // Si des années d'expérience sont spécifiées, les intégrer dans la bio
    if (candidateData.yearsOfExperience && candidateData.yearsOfExperience.trim()) {
      const years = candidateData.yearsOfExperience.trim();
      const experienceLevel = candidateData.experience || 'Mid';
      
      // Vérifier si la bio contient déjà des années d'expérience
      if (candidateData.bio && candidateData.bio.includes('Années d\'expérience:')) {
        // Remplacer les années existantes
        candidateData.bio = candidateData.bio.replace(
          /Années d'expérience: \d+ ans \([^)]+\)/,
          `Années d'expérience: ${years} ans (${experienceLevel})`
        );
      } else {
        // Ajouter les années d'expérience au début de la bio
        candidateData.bio = `Années d'expérience: ${years} ans (${experienceLevel})\n\n${candidateData.bio || ''}`;
      }
      
      // Supprimer le champ yearsOfExperience car il n'existe pas en base
      delete candidateData.yearsOfExperience;
    }
    
    const updatedCandidate = await updateCandidate(req.params.id, candidateData);
    res.json(updatedCandidate);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du candidat', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour du candidat' });
  }
});

// PUT /api/candidates/:id/plan - Mettre à jour le plan d'un candidat
app.put('/api/candidates/:id/plan', async (req, res) => {
  try {
    const { planType, durationMonths = 1 } = req.body;
    
    // Valider le type de plan
    if (!['free', 'premium', 'pro'].includes(planType)) {
      return res.status(400).json({ error: 'Type de plan invalide. Doit être: free, premium, ou pro' });
    }
    
    // Valider la durée
    if (durationMonths < 1 || durationMonths > 12) {
      return res.status(400).json({ error: 'Durée invalide. Doit être entre 1 et 12 mois' });
    }
    
    const updatedCandidate = await updateCandidatePlan(req.params.id, planType, durationMonths);
    res.json(updatedCandidate);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du plan candidat', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour du plan candidat' });
  }
});

// PUT /api/candidates/:id/notes - Mettre à jour les notes d'un candidat
app.put('/api/candidates/:id/notes', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [NOTES] Requête reçue pour candidat:', req.params.id);
    console.log('🔍 [NOTES] Headers authorization:', req.headers.authorization ? 'Présent' : 'Absent');
    console.log('🔍 [NOTES] User:', req.user ? 'Authentifié' : 'Non authentifié');
    
    const candidateId = req.params.id;
    const { notes } = req.body;
    
    console.log('🔍 [NOTES] Candidate ID:', candidateId);
    console.log('🔍 [NOTES] Notes length:', notes?.length || 0);
    
    // Vérifier que l'utilisateur est un recruteur ou admin
    const userRole = req.user.user_metadata?.role;
    console.log('🔍 [NOTES] User role:', userRole);
    
    if (!['recruiter', 'admin'].includes(userRole)) {
      console.log('❌ [NOTES] Accès refusé - rôle insuffisant:', userRole);
      return res.status(403).json({ error: 'Seuls les recruteurs peuvent ajouter des notes' });
    }
    
    // Mettre à jour les notes dans la base de données
    console.log('💾 [NOTES] Tentative de mise à jour en base pour candidat:', candidateId);
    console.log('💾 [NOTES] Notes à sauvegarder:', notes);
    
    const { data, error } = await supabase
      .from('candidates')
      .update({ 
        notes: notes || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', candidateId)
      .select()
      .single();
    
    console.log('💾 [NOTES] Résultat de la requête Supabase:');
    console.log('💾 [NOTES] - Data:', data ? 'Présent' : 'Absent');
    console.log('💾 [NOTES] - Error:', error ? error.message : 'Aucune erreur');
    
    if (error) {
      console.log('❌ [NOTES] Erreur Supabase:', error.message);
      logger.error('Erreur lors de la mise à jour des notes', { error: error.message });
      return res.status(500).json({ error: 'Erreur lors de la mise à jour des notes' });
    }
    
    if (!data) {
      console.log('❌ [NOTES] Candidat non trouvé en base');
      return res.status(404).json({ error: 'Candidat non trouvé' });
    }
    
    console.log('✅ [NOTES] Candidat trouvé et mis à jour:', data.id);
    console.log('✅ [NOTES] Notes sauvegardées:', data.notes);
    
    logger.info('Notes mises à jour avec succès', { 
      candidateId, 
      recruiterId: req.user.id,
      notesLength: notes?.length || 0 
    });
    
    res.json({ 
      success: true, 
      message: 'Notes sauvegardées avec succès',
      candidate: data 
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des notes', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour des notes' });
  }
});

// DELETE /api/candidates/:id - Supprimer un candidat
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const deletedCandidate = deleteCandidate(req.params.id);
    res.json({ message: 'Candidat supprimé avec succès', candidate: deletedCandidate });
  } catch (error) {
    logger.error('Erreur lors de la suppression du candidat', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression du candidat' });
  }
});

// GET /api/metrics - Métriques détaillées (stateless)
app.get('/api/metrics', (req, res) => {
  try {
    const allMetrics = getAllMetrics();
    res.json(allMetrics);
  } catch (error) {
    logger.error('Erreur lors de la récupération des métriques', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/metrics/reset - Réinitialiser les métriques (stateless)
app.post('/api/metrics/reset', (req, res) => {
  try {
    const resetMetricsData = resetMetrics();
    logger.info('🔄 Métriques réinitialisées via API');
    res.json({ message: 'Métriques réinitialisées avec succès', metrics: resetMetricsData });
  } catch (error) {
    logger.error('Erreur lors de la réinitialisation des métriques', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
});

// ===== ROUTES FORUM =====

// GET /api/forum/posts - Récupérer les posts du forum
app.get('/api/forum/posts', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 100 } = req.query;
    
    const result = await getPosts(category, search, parseInt(page), parseInt(limit));
    
    res.json(result);
  } catch (error) {
    logger.error('Erreur lors de la récupération des posts', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/forum/posts/:id - Récupérer un post spécifique avec ses réponses
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    res.json(post);
  } catch (error) {
    logger.error('Erreur lors de la récupération du post', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/forum/posts - Créer un nouveau post
app.post('/api/forum/posts', authenticateUser, (req, res) => {
  try {
    const { title, content, category, tags = [] } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Titre, contenu et catégorie sont requis' });
    }
    
    const postData = {
      title,
      content,
      category,
      tags,
      author: req.user.user_metadata?.first_name && req.user.user_metadata?.last_name 
        ? `${req.user.user_metadata.first_name} ${req.user.user_metadata.last_name}`
        : req.user.email?.split('@')[0] || 'Utilisateur',
      author_id: generateTempUserId(req.user.email), // Utiliser un ID entier temporaire
      author_avatar: req.user.user_metadata?.first_name && req.user.user_metadata?.last_name 
        ? `${req.user.user_metadata.first_name[0]}${req.user.user_metadata.last_name[0]}`
        : req.user.email?.split('@')[0]?.substring(0, 2).toUpperCase() || 'U'
    };
    
    const newPost = addPost(postData);
    res.status(201).json(newPost);
  } catch (error) {
    logger.error('Erreur lors de la création du post', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création du post' });
  }
});

// PUT /api/forum/posts/:id - Mettre à jour un post
app.put('/api/forum/posts/:id', authenticateUser, async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    // Vérifier que l'utilisateur est l'auteur du post
    if (post.author_id !== generateTempUserId(req.user.email)) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres posts' });
    }
    
    const { title, content, category, tags } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    
    const updatedPost = updatePost(req.params.id, updateData);
    res.json(updatedPost);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du post', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour du post' });
  }
});

// DELETE /api/forum/posts/:id - Supprimer un post
app.delete('/api/forum/posts/:id', authenticateUser, async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    // Vérifier que l'utilisateur est l'auteur du post
    if (post.author_id !== generateTempUserId(req.user.email)) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres posts' });
    }
    
    const deletedPost = deletePost(req.params.id);
    res.json({ message: 'Post supprimé avec succès', post: deletedPost });
  } catch (error) {
    logger.error('Erreur lors de la suppression du post', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression du post' });
  }
});

// POST /api/forum/posts/:id/replies - Ajouter une réponse à un post
app.post('/api/forum/posts/:id/replies', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Le contenu de la réponse est requis' });
    }
    
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    const replyData = {
      post_id: parseInt(req.params.id), // Utiliser snake_case pour Supabase
      content,
      author: req.user.user_metadata?.first_name && req.user.user_metadata?.last_name 
        ? `${req.user.user_metadata.first_name} ${req.user.user_metadata.last_name}`
        : req.user.email?.split('@')[0] || 'Utilisateur',
      author_id: generateTempUserId(req.user.email),
      author_avatar: req.user.user_metadata?.first_name && req.user.user_metadata?.last_name 
        ? `${req.user.user_metadata.first_name[0]}${req.user.user_metadata.last_name[0]}`
        : req.user.email?.split('@')[0]?.substring(0, 2).toUpperCase() || 'U'
    };
    
    const newReply = addReply(replyData);
    res.status(201).json(newReply);
  } catch (error) {
    logger.error('Erreur lors de la création de la réponse', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création de la réponse' });
  }
});

// GET /api/forum/categories - Récupérer les catégories
app.get('/api/forum/categories', (req, res) => {
  try {
    const categories = getCategories();
    res.json(categories);
  } catch (error) {
    logger.error('Erreur lors de la récupération des catégories', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/forum/stats - Récupérer les statistiques du forum
app.get('/api/forum/stats', async (req, res) => {
  try {
    const stats = await getForumStats();
    res.json(stats);
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques du forum', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/profile-stats/:userId - Récupérer les statistiques d'un profil candidat
app.get('/api/profile-stats/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier que l'utilisateur demande ses propres statistiques
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer les données du candidat en utilisant l'email de l'utilisateur authentifié
    const candidates = await loadCandidates();
    const candidate = candidates.find(c => c.email === req.user.email);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Profil candidat non trouvé' });
    }

    // Plus besoin des données du forum - simplifié


    // Récupérer les vraies données de vues depuis les tables
    let profileViews = 0;
    let profileViewsToday = 0;
    let dailyViews = [];
    
    try {
      const [viewsData, viewsTodayData, dailyViewsData] = await Promise.all([
        getProfileViewsStats(candidate.id),
        getProfileViewsToday(candidate.id),
        getProfileViewsByDay(candidate.id)
      ]);
      
      profileViews = viewsData[0]?.total_views || 0;
      profileViewsToday = viewsTodayData || 0;
      dailyViews = dailyViewsData || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de tracking:', error);
      profileViews = 0;
      profileViewsToday = 0;
      dailyViews = [];
    }

    const stats = {
      profileViews,
      profileViewsToday,
      dailyViews,
      joinDate: candidate.created_at || candidate.createdAt,
      lastActivity: candidate.updated_at || candidate.updatedAt,
      profileStatus: candidate.approved ? 'approved' : 'pending'
    };

    res.json(stats);
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques du profil', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/profile-stats/:userId/chart - Récupérer les données du graphique avec filtres
app.get('/api/profile-stats/:userId/chart', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'week', offset = 0 } = req.query;
    
    // Vérifier que l'utilisateur demande ses propres statistiques
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer les données du candidat
    const candidates = await loadCandidates();
    const candidate = candidates.find(c => c.email === req.user.email);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Profil candidat non trouvé' });
    }

    // Récupérer les données selon la période
    const chartData = await getProfileViewsByPeriod(candidate.id, period, parseInt(offset));
    
    res.json({
      data: chartData,
      period,
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des données du graphique', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/profile-stats/:userId/track-view - Enregistrer une vue de profil
app.post('/api/profile-stats/:userId/track-view', async (req, res) => {
  try {
    const { userId } = req.params;
    const { candidateId } = req.body;
    
    if (!candidateId) {
      return res.status(400).json({ error: 'ID candidat requis' });
    }

    // Enregistrer la vue (sans email, juste l'ID)
    await trackProfileView(candidateId);
    
    res.json({ success: true, message: 'Vue enregistrée' });
  } catch (error) {
    logger.error('Erreur lors de l\'enregistrement de la vue de profil', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/candidates/:candidateId/stats - Récupérer les statistiques publiques d'un candidat (pour les recruteurs)
app.get('/api/candidates/:candidateId/stats', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Récupérer les vraies données de vues depuis les tables
    let profileViews = 0;
    let profileViewsToday = 0;
    let viewsLast7Days = 0;
    let dailyViews = [];
    
    try {
      const [viewsData, viewsTodayData, dailyViewsData] = await Promise.all([
        getProfileViewsStats(candidateId),
        getProfileViewsToday(candidateId),
        getProfileViewsByDay(candidateId)
      ]);
      
      profileViews = viewsData[0]?.total_views || 0;
      profileViewsToday = viewsTodayData || 0;
      dailyViews = dailyViewsData || [];
      
      // Calculer les vues des 7 derniers jours
      viewsLast7Days = dailyViews.reduce((sum, day) => sum + (day.views || 0), 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de tracking:', error);
      profileViews = 0;
      profileViewsToday = 0;
      viewsLast7Days = 0;
      dailyViews = [];
    }

    const stats = {
      profileViews,
      profileViewsToday,
      viewsLast7Days,
      dailyViews,
      // Informations publiques seulement
      isPublic: true
    };

    res.json(stats);
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques publiques du candidat', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});



// Cette route est déjà définie plus haut, on la supprime pour éviter la duplication

// DELETE /api/forum/posts/:id/replies/:replyId - Supprimer une réponse
app.delete('/api/forum/posts/:id/replies/:replyId', authenticateUser, async (req, res) => {
  try {
    const { replyId } = req.params;
    const deleted = await deleteReply(parseInt(replyId));
    
    if (deleted) {
      logger.info('Réponse supprimée avec succès', { replyId, user: req.user?.email });
      res.json({ message: 'Réponse supprimée avec succès' });
    } else {
      res.status(404).json({ error: 'Réponse non trouvée' });
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression de la réponse', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression de la réponse' });
  }
});

// Routes admin pour la suppression (sans authentification Supabase)
// DELETE /api/admin/forum/posts/:id - Supprimer un post du forum (admin)
app.delete('/api/admin/forum/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deletePost(parseInt(id));
    
    if (deleted) {
      logger.info('Post supprimé avec succès (admin)', { postId: id });
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ error: 'Post non trouvé' });
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression du post (admin)', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression du post' });
  }
});

// DELETE /api/admin/forum/posts/:id/replies/:replyId - Supprimer une réponse (admin)
app.delete('/api/admin/forum/posts/:id/replies/:replyId', async (req, res) => {
  try {
    const { replyId } = req.params;
    const deleted = await deleteReply(parseInt(replyId));
    
    if (deleted) {
      logger.info('Réponse supprimée avec succès (admin)', { replyId });
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ error: 'Réponse non trouvée' });
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression de la réponse (admin)', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression de la réponse' });
  }
});

// Routes pour les likes (sans authentification Supabase)
// POST /api/forum/posts/:id/like - Like/Unlike un post
app.post('/api/forum/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || 'anonymous'; // Utiliser un ID utilisateur par défaut
    
    const result = await togglePostLike(parseInt(id), userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Erreur lors du like du post', { error: error.message });
    res.status(500).json({ error: 'Erreur lors du like du post' });
  }
});

// POST /api/forum/replies/:id/like - Like/Unlike une réponse
app.post('/api/forum/replies/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || 'anonymous'; // Utiliser un ID utilisateur par défaut
    
    const result = await toggleReplyLike(parseInt(id), userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Erreur lors du like de la réponse', { error: error.message });
    res.status(500).json({ error: 'Erreur lors du like de la réponse' });
  }
});

// POST /api/forum/posts/:id/view - Incrémenter le nombre de vues d'un post
app.post('/api/forum/posts/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await incrementPostViews(parseInt(id));
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Post non trouvé' });
    }
  } catch (error) {
    logger.error('Erreur lors de l\'incrémentation des vues', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de l\'incrémentation des vues' });
  }
});

// POST /api/forum/posts/demo - Créer des posts de démonstration (sans auth)
app.post('/api/forum/posts/demo', async (req, res) => {
  try {
    const { posts } = req.body;
    
    if (!Array.isArray(posts)) {
      return res.status(400).json({ error: 'Un tableau de posts est requis' });
    }
    
    const createdPosts = [];
    
    for (const postData of posts) {
      const post = {
        title: postData.title,
        content: postData.content,
        category: postData.category || 'Général',
        tags: postData.tags || [],
        author: postData.author || 'Utilisateur Demo',
        author_id: generateTempUserId('demo@example.com'),
        author_avatar: postData.author_avatar || 'UD',
        views: 0,
        likes: 0,
        liked_by: []
      };
      
      const newPost = await addPost(post);
      createdPosts.push(newPost);
    }
    
    res.status(201).json({ 
      message: `${createdPosts.length} posts créés avec succès`,
      posts: createdPosts 
    });
  } catch (error) {
    logger.error('Erreur lors de la création des posts de démonstration', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création des posts' });
  }
});

// POST /api/forum/posts/:id/replies/demo - Créer des réponses de démonstration (sans auth)
app.post('/api/forum/posts/:id/replies/demo', async (req, res) => {
  try {
    const { id } = req.params;
    const { replies } = req.body;
    
    if (!Array.isArray(replies)) {
      return res.status(400).json({ error: 'Un tableau de réponses est requis' });
    }
    
    const createdReplies = [];
    
    for (const replyData of replies) {
      const reply = {
        post_id: parseInt(id),
        content: replyData.content,
        author: replyData.author || 'Utilisateur Demo',
        author_id: generateTempUserId('demo@example.com'),
        author_avatar: replyData.author_avatar || 'UD',
        likes: 0,
        liked_by: []
      };
      
      const newReply = await addReply(reply);
      createdReplies.push(newReply);
    }
    
    res.status(201).json({ 
      message: `${createdReplies.length} réponses créées avec succès`,
      replies: createdReplies 
    });
  } catch (error) {
    logger.error('Erreur lors de la création des réponses de démonstration', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création des réponses' });
  }
});

// POST /api/candidates/demo - Créer un profil candidat de démonstration (sans auth)
app.post('/api/candidates/demo', async (req, res) => {
  try {
    const candidateData = req.body;
    
    const newCandidate = await addCandidate(candidateData);
    res.status(201).json(newCandidate);
  } catch (error) {
    logger.error('Erreur lors de la création du profil candidat de démonstration', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création du profil candidat' });
  }
});

// ===== ROUTES FAVORIS RECRUTEURS =====

// GET /api/recruiter/favorites - Récupérer les favoris d'un recruteur
app.get('/api/recruiter/favorites', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const favorites = await getRecruiterFavorites(recruiterId);
    res.json(favorites);
  } catch (error) {
    logger.error('Erreur lors de la récupération des favoris', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  }
});

// POST /api/recruiter/favorites/:candidateId - Ajouter un candidat aux favoris
app.post('/api/recruiter/favorites/:candidateId', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const candidateId = req.params.candidateId;
    
    const result = await addToFavorites(recruiterId, candidateId);
    res.status(201).json({ success: true, favorite: result });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout aux favoris', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
  }
});

// DELETE /api/recruiter/favorites/:candidateId - Retirer un candidat des favoris
app.delete('/api/recruiter/favorites/:candidateId', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const candidateId = req.params.candidateId;
    
    await removeFromFavorites(recruiterId, candidateId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Erreur lors de la suppression des favoris', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression des favoris' });
  }
});

// GET /api/recruiter/favorites/:candidateId/check - Vérifier si un candidat est en favori
app.get('/api/recruiter/favorites/:candidateId/check', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const candidateId = req.params.candidateId;
    
    const isFavorited = await isCandidateFavorited(recruiterId, candidateId);
    res.json({ isFavorited });
  } catch (error) {
    logger.error('Erreur lors de la vérification des favoris', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la vérification des favoris' });
  }
});

// ===== ROUTES GESTION CANDIDATS RECRUTEURS =====

// PUT /api/recruiter/candidates/:candidateId/status - Mettre à jour le statut d'un candidat
app.put('/api/recruiter/candidates/:candidateId/status', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const { status } = req.body;
    
    // Valider le statut
    const validStatuses = ['À contacter', 'Entretien prévu', 'En cours', 'Accepté', 'Refusé'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    
    // Mettre à jour le statut dans la base de données
    const { data, error } = await supabase
      .from('candidates')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', candidateId)
      .select()
      .single();
    
    if (error) {
      logger.error('Erreur lors de la mise à jour du statut', { error: error.message });
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
    
    res.json({ success: true, candidate: data });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// GET /api/recruiter/favorites/export - Exporter les favoris en CSV
app.get('/api/recruiter/favorites/export', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const format = req.query.format || 'csv'; // csv ou json
    
    const favorites = await getRecruiterFavorites(recruiterId);
    
    if (format === 'csv') {
      // Générer le CSV
      const csvHeaders = [
        'Nom',
        'Email',
        'Téléphone',
        'Titre',
        'Localisation',
        'Type de travail',
        'Expérience',
        'Compétences',
        'Bio',
        'Portfolio',
        'LinkedIn',
        'GitHub',
        'TJM (€)',
        'Salaire annuel (€)',
        'Plan',
        'Date d\'ajout aux favoris',
        'Date de création du profil'
      ];
      
      const csvRows = favorites.map(candidate => [
        candidate.name || '',
        candidate.email || '',
        candidate.phone || '',
        candidate.title || '',
        candidate.location || '',
        candidate.remote || '',
        candidate.experience || '',
        (candidate.skills || []).join('; '),
        (candidate.bio || '').replace(/\n/g, ' ').replace(/\r/g, ' '),
        candidate.portfolio || '',
        candidate.linkedin || '',
        candidate.github || '',
        candidate.dailyRate || '',
        candidate.annualSalary || '',
        candidate.planType || 'free',
        new Date(candidate.favoritedAt).toLocaleDateString('fr-FR'),
        new Date(candidate.createdAt).toLocaleDateString('fr-FR')
      ]);
      
      // Créer le contenu CSV
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => 
          row.map(field => 
            typeof field === 'string' && field.includes(',') 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');
      
      // Définir les headers pour le téléchargement
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="favoris-recruiter-${new Date().toISOString().split('T')[0]}.csv"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
      
      res.send('\ufeff' + csvContent); // BOM UTF-8 pour Excel
      
    } else if (format === 'json') {
      // Exporter en JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="favoris-recruiter-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        recruiterId: recruiterId,
        totalFavorites: favorites.length,
        favorites: favorites
      });
    } else {
      res.status(400).json({ error: 'Format non supporté. Utilisez "csv" ou "json".' });
    }
    
  } catch (error) {
    logger.error('Erreur lors de l\'export des favoris', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de l\'export des favoris' });
  }
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur Annuaire de Talents démarré sur le port ${PORT}`);
  console.log(`👥 API Candidats: http://localhost:${PORT}/api/candidates`);
  console.log(`📊 Statistiques: GET http://localhost:${PORT}/api/stats`);
  console.log(`➕ Ajouter candidat: POST http://localhost:${PORT}/api/candidates`);
  console.log(`✏️ Modifier candidat: PUT http://localhost:${PORT}/api/candidates/:id`);
  console.log(`🗑️ Supprimer candidat: DELETE http://localhost:${PORT}/api/candidates/:id`);
  console.log(`💬 API Forum: http://localhost:${PORT}/api/forum/posts`);
  console.log(`📝 Créer post: POST http://localhost:${PORT}/api/forum/posts`);
  console.log(`💭 Ajouter réponse: POST http://localhost:${PORT}/api/forum/posts/:id/replies`);
  console.log(`📊 Statistiques: GET http://localhost:${PORT}/api/stats`);
  console.log(`📈 Métriques: GET http://localhost:${PORT}/api/metrics`);
  console.log(`🔄 Reset métriques: POST http://localhost:${PORT}/api/metrics/reset`);
  console.log(`🎛️ Dashboard: http://localhost:${PORT}/dashboard.html`);
});

// Gestion des erreurs du serveur
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé`);
  } else {
    console.error('❌ Erreur du serveur:', error);
  }
});

// Gestion des signaux de fermeture
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// ==================== ROUTES API POUR LES RENDEZ-VOUS ====================

// GET /api/appointments - Récupérer tous les rendez-vous du recruteur
app.get('/api/appointments', authenticateUser, async (req, res) => {
  try {
    const appointments = await loadAppointments(req.user.id);
    res.json(appointments);
  } catch (error) {
    logger.error('Erreur lors de la récupération des rendez-vous', { error: error.message });
    
    // Vérifier si c'est une erreur de table manquante
    if (error.message.includes('Table appointments non trouvée')) {
      res.status(503).json({ 
        error: 'Table appointments non trouvée. Veuillez créer la table dans Supabase.',
        details: 'Exécutez le script SQL dans create_appointments_table.sql'
      });
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
});

// POST /api/appointments - Créer un nouveau rendez-vous
app.post('/api/appointments', authenticateUser, async (req, res) => {
  try {
    const {
      candidateId,
      title,
      candidateName,
      type,
      appointmentDate,
      appointmentTime,
      duration,
      location,
      notes
    } = req.body;

    // Validation des données
    if (!candidateId || !title || !type || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const appointmentData = {
      recruiter_id: req.user.id,
      candidate_id: candidateId,
      title,
      candidate_name: candidateName,
      type,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      duration: duration || 60,
      location: location || null,
      notes: notes || null
    };

    const appointment = await createAppointment(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    logger.error('Erreur lors de la création du rendez-vous', { error: error.message });
    
    // Vérifier si c'est une erreur de table manquante
    if (error.message.includes('Table appointments non trouvée')) {
      res.status(503).json({ 
        error: 'Table appointments non trouvée. Veuillez créer la table dans Supabase.',
        details: 'Exécutez le script SQL dans create_appointments_table.sql'
      });
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
});

// PUT /api/appointments/:id - Mettre à jour un rendez-vous
app.put('/api/appointments/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      candidateId,
      title,
      candidateName,
      type,
      appointmentDate,
      appointmentTime,
      duration,
      location,
      notes
    } = req.body;

    const appointmentData = {
      candidate_id: candidateId,
      title,
      candidate_name: candidateName,
      type,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      duration: duration || 60,
      location: location || null,
      notes: notes || null
    };

    const appointment = await updateAppointment(id, appointmentData);
    res.json(appointment);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du rendez-vous', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/appointments/:id - Supprimer un rendez-vous
app.delete('/api/appointments/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAppointment(id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Erreur lors de la suppression du rendez-vous', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/appointments/candidate/:candidateId - Récupérer les rendez-vous d'un candidat
app.get('/api/appointments/candidate/:candidateId', authenticateUser, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const appointments = await getAppointmentsForCandidate(req.user.id, candidateId);
    res.json(appointments);
  } catch (error) {
    logger.error('Erreur lors de la récupération des rendez-vous du candidat', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/appointments/candidate/:candidateId/next - Récupérer le prochain rendez-vous d'un candidat
app.get('/api/appointments/candidate/:candidateId/next', authenticateUser, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const appointment = await getNextAppointmentForCandidate(req.user.id, candidateId);
    res.json(appointment);
  } catch (error) {
    logger.error('Erreur lors de la récupération du prochain rendez-vous', { error: error.message });
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ==================== ROUTES API POUR LES RECHERCHES ET ENTREPRISES ====================

// ===== ROUTES POUR LES RECHERCHES DE RECRUTEURS =====

// GET /api/recruiter/searches - Récupérer toutes les recherches d'un recruteur
app.get('/api/recruiter/searches', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const searches = await getRecruiterSearches(recruiterId);
    res.json(searches);
  } catch (error) {
    logger.error('Erreur lors de la récupération des recherches', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération des recherches' });
  }
});

// GET /api/recruiter/searches/:id - Récupérer une recherche spécifique
app.get('/api/recruiter/searches/:id', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.id;
    const search = await getRecruiterSearchById(id, recruiterId);
    
    if (!search) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }
    
    res.json(search);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la recherche', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération de la recherche' });
  }
});

// POST /api/recruiter/searches - Créer une nouvelle recherche
app.post('/api/recruiter/searches', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const searchData = {
      ...req.body,
      recruiter_id: req.user.id
    };
    
    const search = await createRecruiterSearch(searchData);
    res.status(201).json(search);
  } catch (error) {
    logger.error('Erreur lors de la création de la recherche', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création de la recherche' });
  }
});

// PUT /api/recruiter/searches/:id - Mettre à jour une recherche
app.put('/api/recruiter/searches/:id', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const search = await updateRecruiterSearch(id, req.body);
    res.json(search);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la recherche', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la recherche' });
  }
});

// DELETE /api/recruiter/searches/:id - Supprimer une recherche
app.delete('/api/recruiter/searches/:id', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRecruiterSearch(id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la recherche', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression de la recherche' });
  }
});

// GET /api/recruiter/searches/:id - Récupérer une recherche spécifique
app.get('/api/recruiter/searches/:id', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const search = await getRecruiterSearchById(id);
    
    if (!search) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }
    
    res.json(search);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la recherche', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération de la recherche' });
  }
});

// GET /api/recruiter/searches/:id/candidates - Rechercher des candidats basés sur les critères
app.get('/api/recruiter/searches/:id/candidates', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const search = await getRecruiterSearchById(id);
    
    if (!search) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }
    
    const candidates = await searchCandidatesByCriteria(search);
    res.json(candidates);
  } catch (error) {
    logger.error('Erreur lors de la recherche de candidats', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la recherche de candidats' });
  }
});

// GET /api/recruiter/searches/stats - Récupérer les statistiques des recherches
app.get('/api/recruiter/searches/stats', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const stats = await getRecruiterSearchStats(recruiterId);
    res.json(stats);
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// ===== ROUTES POUR LES ENTREPRISES DE RECRUTEURS =====

// GET /api/recruiter/company - Récupérer l'entreprise d'un recruteur
app.get('/api/recruiter/company', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const company = await getRecruiterCompany(recruiterId);
    res.json(company);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'entreprise', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'entreprise' });
  }
});

// POST /api/recruiter/company - Créer ou mettre à jour l'entreprise d'un recruteur
app.post('/api/recruiter/company', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      recruiter_id: req.user.id
    };
    
    const company = await upsertRecruiterCompany(companyData, req.user.id);
    res.status(201).json(company);
  } catch (error) {
    logger.error('Erreur lors de la création/mise à jour de l\'entreprise', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la création/mise à jour de l\'entreprise' });
  }
});

// PUT /api/recruiter/company - Mettre à jour l'entreprise d'un recruteur
app.put('/api/recruiter/company', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      recruiter_id: req.user.id
    };
    
    const company = await upsertRecruiterCompany(companyData, req.user.id);
    res.json(company);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'entreprise', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entreprise' });
  }
});

// DELETE /api/recruiter/company - Supprimer l'entreprise d'un recruteur
app.delete('/api/recruiter/company', requireRole(['recruiter', 'admin']), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    await deleteRecruiterCompany(recruiterId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'entreprise', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'entreprise' });
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
