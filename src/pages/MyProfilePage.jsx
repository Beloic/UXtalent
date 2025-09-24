import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileCache } from '../contexts/ProfileCacheContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Save, ArrowLeft, ArrowRight, Check, BarChart3, Settings, Eye, Calendar, ChevronLeft, ChevronRight, DollarSign, Camera, MapPin, Briefcase, Globe, Linkedin, Github, ExternalLink, TrendingUp, MessageSquare, X, AlertCircle, Edit, Star, CheckCircle, Pencil, Check as CheckIcon, X as XIcon, Crown, Clock, XCircle, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Pages lourdes chargées en lazy pour éviter les cycles et gros bundles
const CandidatesListPage = lazy(() => import('./CandidatesListPage'));
import { supabase } from '../lib/supabase';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePermissions } from '../hooks/usePermissions';
import { useRecruiter } from '../hooks/useRecruiter';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { supabaseAdmin } from '../lib/supabase';
const JobsPage = lazy(() => import('./JobsPage'));
const ForumPage = lazy(() => import('./ForumPage'));

export default function MyProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { isRecruiter, isCandidate } = usePermissions();
  const { recruiter, permissions, loading: recruiterLoading, getPlanInfo, canPostJob, canContactCandidate, getRemainingJobPosts } = useRecruiter();
  const { 
    getCachedData, 
    updateProfileCache, 
    setCacheLoading, 
    isCacheValid, 
    forceReload 
  } = useProfileCache();
  const location = useLocation();
  const navigate = useNavigate();

  // Rediriger les recruteurs qui arrivent sur des pages profil candidat
  useEffect(() => {
    if (isRecruiter) {
      const path = location.pathname || '';
      const isCandidateProfileSection = (
        path.startsWith('/my-profile/profile') ||
        path.startsWith('/my-profile/talent') ||
        path.startsWith('/my-profile/stats')
      );
      if (isCandidateProfileSection) {
        navigate('/recruiter-dashboard/myjobs', { replace: true });
      }
    }
  }, [isRecruiter, location.pathname, navigate]);

  // Helper function pour gérer les compétences de manière sécurisée
  const getSkillsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
  };

  const getSkillsString = (skills) => {
    if (!skills) return '';
    if (Array.isArray(skills)) return skills.join(', ');
    if (typeof skills === 'string') return skills;
    return '';
  };

  // Helper function pour gérer les valeurs de manière sécurisée
  const safeTrim = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return value.toString().trim();
    return String(value).trim();
  };

  const safeStringValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  };
  
  
  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/talent')) return 'talents';
    if (path.includes('/offers')) return 'offers';
    if (path.includes('/forum')) return 'forum';
    if (path.includes('/stats')) return 'stats';
    if (path.includes('/plan')) return 'plan';
    if (path.includes('/offer')) return 'offer';
    return 'view'; // Par défaut pour '/profile' ou autres
  };
  
  const activeTab = getActiveTabFromPath();
  
  // Fonction pour naviguer vers un onglet spécifique
  const navigateToTab = (tabName) => {
    if (isCandidate) {
      switch (tabName) {
        case 'view':
          // Forcer le rechargement quand on clique sur l'onglet profil
          forceReload();
          navigate('/my-profile/profile');
          break;
        case 'talents':
          navigate('/my-profile/talent');
          break;
        case 'stats':
          navigate('/my-profile/stats');
          break;
        case 'plan':
          navigate('/my-profile/plan');
          break;
        case 'offers':
          navigate('/my-profile/offers');
          break;
        case 'forum':
          navigate('/my-profile/forum');
          break;
        default:
          navigate('/my-profile/profile');
      }
    } else if (isRecruiter) {
      switch (tabName) {
        case 'offer':
          navigate('/my-profile/offer');
          break;
        case 'plan':
          navigate('/my-profile/plan');
          break;
        default:
          navigate('/my-profile/offer');
      }
    }
  };
  
  const [profileStats, setProfileStats] = useState({
    profileViews: 0,
    profileViewsToday: 0,
    dailyViews: [],
    joinDate: null,
    lastActivity: null
  });
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [chartOffset, setChartOffset] = useState(0);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Valeurs par défaut réalistes pour les nouveaux candidats
  const DEFAULT_VALUES = {
    title: 'Product Designer',
    location: 'Paris, France',
    remote: 'hybrid',
    yearsOfExperience: '3',
    bio: 'Designer UX/UI passionné par la création d\'expériences utilisateur exceptionnelles. Spécialisé dans la recherche utilisateur, le design d\'interface et la création de design systems cohérents.',
    skills: 'Design System, Recherche utilisateur, Prototypage, Figma, Adobe Creative Suite',
    portfolio: '',
    linkedin: '',
    github: '',
    dailyRate: '500',
    annualSalary: '65000'
  };

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    ...DEFAULT_VALUES,
    photo: null,
    updatedAt: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [candidateStatus, setCandidateStatus] = useState(null); // 'approved', 'rejected', 'pending', 'new', null
  const [profileLoadError, setProfileLoadError] = useState(null); // Message d'erreur de chargement
  const [isEditingRejected, setIsEditingRejected] = useState(false); // Mode édition pour candidats rejetés
  const [isEditingNew, setIsEditingNew] = useState(false); // Mode édition pour candidats nouveaux
  const [userPlan, setUserPlan] = useState('free');
  const [candidatePlan, setCandidatePlan] = useState('free'); // 'free', 'premium', 'elite'
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationInfo, setCancellationInfo] = useState(null);
  
  // États pour l'édition inline
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Fonction pour charger les statistiques du profil
  const loadProfileStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingStats(true);
      
      // Obtenir le token une seule fois
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        return;
      }
      
      // Charger les statistiques avec le token
      const response = await fetch(buildApiUrl(`/api/profile-stats/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Vérifier que la réponse est bien du JSON avant de l'analyser
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return;
        }
        
        const stats = await response.json();
        setProfileStats(stats);
      } else {
        }
    } catch (error) {
      } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  // Charger les données du graphique
  const loadChartData = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingChart(true);
    try {
      // Obtenir le token une seule fois
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        return;
      }
      
      const response = await fetch(buildApiUrl(`/api/profile-stats/${user.id}/chart?period=${chartPeriod}&offset=${chartOffset}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Vérifier que la réponse est bien du JSON avant de l'analyser
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return;
        }
        
        const result = await response.json();
        setChartData(result.data);
      } else {
        }
    } catch (error) {
      } finally {
      setIsLoadingChart(false);
    }
  }, [user, chartPeriod, chartOffset]);

  // Gérer le changement de période
  const handlePeriodChange = (newPeriod) => {
    setChartPeriod(newPeriod);
    setChartOffset(0); // Reset offset quand on change de période
  };

  // Gérer la navigation
  const handleNavigation = (direction) => {
    const newOffset = direction === 'prev' ? chartOffset + 1 : chartOffset - 1;
    setChartOffset(newOffset);
  };

  // Charger les statistiques quand l'onglet stats est sélectionné
  useEffect(() => {
    if (activeTab === 'stats' && user && candidatePlan !== 'free') {
      loadProfileStats();
      loadChartData();
    }
  }, [activeTab, user, candidatePlan, loadProfileStats, loadChartData]);

  // Rafraîchir le plan périodiquement pour détecter les changements
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      console.log('Auth check:', {
        isAuthenticated,
        hasEmail: !!user?.email
      });
      return;
    }


    const refreshPlan = async () => {
      try {
        setIsRefreshingPlan(true);
        
        // Obtenir le token d'authentification
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        if (!token) {
          setCandidatePlan('free');
          return;
        }
        
        const apiUrl = buildApiUrl(`/api/candidates/profile/${encodeURIComponent(user.email)}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response details:', {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.ok) {
          // Vérifier que la réponse est bien du JSON avant de l'analyser
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            return;
          }
          
          const responseData = await response.json();
          
          // Gérer les deux formats de réponse possibles
          const userProfile = responseData.candidates?.[0] || responseData;
          const newPlan = userProfile?.plan || userProfile?.planType || userProfile?.plan_type || 'free';
          
          console.log('Plan comparison:', {
            userProfile: userProfile,
            currentPlan: candidatePlan,
            newPlan: newPlan,
            planType: userProfile?.planType,
            plan_type: userProfile?.plan_type,
            hasChanged: userProfile && newPlan !== candidatePlan
          });
          
          if (userProfile && newPlan !== candidatePlan) {
            console.log('Plan changed:', {
              ancienPlan: candidatePlan,
              nouveauPlan: newPlan
            });
            
            setCandidatePlan(newPlan);

            // Déclencher l'événement pour notifier les autres composants
            window.dispatchEvent(new CustomEvent('planUpdated', {
              detail: { plan: newPlan }
            }));
          }
        }
      } catch (error) {
        // Gestion spéciale pour les erreurs de parsing JSON
        if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        }
      } finally {
        setIsRefreshingPlan(false);
      }
    };

    // Rafraîchir immédiatement
    refreshPlan();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(() => {
      refreshPlan();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, user, candidatePlan]);

  const loadExistingProfile = useCallback(async () => {
    try {
      // Réinitialiser l'erreur avant un nouveau chargement
      setProfileLoadError(null);
      // Vérifier d'abord si on a des données en cache valides
      const cachedData = getCachedData();
      if (cachedData && activeTab !== 'profile') {
        // Si on a des données en cache et qu'on n'est pas sur l'onglet profil,
        // utiliser les données du cache sans recharger
        setFormData(cachedData.formData);
        setCandidateStatus(cachedData.candidateStatus);
        setCandidatePlan(cachedData.candidatePlan);
        return;
      }

      setIsLoadingProfile(true);
      setCacheLoading(true);
      
      // Essayer d'abord l'API Vercel, puis fallback vers Supabase direct
      const apiUrl = buildApiUrl(`/api/candidates/profile/${encodeURIComponent(user.email)}`);
      let response;
      let useDirectSupabase = false;
      
      try {
        // Obtenir le token d'authentification
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        if (!token) {
          useDirectSupabase = true;
        } else {
          response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (fetchError) {
        useDirectSupabase = true;
      }
      
      if (response) {
        // Si erreur 500, essayer de lire le contenu de l'erreur et utiliser Supabase direct
        if (!response.ok) {
        try {
          const errorText = await response.text();
          } catch (e) {
          }
        useDirectSupabase = true;
        }
      }
      
      // Fallback vers Supabase direct si nécessaire
      if (useDirectSupabase) {
        const { data: candidate, error } = await supabaseAdmin
          .from('candidates')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            setMessage('ℹ️ Aucun profil existant trouvé. Vous pouvez créer un nouveau profil.');
            setCandidateStatus('new');
            setFormData(prev => ({ ...prev, id: null }));
            // Assigner les valeurs par défaut réalistes pour le nouveau candidat
            assignDefaultValues();
            return;
          }
          setMessage(`❌ Erreur: ${error.message}`);
          setProfileLoadError(error.message || 'Erreur inconnue');
          return;
        }
        
        // Traiter le candidat trouvé
        const status = candidate.status || 'pending';
        const plan = candidate.plan || candidate.planType || candidate.plan_type || 'free';
        setCandidateStatus(status);
        setCandidatePlan(plan);
        
        console.log('Profile loaded:', {
          status: status,
          plan: plan,
          planType: candidate.planType,
          plan_type: candidate.plan_type,
          rawData: candidate
        });
        
        const newFormData = {
          id: candidate.id || null,
          name: candidate.name || '',
          email: candidate.email || '',
          title: candidate.title && candidate.title.trim() !== '' ? candidate.title : DEFAULT_VALUES.title,
          location: candidate.location || '',
          remote: candidate.remote || 'hybrid',
          experience: candidate.experience || '',
          skills: candidate.skills && candidate.skills.trim() !== '' ? candidate.skills : DEFAULT_VALUES.skills,
          bio: candidate.bio || '',
          portfolio: candidate.portfolio || '',
          linkedin: candidate.linkedin || '',
          github: candidate.github || '',
          salary: candidate.salary || '',
          languages: candidate.languages || [],
          photo: candidate.photo || '',
          updatedAt: candidate.updated_at || candidate.updatedAt || null
        };
        
        setFormData(newFormData);
        setMessage('✅ Profil chargé avec succès (via Supabase direct)');
        
        // Mettre à jour le cache avec les nouvelles données
        updateProfileCache({
          formData: newFormData,
          candidateStatus: status,
          candidatePlan: plan
        });
        return;
      }
      
      if (response && response.ok) {
        // Vérifier que la réponse est bien du JSON avant de l'analyser
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Essayer de lire le contenu pour debug
          const textContent = await response.text();
          throw new Error('Réponse non-JSON reçue de l\'API');
        }
        
        const responseData = await response.json();

        // La route /api/candidates/profile/:email retourne directement le candidat
        const existingCandidate = responseData;

        if (existingCandidate) {
          // Logique simplifiée : utiliser directement le statut
          const status = existingCandidate.status || 'pending';
          
          setCandidateStatus(status);
          
          // Log après setCandidateStatus
          // Charger le plan du candidat
          setCandidatePlan(existingCandidate.plan || 'free');
          
          // Charger toutes les données depuis la base de données
          const newFormData = {
            id: existingCandidate.id || null,
            name: existingCandidate.name || '',
            email: existingCandidate.email || '',
            title: existingCandidate.title && existingCandidate.title.trim() !== '' ? existingCandidate.title : DEFAULT_VALUES.title,
            location: existingCandidate.location || '',
            remote: existingCandidate.remote || 'hybrid',
            yearsOfExperience: (() => {
              // Extraire les années d'expérience depuis la bio structurée
              const bio = existingCandidate.bio || '';
              const match = bio.match(/Années d'expérience: (\d+) ans/);
              return match ? match[1] : '';
            })(),
            bio: (() => {
              // Masquer la ligne "Années d'expérience" de la bio puisqu'elle est affichée séparément
              const bio = existingCandidate.bio || '';
              return bio.replace(/Années d'expérience: \d+ ans \([^)]+\)\n\n/, '');
            })(),
            skills: (() => {
              const skills = Array.isArray(existingCandidate.skills)
                ? existingCandidate.skills.join(', ')
                : existingCandidate.skills || '';
              // Si aucune compétence n'est définie, utiliser les compétences par défaut
              return skills.trim() === '' ? DEFAULT_VALUES.skills : skills;
            })(),
            portfolio: existingCandidate.portfolio || '',
            linkedin: existingCandidate.linkedin || '',
            github: existingCandidate.github || '',
            photo: existingCandidate.photo && safeTrim(existingCandidate.photo) !== '' ? {
              existing: existingCandidate.photo,
              preview: existingCandidate.photo
            } : null,
            dailyRate: existingCandidate.dailyRate || existingCandidate.daily_rate || '',
            annualSalary: existingCandidate.annualSalary || existingCandidate.annual_salary || '',
            updatedAt: existingCandidate.updated_at || existingCandidate.updatedAt || null
          };
          
          setFormData(newFormData);
          setMessage('✅ Profil chargé avec succès');
          
          // Mettre à jour le cache avec les nouvelles données
          updateProfileCache({
            formData: newFormData,
            candidateStatus: status,
            candidatePlan: existingCandidate.plan || 'free'
          });
          
          // Faire disparaître le message après 3 secondes
          setTimeout(() => {
            setMessage('');
          }, 3000);
        } else {
          setMessage('ℹ️ Aucun profil existant trouvé. Vous pouvez créer un nouveau profil.');
        }
      } else if (response && response.status === 404) {
        // Candidat non trouvé - c'est normal pour un nouveau profil
        setMessage('ℹ️ Aucun profil existant trouvé. Vous pouvez créer un nouveau profil.');
        setCandidateStatus('new'); // Nouveau statut pour les nouveaux profils
        // S'assurer que formData.id reste null pour les nouveaux candidats
        setFormData(prev => ({ ...prev, id: null }));
        // Assigner les valeurs par défaut réalistes pour le nouveau candidat
        assignDefaultValues();
      } else if (response) {
        const errorText = await response.text();
        setMessage(`❌ Erreur lors du chargement: ${response.status}`);
        setProfileLoadError(`Statut ${response.status}`);
      }
    } catch (error) {
      // Gestion spéciale pour les erreurs de parsing JSON
      if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        setMessage('❌ Erreur de communication avec le serveur. Veuillez réessayer.');
      } else {
        setMessage(`❌ Erreur: ${error.message}`);
      }
      // En cas d'erreur réseau/serveur, NE PAS afficher l'UI "new" par défaut
      setProfileLoadError(error.message || 'Erreur inconnue');
    } finally {
      setIsLoadingProfile(false);
      setCacheLoading(false);
    }
  }, [user, activeTab, getCachedData, updateProfileCache, setCacheLoading]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.first_name && user.user_metadata?.last_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user.email?.split('@')[0] || '',
        email: user.email || ''
      }));

      // Charger le profil depuis la base de données seulement si nécessaire
      loadExistingProfile();
    } else {
      // Si pas d'utilisateur, assigner les valeurs par défaut pour l'affichage
      assignDefaultValues();
    }
  }, [user, loadExistingProfile]);

  // Assigner les valeurs par défaut dès que l'utilisateur est connecté et qu'aucun profil n'existe
  useEffect(() => {
    if (user && !isLoadingProfile && candidateStatus === 'new') {
      assignDefaultValues();
    }
  }, [user, isLoadingProfile, candidateStatus]);

  // Fonction pour assigner les valeurs par défaut réalistes lors de la première connexion
  const assignDefaultValues = () => {
    setFormData(prev => {
      const newData = {
        ...prev,
        ...DEFAULT_VALUES
      };
      return newData;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonctions pour l'édition inline
  const startEditing = (fieldName, currentValue) => {
    setEditingField(fieldName);
    // Pour les champs numériques avec €, on retire le symbole pour l'édition
    if ((fieldName === 'dailyRate' || fieldName === 'annualSalary') && currentValue) {
      const numericValue = currentValue.replace(' €', '');
      setTempValue(numericValue);
    } else {
      setTempValue(currentValue || '');
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const saveInlineEdit = async () => {
    if (!editingField || !user) return;
    
    setIsSavingInline(true);
    try {
      // Mettre à jour les données locales
      setFormData(prev => ({
        ...prev,
        [editingField]: tempValue
      }));

      // Sauvegarder en base de données
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      let updateData = { [editingField]: tempValue };
      
      // Si on sauvegarde la bio, préserver les années d'expérience existantes
      if (editingField === 'bio' && formData.yearsOfExperience) {
        const years = parseInt(safeTrim(formData.yearsOfExperience));
        let experienceLevel = 'Mid';
        if (years <= 2) {
          experienceLevel = 'Junior';
        } else if (years <= 5) {
          experienceLevel = 'Mid';
        } else if (years <= 8) {
          experienceLevel = 'Senior';
        } else {
          experienceLevel = 'Lead';
        }
        
        // Vérifier si la bio contient déjà des années d'expérience
        if (tempValue.includes('Années d\'expérience:')) {
          // Remplacer les années existantes
          updateData.bio = tempValue.replace(
            /Années d'expérience: \d+ ans \([^)]+\)/,
            `Années d'expérience: ${years} ans (${experienceLevel})`
          );
        } else {
          // Ajouter les années d'expérience au début de la bio
          updateData.bio = `Années d'expérience: ${years} ans (${experienceLevel})\n\n${tempValue}`;
        }
      }
      
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.CANDIDATES}${formData.id}/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setMessage('✅ Champ mis à jour avec succès');
        setTimeout(() => setMessage(''), 3000);
        
        // Ne pas recharger automatiquement la page - les données sont déjà mises à jour localement
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSavingInline(false);
      setEditingField(null);
      setTempValue('');
    }
  };

  // Fonction pour annuler l'abonnement
  const handleCancelSubscription = async () => {
    if (!formData.id || !user) {
      alert('Erreur: Profil candidat non trouvé');
      return;
    }

    setIsCancelling(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = buildApiUrl(`${API_ENDPOINTS.CANDIDATES}${formData.id}/cancel-subscription/`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Stocker les informations d'annulation
        setCancellationInfo({
          access_until: result.access_until,
          cancellation_scheduled: result.cancellation_scheduled
        });
        
        // Ne pas changer le plan immédiatement - l'utilisateur garde l'accès
        // setCandidatePlan('free'); // Supprimé car l'utilisateur garde l'accès
        
        // Déclencher l'événement pour mettre à jour l'interface
        window.dispatchEvent(new CustomEvent('planUpdated', {
          detail: { 
            plan: candidatePlan, // Garder le plan actuel
            cancellation_scheduled: true,
            access_until: result.access_until
          }
        }));
        
        setMessage('✅ Annulation programmée. Vous gardez l\'accès premium jusqu\'à la fin de votre période.');
        setTimeout(() => setMessage(''), 5000);
        
        // Recharger le profil pour s'assurer que les données sont à jour
        setTimeout(() => {
          loadExistingProfile();
        }, 1000);
        
      } else {
        const errorData = await response.json();
        // Gestion spéciale pour le service indisponible
        if (response.status === 503) {
          throw new Error('Le service d\'annulation est temporairement indisponible. Veuillez contacter le support à hello@loicbernard.com pour annuler votre abonnement.');
        }
        
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur lors de l'annulation: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsCancelling(false);
    }
  };

  // Composant pour les champs éditables
  const EditableField = ({ fieldName, value, placeholder, type = 'text', className = '', options = null, required = true }) => {
    const isEditing = editingField === fieldName;
    const isEmpty = !value || safeTrim(value) === '';
    const isRequired = required && fieldName !== 'github';
    
    return (
      <div className={`relative group ${className}`}>
        {isEditing ? (
          <div className="flex items-center gap-2">
            {options ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  isRequired && !tempValue ? 'border-red-300' : 'border-blue-300'
                }`}
                autoFocus
                required={isRequired}
              >
                {isRequired && (
                  <option value="">Sélectionnez une option</option>
                )}
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              fieldName === 'bio' ? (
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isRequired && !tempValue ? 'border-red-300' : 'border-blue-300'
                  }`}
                  placeholder={placeholder}
                  rows={4}
                  autoFocus
                  required={isRequired}
                />
              ) : (
                <input
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isRequired && !tempValue ? 'border-red-300' : 'border-blue-300'
                  }`}
                  placeholder={placeholder}
                  autoFocus
                  required={isRequired}
                />
              )
            )}
            <button
              onClick={saveInlineEdit}
              disabled={isSavingInline || (isRequired && !safeTrim(tempValue))}
              className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-full transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isSavingInline ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={cancelEditing}
              disabled={isSavingInline}
              className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`flex-1 ${isRequired && isEmpty ? 'text-red-500 italic' : ''}`}>
              {value || (isRequired ? `${placeholder} *` : placeholder)}
            </span>
            <button
              onClick={() => startEditing(fieldName, value)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Fonction pour vérifier si tous les champs obligatoires sont remplis
  const areRequiredFieldsFilled = () => {
    const requiredFields = {
      name: 'Nom complet',
      title: 'Métier',
      location: 'Localisation',
      bio: 'Présentation',
      skills: 'Compétences'
    };

    // Valeurs par défaut acceptées comme valides
    const defaultValues = {
      title: DEFAULT_VALUES.title,
      location: DEFAULT_VALUES.location,
      bio: DEFAULT_VALUES.bio,
      skills: DEFAULT_VALUES.skills
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData[field];
      const defaultValue = defaultValues[field];
      const isEmpty = !value || safeTrim(value) === '';
      const isDefaultValue = defaultValue && safeTrim(value) === defaultValue;
      
      // Un champ est valide s'il n'est pas vide OU s'il a une valeur par défaut
      if (isEmpty && !isDefaultValue) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!user) {
      setMessage('Vous devez être connecté pour créer un profil');
      setIsLoading(false);
      return;
    }

    // Validation des champs obligatoires pour les profils 'new' ou nouveaux
    if (!formData.id || candidateStatus === 'new') {
      const requiredFields = {
        name: 'Nom complet',
        title: 'Métier',
        location: 'Localisation',
        bio: 'Présentation',
        skills: 'Compétences'
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        const value = formData[field];
        const isEmpty = !value || safeTrim(value) === '';
        if (isEmpty) {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        const errorMsg = `❌ Veuillez remplir tous les champs obligatoires : ${missingFields.join(', ')}`;
        setMessage(errorMsg);
        setIsLoading(false);
        return;
      }
      }

    try {
      let photoUrl = null;
      
      // Gestion de la photo
      if (formData.photo?.file) {
        // Nouvelle photo uploadée
        const fileExt = formData.photo.file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData.photo.file);
          
        if (uploadError) {
          throw new Error(`Erreur lors de l'upload de la photo: ${uploadError.message}`);
        }
        
        // Récupérer l'URL publique de la photo
        const { data: publicUrl } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
          
        photoUrl = publicUrl.publicUrl;
        
      } else if (formData.photo?.removed) {
        // Photo supprimée explicitement
        photoUrl = null;
      } else if (formData.photo?.existing) {
        // Photo existante conservée
        photoUrl = formData.photo.existing;
      } else {
        // Pas de photo (supprimée ou jamais ajoutée)
        photoUrl = null;
      }

      // Créer la bio structurée avec les années d'expérience
      let structuredBio = formData.bio || '';
      
      // Si des années d'expérience sont spécifiées, les intégrer dans la bio
      if (formData.yearsOfExperience && safeTrim(formData.yearsOfExperience)) {
        const years = parseInt(safeTrim(formData.yearsOfExperience));
        
        // Déterminer automatiquement le niveau d'expérience basé sur les années
        let experienceLevel = 'Mid'; // Valeur par défaut
        if (years <= 2) {
          experienceLevel = 'Junior';
        } else if (years <= 5) {
          experienceLevel = 'Mid';
        } else if (years <= 8) {
          experienceLevel = 'Senior';
        } else {
          experienceLevel = 'Lead';
        }
        
        // Vérifier si la bio contient déjà des années d'expérience
        if (structuredBio.includes('Années d\'expérience:')) {
          // Remplacer les années existantes
          structuredBio = structuredBio.replace(
            /Années d'expérience: \d+ ans \([^)]+\)/,
            `Années d'expérience: ${years} ans (${experienceLevel})`
          );
        } else {
          // Ajouter les années d'expérience au début de la bio
          structuredBio = `Années d'expérience: ${years} ans (${experienceLevel})\n\n${structuredBio}`;
        }
      }

      // Créer le profil du candidat avec tous les champs
      const candidateData = {
        name: formData.name,
        email: formData.email,
        bio: structuredBio,
        // Logique de statut :
        // - Nouveaux profils : toujours en attente de validation
        // - Profils rejetés : remettre en attente après modification
        // - Profils approuvés : garder le statut approved après modification
        // - Profils pending : garder le statut pending après modification
        status: formData.id
          ? (candidateStatus === 'rejected' ? 'pending'
             : candidateStatus === 'new' ? 'pending'
             : candidateStatus) // Garder le statut actuel pour approved et pending
          : 'pending', // Nouveau profil
        // approved supprimé - utilise uniquement status
        // visible supprimé - utilise uniquement status
        // Tous les champs du formulaire
        title: formData.title || DEFAULT_VALUES.title,
        location: formData.location || DEFAULT_VALUES.location,
        remote: formData.remote || DEFAULT_VALUES.remote,
        yearsOfExperience: formData.yearsOfExperience || DEFAULT_VALUES.yearsOfExperience,
        skills: getSkillsArray(formData.skills),
        portfolio: formData.portfolio || '',
        linkedin: formData.linkedin || '',
        github: formData.github || '',
        photo: photoUrl,
        dailyRate: formData.dailyRate || DEFAULT_VALUES.dailyRate,
        annualSalary: formData.annualSalary || DEFAULT_VALUES.annualSalary
      };

      // Déterminer l'URL et la méthode selon si le profil existe déjà
      const url = formData.id 
        ? buildApiUrl(`${API_ENDPOINTS.CANDIDATES}${formData.id}/`)
        : buildApiUrl(`${API_ENDPOINTS.CANDIDATES}`);
      const method = formData.id ? 'PUT' : 'POST';
      
      // Obtenir le token une seule fois
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        setMessage('❌ Erreur d\'authentification. Veuillez vous reconnecter.');
        return;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(candidateData)
      });

      if (response.ok) {
        // L'API PUT retourne souvent une réponse vide, donc on recharge directement le profil
        const isUpdate = formData.id ? 'mis à jour' : 'créé';
        
        if (!formData.id) {
          // Nouveau profil créé - informer qu'il est en attente
          setMessage(`✅ Profil créé avec succès ! Votre profil est maintenant en attente de validation par notre équipe.`);
        } else if (candidateStatus === 'rejected') {
          // Profil rejeté mis à jour - informer qu'il est remis en attente
          setMessage(`✅ Profil modifié avec succès ! Votre profil a été remis en attente de validation par notre équipe.`);
          // Remettre le statut à pending et sortir du mode édition
          setCandidateStatus('pending');
          setIsEditingRejected(false);
        } else if (candidateStatus === 'new') {
          // Profil nouveau envoyé pour validation - message spécial
          setMessage(`✅ Profil en attente pour examen. Votre profil a été envoyé avec succès et est maintenant en cours d'examen par notre équipe.`);
          // Changer le statut à pending et sortir du mode édition
          setCandidateStatus('pending');
          setIsEditingNew(false);
        } else {
          // Profil mis à jour normalement
          setMessage(`✅ Profil mis à jour avec succès !`);
        }
        
        // Faire disparaître le message après 5 secondes pour les nouveaux profils
        setTimeout(() => {
          setMessage('');
        }, formData.id ? 3000 : 5000);
        
        // Ne pas recharger automatiquement - les données sont déjà mises à jour localement
      } else {
        const errorData = await response.json();
        const action = formData.id ? 'mettre à jour' : 'créer';
        setMessage(`Erreur: ${errorData.message || `Impossible de ${action} le profil`}`);
      }
    } catch (error) {
      setMessage(`Erreur lors de la création du profil: ${error.message}`);
      } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement de votre profil...</h1>
          <p className="text-gray-600">Récupération de vos informations</p>
        </div>
      </div>
    );
  }

  // Affichage erreur de chargement (ne pas montrer l'UI "new" dans ce cas)
  if (profileLoadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Impossible de charger votre profil</h2>
          <p className="text-red-700 mb-4">{typeof profileLoadError === 'string' ? profileLoadError : 'Une erreur est survenue.'}</p>
          <button
            onClick={() => loadExistingProfile()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Interface pour les candidats en attente
  if (candidateStatus === 'pending') {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link 
                to="/my-profile/talent" 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
            
          </motion.div>

          {/* Message d'attente */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Check className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-yellow-800">Profil en attente de validation</h2>
            </div>
            <p className="text-yellow-700 mb-4">
              Votre profil a été soumis avec succès ! Notre équipe examine actuellement votre candidature 
              et vous contactera sous peu pour vous informer de la suite du processus.
            </p>
          </motion.div>

          {/* Actions désactivées pour l'état en attente */}
        </div>
      </div>
    );
  }

  // Interface pour les candidats avec statut "new" (nouveaux profils) - sauf s'ils sont en mode édition
  if (candidateStatus === 'new' && !isEditingNew) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link 
                to="/my-profile/talent" 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
            
          </motion.div>

          {/* Message pour nouveau profil */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Parlez-nous un peu de vous !</h2>
            <p className="text-blue-700">
              C'est le moment de créer votre profil, soyez le plus précis et honnête possible.
            </p>
          </motion.div>

          {/* Bouton pour compléter le profil */}
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Ouvrir l'éditeur de profil in-line pour les utilisateurs avec statut "new"
                  setIsEditingNew(true);
                  navigateToTab('view');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl font-semibold cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 1000 }}
              >
                <Edit className="w-5 h-5" />
                Compléter mon profil
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Interface pour les candidats rejetés (sauf s'ils sont en mode édition)
  if (candidateStatus === 'rejected' && !isEditingRejected) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link 
                to="/my-profile/talent" 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-red-600 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
                <p className="text-gray-600">Votre profil candidat</p>
              </div>
            </div>
          </motion.div>

          {/* Message de rejet */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800">Profil non retenu</h2>
            </div>
            <p className="text-red-700 mb-4">
              Nous avons examiné votre candidature avec attention. Malheureusement, votre profil ne correspond 
              pas actuellement aux critères recherchés par nos recruteurs partenaires.
            </p>
          </motion.div>

          {/* Message d'encouragement et possibilité de révision */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Que faire maintenant ?</h2>
            </div>
            <div className="text-blue-700 space-y-3">
              <p>
                Ne vous découragez pas ! Voici quelques suggestions pour améliorer votre profil :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Enrichissez votre description professionnelle avec des projets concrets</li>
                <li>Ajoutez des compétences techniques spécifiques à votre domaine</li>
                <li>Incluez des liens vers vos réalisations (portfolio, GitHub, etc.)</li>
                <li>Mettez à jour votre expérience et vos formations</li>
              </ul>
              <p className="font-medium">
                Vous pouvez modifier votre profil à tout moment. Une fois amélioré, 
                il sera automatiquement soumis pour une nouvelle évaluation.
              </p>
            </div>
          </motion.div>

          {/* Bouton pour modifier le profil */}
          <div className="text-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Permettre la modification du profil même si rejeté
                  setIsEditingRejected(true);
                  navigateToTab('view');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 1000 }}
              >
                <Edit className="w-5 h-5" />
                Modifier mon profil
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {/* Header avec bouton retour et onglets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link 
              to="/my-profile/talent" 
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            
            {/* Onglets de navigation */}
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 flex">
              {isCandidate && (
                <>
                  <button
                    onClick={() => navigateToTab('view')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'view'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Profil
                  </button>
                  <button
                    onClick={() => navigateToTab('talents')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'talents'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    Talents
                  </button>
                  <button
                    onClick={() => navigateToTab('offers')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'offers'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    Offres
                  </button>
                  <button
                    onClick={() => navigateToTab('forum')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'forum'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    Forum
                  </button>
                  <button
                    onClick={() => navigateToTab('stats')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'stats'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Statistiques
                  </button>
                  <button
                    onClick={() => navigateToTab('plan')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'plan'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    Mon plan
                  </button>
                </>
              )}
              {isRecruiter && (
                <>
                  <button
                    onClick={() => navigateToTab('offer')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'offer'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    Mon offre
                  </button>
                  <button
                    onClick={() => navigateToTab('plan')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'plan'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    Mon plan
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'view' && (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenu principal */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 backdrop-blur-sm relative">
                        {/* Badges en haut à droite */}
                        <div className="absolute top-4 right-4 flex items-center gap-3">
                          {/* Bouton pour voir le profil public */}
                          <Link 
                            to={`/my-profile/talent/${formData.id}`}
                            className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Voir mon profil public"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          
                          {(candidatePlan === 'premium' || candidatePlan === 'elite') && (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg ${
                              candidatePlan === 'elite' 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                                : 'bg-blue-600'
                            }`}>
                              <span className={candidatePlan === 'elite' ? 'text-amber-100' : 'text-blue-200'}>⭐</span>
                              {candidatePlan === 'elite' ? 'Elite' : 'Premium'}
                            </span>
                          )}
                        </div>
                        
                        {/* Header du profil */}
                        <div className="flex items-start gap-6 mb-8">
                          {/* Photo de profil */}
                          <div className="relative">
                            {formData.photo?.existing || formData.photo?.preview ? (
                              <img
                                src={formData.photo.existing || formData.photo.preview}
                                alt={`Photo de ${formData.name}`}
                                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=96&background=6366f1&color=ffffff&bold=true`;
                                }}
                              />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=96&background=6366f1&color=ffffff&bold=true`}
                                alt={`Avatar de ${formData.name}`}
                                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                              />
                            )}
                            
                            {/* Bouton d'import de photo */}
                            <button
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        photo: {
                                          file: file,
                                          preview: event.target.result
                                        }
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <EditableField
                                fieldName="name"
                                value={formData.name}
                                placeholder="Ex: Marie Dubois"
                                className="text-4xl font-bold text-gray-900"
                              />
                            </div>
                            <div className="mb-4">
                              <EditableField
                                fieldName="title"
                                value={formData.title || 'Product Designer'}
                                placeholder="Ex: Product Designer, UX Researcher"
                                className="text-xl text-gray-600"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              {formData.yearsOfExperience && (
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                  parseInt(formData.yearsOfExperience) <= 1 ? 'bg-green-100 text-green-800 border border-green-200' :
                                  parseInt(formData.yearsOfExperience) <= 3 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  parseInt(formData.yearsOfExperience) <= 6 ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                  parseInt(formData.yearsOfExperience) <= 10 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {parseInt(formData.yearsOfExperience) === 1 ? '1 an XP' : `${formData.yearsOfExperience} ans XP`}
                                </span>
                              )}
                              {formData.location && (
                                <div className="flex items-center text-gray-500">
                                  <MapPin className="w-5 h-5 mr-2" />
                                  <span>{formData.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-6 h-6 text-blue-600" />
                            À propos
                          </h2>
                          <div className="bg-gray-50 rounded-2xl p-6">
                            <EditableField
                              fieldName="bio"
                              value={formData.bio}
                              placeholder="Décrivez votre parcours et vos spécialités en design..."
                              className="text-gray-700 leading-relaxed text-lg"
                            />
                          </div>
                        </div>

                        {/* Compétences */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                              <Briefcase className="w-6 h-6 text-blue-600" />
                              Compétences
                              {getSkillsArray(formData.skills).length === 0 && (
                                <span className="text-red-500 text-lg font-bold">*</span>
                              )}
                            </h2>
                             <button
                               onClick={() => {
                                 const newSkill = prompt('Ajouter une nouvelle compétence:');
                                 if (newSkill && safeTrim(newSkill)) {
                                   const currentSkills = getSkillsArray(formData.skills);
                                   const updatedSkills = [...currentSkills, safeTrim(newSkill)];
                                   setFormData(prev => ({
                                     ...prev,
                                     skills: updatedSkills.join(', ')
                                   }));
                                   // Sauvegarder automatiquement
                                   setTimeout(async () => {
                                     try {
                                       const session = await supabase.auth.getSession();
                                       const token = session.data.session?.access_token;
                                       
                                       if (!token) {
                                         throw new Error('Token d\'authentification manquant');
                                       }

                                       const updateData = { skills: updatedSkills };
                                       
                                       const response = await fetch(buildApiUrl(`${API_ENDPOINTS.CANDIDATES}${formData.id}/`), {
                                         method: 'PUT',
                                         headers: {
                                           'Content-Type': 'application/json',
                                           'Authorization': `Bearer ${token}`
                                         },
                                         body: JSON.stringify(updateData)
                                       });

                                       if (response.ok) {
                                         setMessage('✅ Compétence ajoutée avec succès');
                                         setTimeout(() => setMessage(''), 3000);
                                       } else {
                                         throw new Error('Erreur lors de la sauvegarde');
                                       }
                                     } catch (error) {
                                       setMessage(`❌ Erreur: ${error.message}`);
                                       setTimeout(() => setMessage(''), 3000);
                                     }
                                   }, 100);
                                 }
                               }}
                               className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                               title="Ajouter une compétence"
                             >
                               <span className="text-lg font-bold">+</span>
                             </button>
                          </div>
                          
                          <div className="space-y-4">
           {/* Tags interactifs */}
           {getSkillsArray(formData.skills).length > 0 ? (
             <div className="flex flex-wrap" style={{ gap: '1.4rem' }}>
               {getSkillsArray(formData.skills).map((skill, index) => (
                 <div
                   key={index}
                   className="group relative"
                 >
                   <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer shadow-sm">
                     {safeTrim(skill)}
                   </span>
                   <button
                     onClick={() => {
                       const skillsArray = getSkillsArray(formData.skills);
                       const newSkills = skillsArray.filter((_, i) => i !== index);
                       setFormData(prev => ({
                         ...prev,
                         skills: newSkills.join(', ')
                       }));
                       // Sauvegarder automatiquement
                       setTimeout(async () => {
                         try {
                           if (!formData.id) {
                             throw new Error('ID du profil manquant');
                           }
                           
                           const session = await supabase.auth.getSession();
                           const token = session.data.session?.access_token;
                           
                           if (!token) {
                             throw new Error('Token d\'authentification manquant');
                           }

                           const updateData = { skills: newSkills };
                           const url = buildApiUrl(`${API_ENDPOINTS.CANDIDATES}${formData.id}/`);
                           
                           const response = await fetch(url, {
                             method: 'PUT',
                             headers: {
                               'Content-Type': 'application/json',
                               'Authorization': `Bearer ${token}`
                             },
                             body: JSON.stringify(updateData)
                           });

                           if (response.ok) {
                             setMessage('✅ Compétence supprimée avec succès');
                             setTimeout(() => setMessage(''), 3000);
                           } else {
                             const errorText = await response.text();
                             throw new Error(`Erreur ${response.status}: ${errorText}`);
                           }
                         } catch (error) {
                           setMessage(`❌ Erreur: ${error.message}`);
                           setTimeout(() => setMessage(''), 3000);
                         }
                       }, 100);
                     }}
                     className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                   >
                     ×
                   </button>
                 </div>
               ))}
             </div>
                            ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 mb-2">Aucune compétence spécifiée</p>
                                <p className="text-sm text-gray-400">Cliquez sur "Ajouter" pour commencer</p>
                              </div>
                            )}
                            
                            {/* Champ d'édition rapide - seulement si il y a des compétences */}
                            {formData.skills && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">Édition rapide :</p>
                                <EditableField
                                  fieldName="skills"
                                  value={formData.skills}
                                  placeholder="Ex: Design System, Recherche utilisateur, Prototypage, Figma, Adobe Creative Suite"
                                  className="text-sm text-gray-600"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Liens */}
                        <div className="border-t border-gray-200 pt-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">Liens et portfolio</h2>
                          <div className="space-y-4">
                            {/* LinkedIn */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <ExternalLink className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">LinkedIn</p>
                                <EditableField
                                  fieldName="linkedin"
                                  value={formData.linkedin || 'https://linkedin.com/in/mon-profil-design'}
                                  placeholder="https://linkedin.com/in/mon-profil-design"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>

                            {/* Portfolio */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Globe className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Portfolio</p>
                                <EditableField
                                  fieldName="portfolio"
                                  value={formData.portfolio || 'https://mon-portfolio-design.com'}
                                  placeholder="https://mon-portfolio-design.com"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>

                            {/* GitHub */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <ExternalLink className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">GitHub</p>
                                <EditableField
                                  fieldName="github"
                                  value={formData.github || 'https://github.com/mon-profil-design'}
                                  placeholder="https://github.com/mon-profil-design"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Boutons de liens si les URLs sont présentes */}
                          {(formData.linkedin || formData.portfolio || formData.github) && (
                            <div className="mt-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accès rapide</h3>
                              <div className="flex flex-wrap gap-4">
                                {formData.linkedin && (
                                  <a
                                    href={formData.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border border-blue-200"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                    LinkedIn
                                  </a>
                                )}
                                {formData.portfolio && (
                                  <a
                                    href={formData.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                                  >
                                    <Globe className="w-5 h-5" />
                                    Portfolio
                                  </a>
                                )}
                                {formData.github && (
                                  <a
                                    href={formData.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                    GitHub
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barre latérale droite - Bloc Informations */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20 backdrop-blur-sm sticky top-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Star className="w-5 h-5 text-blue-600" />
                          Informations
                        </h3>
                        
                        <div className="space-y-6">
                          {/* Localisation */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Localisation</p>
                                <EditableField
                                  fieldName="location"
                                  value={formData.location}
                                  placeholder=""
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Remote */}
                          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Globe className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500 mb-1">Mode de travail</p>
                              <EditableField
                                fieldName="remote"
                                value={formData.remote === 'remote' ? 'Full remote' :
                                       formData.remote === 'onsite' ? 'Sur site' :
                                       formData.remote === 'hybrid' ? 'Hybride' : 'Hybride'}
                                placeholder="Ex: Paris, France"
                                className="font-semibold text-gray-900"
                                options={[
                                  { value: 'remote', label: 'Full remote' },
                                  { value: 'hybrid', label: 'Hybride' },
                                  { value: 'onsite', label: 'Sur site' }
                                ]}
                              />
                            </div>
                          </div>

                          {/* Années d'expérience */}
                          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500 mb-1">Années d'expérience</p>
                                <EditableField
                                  fieldName="yearsOfExperience"
                                  value={formData.yearsOfExperience || '0'}
                                  placeholder="Ex: 3"
                                  type="number"
                                  className="font-semibold text-gray-900"
                                />
                            </div>
                          </div>

                          {/* Rémunération */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">TJM</p>
                                <EditableField
                                  fieldName="dailyRate"
                                  value={formData.dailyRate ? `${formData.dailyRate} €` : 'Non renseigné'}
                                  placeholder="Ex: 500"
                                  type="number"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Salaire annuel</p>
                                <EditableField
                                  fieldName="annualSalary"
                                  value={formData.annualSalary ? `${formData.annualSalary} €` : 'Non renseigné'}
                                  placeholder="Ex: 45000"
                                  type="number"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Profil créé */}
                          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Profil créé</p>
                              <p className="font-semibold text-gray-900">
                                {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                              </p>
                            </div>
                          </div>

                          {/* Statut de vérification - seulement pour les profils approuvés */}
                          {candidateStatus === 'approved' && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <div>
                                <p className="text-sm font-medium text-emerald-800">Profil vérifié</p>
                                <p className="text-xs text-emerald-600">Candidat validé par notre équipe</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Statut en attente - pour les profils 'new' et 'pending' */}
                          {(candidateStatus === 'new' || candidateStatus === 'pending') && (
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">
                                  {candidateStatus === 'pending' ? 'Profil en attente de validation' : 'Complétez votre profil'}
                                </p>
                                <p className="text-xs text-yellow-600">
                                  {candidateStatus === 'pending' ? 'Votre profil est en cours d\'examen par notre équipe' : 'Remplissez les champs requis et envoyez votre profil pour examen'}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Statut rejeté - pour les profils 'rejected' */}
                          {candidateStatus === 'rejected' && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Profil rejeté</p>
                                <p className="text-xs text-red-600">Votre profil nécessite des modifications avant validation</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'talents' && (
            <motion.div
              key="talents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                  {/* Injecte la page Talents dans l'onglet */}
                  <div className="bg-white rounded-2xl shadow-xl p-2 border border-white/20 backdrop-blur-sm">
                    <Suspense fallback={<div className="p-6 text-center">Chargement des talents...</div>}>
                      <CandidatesListPage />
                    </Suspense>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="bg-white rounded-2xl shadow-xl p-2 border border-white/20 backdrop-blur-sm">
                    <Suspense fallback={<div className="p-6 text-center">Chargement des offres...</div>}>
                      <JobsPage />
                    </Suspense>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'forum' && (
            <motion.div
              key="forum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="bg-white rounded-2xl shadow-xl p-2 border border-white/20 backdrop-blur-sm">
                    <Suspense fallback={<div className="p-6 text-center">Chargement du forum...</div>}>
                      <ForumPage />
                    </Suspense>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoadingStats ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des statistiques...</h2>
                  <p className="text-gray-600">Récupération de vos données</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Vérification du plan pour l'accès aux statistiques */}
                  {candidatePlan === 'free' ? (
                    <div className="bg-gradient-to-br from-blue-50/20 to-indigo-50/20 rounded-3xl p-8 shadow-xl border border-blue-100 overflow-hidden relative">
                      {/* Pattern décoratif */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
                      
                      <div className="relative text-center">
                        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl mx-auto mb-6 w-fit">
                          <Eye className="w-12 h-12 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Statistiques Premium</h3>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                          Accédez à vos statistiques détaillées et suivez la performance de votre profil avec un plan Premium ou Pro.
                        </p>
                        
                        <button
                          onClick={() => navigate('/pricing')}
                          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          Débloquer les statistiques
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 shadow-xl border border-blue-100/50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                                <Eye className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Vues du profil</h3>
                                <p className="text-sm text-gray-500">Total des visites</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                {profileStats.profileViews}
                              </p>
                              <p className="text-sm text-gray-500 font-medium mt-1">
                                {profileStats.profileViews === 1 ? 'vue' : 'vues'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl p-8 shadow-xl border border-indigo-100/50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                                <Eye className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Vues aujourd'hui</h3>
                                <p className="text-sm text-gray-500">Visites du jour</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                                {profileStats.profileViewsToday || 0}
                              </p>
                              <p className="text-sm text-gray-500 font-medium mt-1">
                                {profileStats.profileViewsToday === 1 ? 'vue' : 'vues'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Graphique des vues avec contrôles */}
                  {candidatePlan === 'free' ? (
                    <div className="bg-gradient-to-br from-purple-50/20 to-pink-50/20 rounded-3xl p-8 shadow-xl border border-purple-100 overflow-hidden relative">
                      {/* Pattern décoratif */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -translate-y-18 translate-x-18"></div>
                      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-full translate-y-14 -translate-x-14"></div>
                      
                      <div className="relative text-center">
                        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-2xl mx-auto mb-6 w-fit">
                          <BarChart3 className="w-12 h-12 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Graphiques Premium</h3>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                          Visualisez l'évolution de vos vues avec des graphiques détaillés et des analyses temporelles.
                        </p>
                        
                        <button
                          onClick={() => navigate('/pricing')}
                          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          Débloquer les graphiques
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header avec titre et contrôles */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Vues du profil
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {chartPeriod === 'week' && 'Évolution sur 7 jours'}
                          {chartPeriod === 'month' && 'Évolution sur 30 jours'}
                          {chartPeriod === 'year' && `Évolution sur 12 mois - ${new Date().getFullYear() - chartOffset}`}
                        </p>
                      </div>
                      
                      {/* Contrôles de navigation */}
                      <div className="flex flex-col items-center gap-2">
                        {/* Affichage de la période actuelle */}
                        <div className="text-sm font-medium text-gray-700">
                          {chartPeriod === 'week' && (() => {
                            const now = new Date();
                            const targetDate = new Date(now);
                            targetDate.setDate(targetDate.getDate() - (chartOffset * 7));
                            const weekNumber = Math.ceil(targetDate.getDate() / 7);
                            const monthName = targetDate.toLocaleDateString('fr-FR', { month: 'long' });
                            const year = targetDate.getFullYear();
                            return `Semaine ${weekNumber} - ${monthName} ${year}`;
                          })()}
                          {chartPeriod === 'month' && (() => {
                            const now = new Date();
                            const targetDate = new Date(now.getFullYear(), now.getMonth() - chartOffset, 1);
                            const monthName = targetDate.toLocaleDateString('fr-FR', { month: 'long' });
                            const year = targetDate.getFullYear();
                            return `${monthName} ${year}`;
                          })()}
                          {chartPeriod === 'year' && (() => {
                            const year = new Date().getFullYear() - chartOffset;
                            return `Année ${year}`;
                          })()}
                        </div>
                        
                        <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1">
                          <button
                            onClick={() => handleNavigation('prev')}
                            className="p-3 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md group"
                            title="Période précédente"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          </button>
                          
                          <div className="w-px h-8 bg-gray-200 mx-1"></div>
                          
                          <button
                            onClick={() => handleNavigation('next')}
                            className="p-3 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md group"
                            title="Période suivante"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Filtres de période */}
                    <div className="flex gap-3 mb-8">
                      <button
                        onClick={() => handlePeriodChange('week')}
                        className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                          chartPeriod === 'week'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                        }`}
                      >
                        Semaine
                      </button>
                      <button
                        onClick={() => handlePeriodChange('month')}
                        className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                          chartPeriod === 'month'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                        }`}
                      >
                        Mois
                      </button>
                      <button
                        onClick={() => handlePeriodChange('year')}
                        className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                          chartPeriod === 'year'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                        }`}
                      >
                        Année
                      </button>
                    </div>

                    {/* Graphique */}
                    <div className="h-80 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                      {isLoadingChart ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="text-gray-500 font-medium">Chargement des données...</p>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid 
                              strokeDasharray="2 8" 
                              stroke="#e5e7eb" 
                              strokeOpacity={0.6}
                              vertical={false}
                            />
                            <XAxis 
                              dataKey="date" 
                              stroke="#6b7280"
                              fontSize={13}
                              fontWeight={500}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: '#6b7280' }}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={13}
                              fontWeight={500}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                              tick={{ fill: '#6b7280' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: 'none',
                                borderRadius: '16px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                padding: '12px 16px'
                              }}
                              labelStyle={{ 
                                color: '#1f2937', 
                                fontWeight: '600',
                                fontSize: '14px',
                                marginBottom: '8px'
                              }}
                              formatter={(value, name) => [
                                `${value} vue${value > 1 ? 's' : ''}`, 
                                'Vues'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="views" 
                              stroke="url(#colorGradient)"
                              strokeWidth={4}
                              dot={{ 
                                fill: '#3b82f6', 
                                strokeWidth: 3, 
                                r: 6,
                                stroke: '#ffffff',
                                filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))'
                              }}
                              activeDot={{ 
                                r: 8, 
                                stroke: '#3b82f6', 
                                strokeWidth: 3,
                                fill: '#ffffff',
                                filter: 'drop-shadow(0 8px 12px rgba(59, 130, 246, 0.4))'
                              }}
                              fill="url(#colorGradient)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Informations générales */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 overflow-hidden">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900">Informations générales</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-yellow-100 rounded-xl">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Membre depuis</h4>
                        </div>
                        <p className="text-gray-700 font-medium text-lg">
                          {profileStats.joinDate ? new Date(profileStats.joinDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Non disponible'}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Dernière activité</h4>
                        </div>
                        <p className="text-gray-700 font-medium text-lg">
                          {profileStats.lastActivity ? new Date(profileStats.lastActivity).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Non disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Bouton "Envoyer mon profil" pour les candidats non approuvés */}
              {(() => {
                // Logique : afficher le bouton pour les profils qui peuvent envoyer/modifier
                const shouldShow = candidateStatus === 'new' || candidateStatus === 'pending' || candidateStatus === 'rejected';
                
                return shouldShow;
              })()}
              
             {/* Message debug supprimé */}
              

              {(!formData.id || candidateStatus === 'new' || candidateStatus === 'pending' || candidateStatus === 'rejected') && (
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-white/20 backdrop-blur-sm">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {!formData.id ? 'Créer votre profil candidat' : 
                       candidateStatus === 'new' ? 'Valider votre profil candidat' :
                       candidateStatus === 'pending' ? 'Modifier votre profil' : 
                       candidateStatus === 'rejected' ? 'Modifier votre profil rejeté' : 
                       'Finaliser votre profil'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {!formData.id ? 
                        'Remplissez tous les champs requis et cliquez sur "Envoyer mon profil" pour créer votre candidature.' :
                        candidateStatus === 'new' ?
                          'Votre profil a été créé automatiquement lors de l\'inscription. Complétez-le et cliquez sur "Envoyer mon profil pour examen" pour le soumettre à validation.' :
                        candidateStatus === 'pending' ? 
                          'Votre profil a été soumis et est en cours de validation. Modifiez les champs nécessaires et cliquez sur "Modifier et renvoyer mon profil" pour soumettre à nouveau votre candidature.' :
                        candidateStatus === 'rejected' ?
                          'Modifiez votre profil et cliquez sur "Modifier et renvoyer mon profil" pour le soumettre à nouveau à validation.' :
                          'Remplissez tous les champs requis et cliquez sur "Envoyer mon profil" pour soumettre votre candidature.'
                      }
                    </p>
                    
                    {/* Information sur les champs obligatoires pour le statut 'new' */}
                    {candidateStatus === 'new' && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                          📋 Champs obligatoires à remplir :
                        </h4>
                        <div className="text-sm text-blue-700 grid grid-cols-2 gap-1">
                          <div>• Nom complet</div>
                          <div>• Métier</div>
                          <div>• Localisation</div>
                          <div>• Présentation</div>
                          <div>• Compétences</div>
                          <div>• Portfolio</div>
                          <div>• LinkedIn</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Message d'information */}
                    {message && (
                      <div className={`mb-6 p-4 rounded-2xl ${
                        message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
                        message.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' :
                        'bg-blue-50 border border-blue-200 text-blue-800'
                      }`}>
                        {message}
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {!formData.id ? 'Envoyer mon profil' : 
                           candidateStatus === 'new' ? 'Envoyer mon profil pour examen' :
                           candidateStatus === 'pending' ? 'Modifier et renvoyer mon profil' : 
                           candidateStatus === 'rejected' ? 'Modifier et renvoyer mon profil' : 
                           'Envoyer mon profil'}
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-sm text-gray-500 mt-4">
                      En envoyant votre profil, vous acceptez qu'il soit soumis à validation par notre équipe.
                    </p>
                  </div>
                </div>
              )}

             {/* Bouton toujours visible supprimé (doublon) */}
            </motion.div>
          )}

          {/* Bouton permanent pour envoyer le profil en examen */}
          {(() => {
            return activeTab === 'view' && candidateStatus !== 'approved';
          })() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl border border-blue-500">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Prêt à soumettre votre profil ?
                  </h3>
                  <p className="text-blue-100 mb-4">
                    {areRequiredFieldsFilled() 
                      ? 'Envoyez votre profil pour qu\'il soit examiné par notre équipe'
                      : 'Remplissez tous les champs obligatoires pour pouvoir envoyer votre profil'
                    }
                  </p>
                  <button
                    onClick={(e) => {
                      handleSubmit(e);
                    }}
                    disabled={isLoading || !areRequiredFieldsFilled()}
                    className={`font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto relative z-10 ${
                      areRequiredFieldsFilled() 
                        ? 'bg-white text-blue-600 hover:bg-blue-50 cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        Envoi en cours...
                      </>
                    ) : areRequiredFieldsFilled() ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Envoyer mon profil pour examen
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Remplissez tous les champs obligatoires
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section Statistiques pour les Recruteurs */}
          {activeTab === 'stats' && isRecruiter && (
            <motion.div
              key="recruiter-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {recruiterLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement des données...</h2>
                  <p className="text-gray-600">Récupération de vos informations de recruteur</p>
                </div>
              ) : recruiter ? (
                <div className="space-y-8">
                  {/* Informations du plan */}
                  <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 shadow-xl border border-blue-100/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Votre Plan</h3>
                      <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold">
                        {getPlanInfo().name}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {getRemainingJobPosts()}
                        </div>
                        <div className="text-gray-600">Offres restantes</div>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques détaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Activité des Offres
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total publiées</span>
                          <span className="font-semibold">{recruiter.total_jobs_posted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Candidatures reçues</span>
                          <span className="font-semibold">{recruiter.total_applications_received || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Interactions Candidats
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Candidats contactés</span>
                          <span className="font-semibold">{recruiter.total_candidates_contacted || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statut de l'abonnement */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Statut de l'abonnement</h4>
                        <p className="text-gray-600">
                          {recruiter.subscription_status === 'active' ? (
                            <span className="text-green-600 font-semibold">✓ Actif</span>
                          ) : (
                            <span className="text-red-600 font-semibold">✗ Inactif</span>
                          )}
                        </p>
                        {recruiter.subscription_end_date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Expire le {new Date(recruiter.subscription_end_date).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{getPlanInfo().name}</div>
                        <div className="text-sm text-gray-600">Plan actuel</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-2xl mx-auto mb-6 w-fit">
                    <AlertCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Profil Recruteur Non Trouvé</h3>
                  <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                    Votre profil recruteur n'a pas été trouvé. Veuillez contacter le support.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Recharger la page
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 backdrop-blur-sm">
                    <div className="text-center mb-8">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl mx-auto mb-6 w-fit">
                        <DollarSign className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Mon Plan</h2>
                      <p className="text-gray-600 text-lg mb-4">
                        Gérez votre abonnement et accédez à toutes les fonctionnalités premium
                      </p>
                      <button
                        onClick={() => {
                          if (isRecruiter) {
                            // Recharger les données du recruteur
                            window.location.reload();
                          } else {
                          loadExistingProfile();
                          }
                          }}
                        disabled={isRefreshingPlan}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto ${
                          isRefreshingPlan 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isRefreshingPlan ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                            Actualisation...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 rotate-90" />
                            Actualiser
                          </>
                        )}
                      </button>
                    </div>

                    {/* Contenu différent selon le type d'utilisateur */}
                    {isRecruiter ? (
                      /* Plan recruteur */
                      <div className="space-y-8">
                        {/* Plan actuel recruteur */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Plan {getPlanInfo().name}
                              </h3>
                              <p className="text-gray-600">
                                {recruiter?.plan_type === 'starter' 
                                  ? 'Accès aux fonctionnalités de base pour le recrutement'
                                  : recruiter?.plan_type === 'max'
                                  ? 'Accès aux fonctionnalités avancées avec sélection sur-mesure'
                                  : recruiter?.plan_type === 'premium'
                                  ? 'Accès illimité à toutes les fonctionnalités'
                                  : 'Plan personnalisé'
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {recruiter?.plan_type === 'starter' 
                                  ? '19,99€'
                                  : recruiter?.plan_type === 'max'
                                  ? '79€'
                                  : recruiter?.plan_type === 'premium'
                                  ? 'Sur mesure'
                                  : 'Gratuit'
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {recruiter?.plan_type === 'premium' ? '' : '/mois'}
                              </div>
                            </div>
                          </div>

                          {/* Statut de l'abonnement */}
                          {recruiter?.subscription_status && (
                            <div className="flex items-center gap-2 mb-4">
                              <div className={`w-3 h-3 rounded-full ${
                                recruiter.subscription_status === 'active' ? 'bg-green-500' :
                                recruiter.subscription_status === 'trial' ? 'bg-yellow-500' :
                                recruiter.subscription_status === 'expired' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700">
                                Statut: {recruiter.subscription_status === 'active' ? 'Actif' :
                                         recruiter.subscription_status === 'trial' ? 'Essai' :
                                         recruiter.subscription_status === 'expired' ? 'Expiré' :
                                         recruiter.subscription_status}
                              </span>
                            </div>
                          )}

                          {/* Dates d'abonnement */}
                          {recruiter?.subscription_start_date && (
                            <div className="text-sm text-gray-600">
                              <p>Début d'abonnement: {new Date(recruiter.subscription_start_date).toLocaleDateString('fr-FR')}</p>
                              {recruiter.subscription_end_date && (
                                <p>Fin d'abonnement: {new Date(recruiter.subscription_end_date).toLocaleDateString('fr-FR')}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quotas et utilisation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-2">
                                {getRemainingJobPosts()}
                              </div>
                              <div className="text-gray-600 mb-2">Offres restantes</div>
                              <div className="text-sm text-gray-500">
                                {recruiter?.total_jobs_posted || 0} / {getPlanInfo().maxJobPosts} utilisées
                              </div>
                            </div>
                          </div>
                          
                          
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-600 mb-2">
                                ∞
                              </div>
                              <div className="text-gray-600 mb-2">Mises en avant</div>
                              <div className="text-sm text-gray-500">
                                Illimitées
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions pour recruteurs */}
                        <div className="flex justify-center gap-4 mt-8">
                          <button
                            onClick={() => window.open('/pricing', '_blank')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                          >
                            {recruiter?.plan_type === 'starter' ? 'Passer à Max' : 'Changer de plan'}
                          </button>
                          <button
                            onClick={() => window.open('/recruiter-dashboard', '_blank')}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                          >
                            Tableau de bord
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Plan candidat (logique existante) */
                      <div>
                        {/* Plan actuel candidat */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Plan {candidatePlan === 'free' ? 'Gratuit' : candidatePlan === 'premium' ? 'Premium' : candidatePlan === 'elite' ? 'Elite' : candidatePlan}
                            {cancellationInfo?.cancellation_scheduled && (
                              <span className="ml-2 text-sm font-normal text-orange-600">
                                (Annulé)
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600">
                            {candidatePlan === 'free' 
                              ? 'Accès aux fonctionnalités de base'
                              : candidatePlan === 'premium'
                              ? 'Accès aux fonctionnalités premium'
                              : candidatePlan === 'pro'
                              ? 'Accès aux fonctionnalités professionnelles'
                              : 'Plan personnalisé'
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {candidatePlan === 'free' 
                              ? '0€'
                              : candidatePlan === 'premium'
                              ? '7,99€'
                              : candidatePlan === 'pro'
                              ? '39€'
                              : 'Sur mesure'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidatePlan === 'free' ? '' : '/mois'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Statut d'annulation */}
                      {cancellationInfo?.cancellation_scheduled && (
                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <span className="text-orange-800 font-semibold">Annulation programmée</span>
                          </div>
                          <p className="text-orange-700 text-sm">
                            Vous perdrez l'accès aux fonctionnalités premium le{' '}
                            <span className="font-semibold">
                              {new Date(cancellationInfo.access_until).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                        {/* Actions pour candidats */}
                    <div className="flex justify-center gap-4 mt-6">
                      {!cancellationInfo?.cancellation_scheduled ? (
                        <>
                          {/* Afficher le bouton "Annuler mon plan" seulement si l'utilisateur n'est pas au plan gratuit */}
                          {candidatePlan !== 'free' && (
                            <button
                              onClick={() => setShowCancelConfirm(true)}
                              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                            >
                              Annuler mon plan
                            </button>
                          )}
                          <button
                            onClick={() => window.open('/pricing', '_blank')}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                          >
                            {candidatePlan === 'free' ? 'Passer à Premium' : 'Changer de plan'}
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="mb-4">
                            <button
                              disabled
                              className="px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                            >
                              Plan annulé
                            </button>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Votre annulation est déjà programmée. Vous pouvez toujours changer d'avis en souscrivant à un nouveau plan.
                          </p>
                          <button
                            onClick={() => window.open('/pricing', '_blank')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Souscrire à un nouveau plan
                          </button>
                        </div>
                      )}
                    </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'offer' && isRecruiter && (
            <motion.div
              key="offer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 -mx-4 px-4 py-8">
                <div className="max-w-full mx-auto">
                  {/* Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Mon offre recruteur
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-8xl mx-auto">
                      Gérez votre abonnement et accédez à toutes les fonctionnalités pour trouver les meilleurs talents.
                    </p>
                  </motion.div>

                  {/* Pricing Cards pour recruteurs */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                  >
                    {/* Plan Starter */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                        <p className="text-gray-600 mb-4">Pour planifier un recrutement</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900">19,99€</span>
                          <span className="text-xl text-gray-600 ml-2">/mois</span>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Accès à tous les profils de talents</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Filtres de recherche avancés</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Contact direct avec les candidats</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Support par email</span>
                        </li>
                      </ul>

                      <button className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200">
                        Plan actuel
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>

                    {/* Plan Max */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-blue-500 scale-105 transition-all duration-300 hover:shadow-2xl"
                    >
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Populaire
                        </div>
                      </div>

                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Max</h3>
                        <p className="text-gray-600 mb-4">Pour un recrutement imminent</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900">79€</span>
                          <span className="text-xl text-gray-600 ml-2">/mois</span>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">🎯 Sélection de profil sur-mesure par notre équipe</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Accès illimité aux profils</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Contact direct avec tous les candidats</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Support prioritaire</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Tableau de bord complet</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Export des données</span>
                        </li>
                      </ul>

                      <button className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl">
                        Choisir Max
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>

                    {/* Plan Premium */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                        <p className="text-gray-600 mb-4">Solutions personnalisées</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900">Sur mesure</span>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Accès illimité aux profils</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Recherche ultra-avancée</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Contact direct illimité</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Support dédié 24/7</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Tableau de bord personnalisé</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Export avancé des données</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Intégrations personnalisées</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Formation équipe</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">SLA garantis</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">🎯 Sélection de profil sur-mesure par notre équipe</span>
                        </li>
                      </ul>

                      <a 
                        href="mailto:hello@loicbernard.com?subject=Demande d'information - Plan Premium sur-mesure&body=Bonjour,%0D%0A%0D%0AJe souhaite obtenir des informations sur le plan Premium sur-mesure.%0D%0A%0D%0AMerci de me recontacter.%0D%0A%0D%0ACordialement"
                        className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
                      >
                        Nous contacter
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </motion.div>
                  </motion.div>


                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popup de confirmation d'annulation */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Annuler votre abonnement ?
                </h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir annuler votre abonnement {candidatePlan === 'premium' ? 'Premium' : 'Elite'} ? 
                  Vous garderez l'accès à toutes les fonctionnalités premium jusqu'à la fin de votre période de facturation.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Garder mon plan
                  </button>
                  <button
                    onClick={async () => {
                      setShowCancelConfirm(false);
                      await handleCancelSubscription();
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
