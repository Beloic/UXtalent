import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, ArrowLeft, Check, BarChart3, Settings, Eye, Calendar, ChevronLeft, ChevronRight, DollarSign, Camera, MapPin, Briefcase, Globe, Linkedin, Github, ExternalLink, Kanban, TrendingUp, MessageSquare, X, AlertCircle, Edit, Star, CheckCircle, Pencil, Check as CheckIcon, X as XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import PlanManager from '../components/PlanManager';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePermissions } from '../hooks/usePermissions';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

export default function MyProfilePage() {
  const { user } = useAuth();
  const { isRecruiter, isCandidate } = usePermissions();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('view');
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
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    title: '',
    location: '',
    remote: 'hybrid',
    yearsOfExperience: '', // Nouveau champ
    bio: '',
    skills: '',
    portfolio: '',
    linkedin: '',
    github: '',
    photo: null,
    dailyRate: '',
    annualSalary: '',
    updatedAt: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [candidateStatus, setCandidateStatus] = useState(null); // 'approved', 'rejected', 'pending', null
  const [isEditingRejected, setIsEditingRejected] = useState(false); // Mode édition pour candidats rejetés
  const [userPlan, setUserPlan] = useState('free');
  const [candidatePlan, setCandidatePlan] = useState('free'); // 'free', 'premium', 'pro'
  
  // États pour l'édition inline
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isSavingInline, setIsSavingInline] = useState(false);

  const totalSteps = 6;

  // Fonction pour charger les statistiques du profil
  const loadProfileStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingStats(true);
      
      // Obtenir le token une seule fois
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        return;
      }
      
      // Charger les statistiques avec le token
      const response = await fetch(buildApiUrl(`/api/profile-stats/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setProfileStats(stats);
      } else {
        console.error('Erreur lors du chargement des statistiques:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
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
        console.error('Token d\'authentification manquant');
        return;
      }
      
      const response = await fetch(buildApiUrl(`/api/profile-stats/${user.id}/chart?period=${chartPeriod}&offset=${chartOffset}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setChartData(result.data);
      } else {
        console.error('Erreur lors du chargement des données du graphique');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du graphique:', error);
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
    if (activeTab === 'stats' && user) {
      loadProfileStats();
      loadChartData();
    }
  }, [activeTab, user, loadProfileStats, loadChartData]);

  const loadExistingProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      
      // Utiliser la nouvelle route spécifique pour récupérer le profil par email
      const response = await fetch(buildApiUrl(`/api/candidates/profile/${encodeURIComponent(user.email)}`));
      
      if (response.ok) {
        const existingCandidate = await response.json();
        
        if (existingCandidate) {
          // Logique simplifiée : utiliser directement le statut
          const status = existingCandidate.status || 'pending';
          
          setCandidateStatus(status);
          
          // Charger le plan du candidat
          setCandidatePlan(existingCandidate.planType || 'free');
          
          // Charger toutes les données depuis la base de données
          const newFormData = {
            id: existingCandidate.id || null,
            name: existingCandidate.name || '',
            email: existingCandidate.email || '',
            title: existingCandidate.title || '',
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
            skills: Array.isArray(existingCandidate.skills)
              ? existingCandidate.skills.join(', ')
              : existingCandidate.skills || '',
            portfolio: existingCandidate.portfolio || '',
            linkedin: existingCandidate.linkedin || '',
            github: existingCandidate.github || '',
            photo: existingCandidate.photo && existingCandidate.photo.trim() !== '' ? {
              existing: existingCandidate.photo,
              preview: existingCandidate.photo
            } : null,
            dailyRate: existingCandidate.dailyRate || existingCandidate.daily_rate || '',
            annualSalary: existingCandidate.annualSalary || existingCandidate.annual_salary || '',
            updatedAt: existingCandidate.updated_at || existingCandidate.updatedAt || null
          };
          
          setFormData(newFormData);
          setMessage('✅ Profil chargé avec succès');
          
          // Faire disparaître le message après 3 secondes
          setTimeout(() => {
            setMessage('');
          }, 3000);
        } else {
          setMessage('ℹ️ Aucun profil existant trouvé. Vous pouvez créer un nouveau profil.');
        }
      } else if (response.status === 404) {
        // Candidat non trouvé - c'est normal pour un nouveau profil
        setMessage('ℹ️ Aucun profil existant trouvé. Vous pouvez créer un nouveau profil.');
        setCandidateStatus('new'); // Nouveau statut pour les nouveaux profils
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur de réponse:', response.status, errorText);
        setMessage(`❌ Erreur lors du chargement: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil existant:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.first_name && user.user_metadata?.last_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user.email?.split('@')[0] || '',
        email: user.email || ''
      }));

      // Charger le profil depuis la base de données
      loadExistingProfile();
    }
  }, [user, loadExistingProfile]);

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

      const updateData = { [editingField]: tempValue };
      
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${formData.id}`), {
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
      } else {
        throw new Error('Erreur lors de la sauvegarde');
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

  // Composant pour les champs éditables
  const EditableField = ({ fieldName, value, placeholder, type = 'text', className = '', options = null, required = true }) => {
    const isEditing = editingField === fieldName;
    const isEmpty = !value || value.trim() === '';
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
            )}
            <button
              onClick={saveInlineEdit}
              disabled={isSavingInline || (isRequired && !tempValue.trim())}
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
            {isRequired && isEmpty && (
              <span className="text-red-500 text-xs font-medium">Requis</span>
            )}
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



  const validateStep = (step) => {
    switch (step) {
      case 1: // Photo (optionnelle) => toujours valide
        return true;
      case 2: // Informations personnelles
        return (
          formData.name.trim() &&
          formData.email.trim()
        );
      case 3: // Informations professionnelles
        return (
          formData.title.trim() &&
          formData.location.trim() &&
          formData.remote
        );
      case 4: // Présentation et compétences
        return (
          formData.bio.trim() &&
          formData.skills.trim()
        );
      case 5: // Rémunération (obligatoire)
        return (
          formData.dailyRate && formData.dailyRate.toString().trim() &&
          formData.annualSalary && formData.annualSalary.toString().trim()
        );
      case 6: // Liens et portfolio
        return (
          formData.portfolio.trim() &&
          formData.linkedin.trim()
        );
      default:
        return true;
    }
  };

  const goNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(totalSteps, s + 1));
    } else {
      setMessage('❌ Veuillez compléter les champs requis avant de continuer.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const goPrevStep = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
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
      if (formData.yearsOfExperience && formData.yearsOfExperience.trim()) {
        const years = parseInt(formData.yearsOfExperience.trim());
        
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
        // Pour les nouveaux profils : toujours en attente de validation
        // Pour les profils existants rejetés : remettre en attente après modification
        status: formData.id ? (candidateStatus === 'rejected' ? 'pending' : undefined) : 'pending',
        // approved supprimé - utilise uniquement status
        // visible supprimé - utilise uniquement status
        // Tous les champs du formulaire
        title: formData.title || '',
        location: formData.location || '',
        remote: formData.remote || 'hybrid',
        skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
        portfolio: formData.portfolio || '',
        linkedin: formData.linkedin || '',
        github: formData.github || '',
        photo: photoUrl,
        dailyRate: formData.dailyRate || null,
        annualSalary: formData.annualSalary || null
      };
      
      
      // Déterminer l'URL et la méthode selon si le profil existe déjà
      const url = formData.id 
        ? buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${formData.id}`)
        : buildApiUrl(API_ENDPOINTS.CANDIDATES);
      const method = formData.id ? 'PUT' : 'POST';
      
      // Obtenir le token une seule fois
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('Token d\'authentification manquant');
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
        } else {
          // Profil mis à jour normalement
          setMessage(`✅ Profil mis à jour avec succès !`);
        }
        
        // Faire disparaître le message après 5 secondes pour les nouveaux profils
        setTimeout(() => {
          setMessage('');
        }, formData.id ? 3000 : 5000);
        
        // Recharger le profil immédiatement pour récupérer les données à jour
        setTimeout(() => {
          loadExistingProfile();
        }, 500);
      } else {
        const errorData = await response.json();
        const action = formData.id ? 'mettre à jour' : 'créer';
        setMessage(`Erreur: ${errorData.message || `Impossible de ${action} le profil`}`);
      }
    } catch (error) {
      setMessage(`Erreur lors de la création du profil: ${error.message}`);
      console.error('Erreur détaillée:', error);
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
                to="/candidates" 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-yellow-600 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
                <p className="text-gray-600">Votre profil candidat</p>
              </div>
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
            <div className="bg-white rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-2">Informations de votre profil :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nom :</span>
                  <span className="ml-2 text-gray-900">{formData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email :</span>
                  <span className="ml-2 text-gray-900">{formData.email}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Titre :</span>
                  <span className="ml-2 text-gray-900">{formData.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Localisation :</span>
                  <span className="ml-2 text-gray-900">{formData.location}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions désactivées pour l'état en attente */}
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
                to="/candidates" 
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
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-2">Informations de votre profil :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nom :</span>
                  <span className="ml-2 text-gray-900">{formData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email :</span>
                  <span className="ml-2 text-gray-900">{formData.email}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Titre :</span>
                  <span className="ml-2 text-gray-900">{formData.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Localisation :</span>
                  <span className="ml-2 text-gray-900">{formData.location}</span>
                </div>
              </div>
            </div>
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
            {/* Bouton de test simple */}
            <div className="mb-4">
              <button
                onClick={() => {
                  alert('Bouton de test fonctionne !');
                }}
                className="px-4 py-2 bg-red-500 text-white rounded mr-4"
              >
                Test Simple
              </button>
            </div>
            
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
                  setCurrentStep(1);
                  setActiveTab('profile');
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        {/* Header avec bouton retour et onglets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link 
              to="/candidates" 
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
                    onClick={() => setActiveTab('view')}
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
                    onClick={() => setActiveTab('stats')}
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
                    onClick={() => setActiveTab('plan')}
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
                    onClick={() => setActiveTab('offer')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === 'offer'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Kanban className="w-5 h-5" />
                    Mon offre
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
                          {(candidatePlan === 'premium' || candidatePlan === 'pro') && (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg ${
                              candidatePlan === 'pro' 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                                : 'bg-blue-600'
                            }`}>
                              <span className={candidatePlan === 'pro' ? 'text-amber-100' : 'text-blue-200'}>⭐</span>
                              {candidatePlan === 'pro' ? 'Pro' : 'Premium'}
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
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <EditableField
                                fieldName="name"
                                value={formData.name}
                                placeholder="Votre nom complet"
                                className="text-4xl font-bold text-gray-900"
                              />
                            </div>
                            <div className="mb-4">
                              <EditableField
                                fieldName="title"
                                value={formData.title}
                                placeholder="Titre non spécifié"
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
                              placeholder="Aucune description disponible"
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
                            </h2>
                             <button
                               onClick={() => {
                                 const newSkill = prompt('Ajouter une nouvelle compétence:');
                                 if (newSkill && newSkill.trim()) {
                                   const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
                                   const updatedSkills = [...currentSkills, newSkill.trim()];
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

                                       const updateData = { skills: updatedSkills.join(', ') };
                                       
                                       const response = await fetch(buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${formData.id}`), {
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
                               className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                               title="Ajouter une compétence"
                             >
                               <span className="text-xl font-bold">+</span>
                             </button>
                          </div>
                          
                          <div className="space-y-4">
           {/* Tags interactifs */}
           {formData.skills ? (
             <div className="flex flex-wrap" style={{ gap: '1.4rem' }}>
               {formData.skills.split(',').map((skill, index) => (
                 <div
                   key={index}
                   className="group relative"
                 >
                   <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer shadow-sm">
                     {skill.trim()}
                   </span>
                   <button
                     onClick={() => {
                       const skillsArray = formData.skills.split(',').map(s => s.trim());
                       const newSkills = skillsArray.filter((_, i) => i !== index);
                       setFormData(prev => ({
                         ...prev,
                         skills: newSkills.join(', ')
                       }));
                       // Sauvegarder automatiquement
                       setTimeout(async () => {
                         try {
                           console.log('🗑️ Suppression de compétence:', { 
                             formDataId: formData.id, 
                             newSkills: newSkills.join(', '),
                             originalSkills: formData.skills 
                           });
                           
                           if (!formData.id) {
                             throw new Error('ID du profil manquant');
                           }
                           
                           const session = await supabase.auth.getSession();
                           const token = session.data.session?.access_token;
                           
                           if (!token) {
                             throw new Error('Token d\'authentification manquant');
                           }

                           const updateData = { skills: newSkills.join(', ') };
                           const url = buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${formData.id}`);
                           
                           console.log('📡 Appel API:', { url, updateData });
                           
                           const response = await fetch(url, {
                             method: 'PUT',
                             headers: {
                               'Content-Type': 'application/json',
                               'Authorization': `Bearer ${token}`
                             },
                             body: JSON.stringify(updateData)
                           });

                           console.log('📡 Réponse API:', { 
                             status: response.status, 
                             ok: response.ok,
                             statusText: response.statusText 
                           });

                           if (response.ok) {
                             setMessage('✅ Compétence supprimée avec succès');
                             setTimeout(() => setMessage(''), 3000);
                           } else {
                             const errorText = await response.text();
                             console.error('❌ Erreur API:', errorText);
                             throw new Error(`Erreur ${response.status}: ${errorText}`);
                           }
                         } catch (error) {
                           console.error('❌ Erreur complète:', error);
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
                                  placeholder="Saisissez vos compétences séparées par des virgules"
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
                                  value={formData.linkedin}
                                  placeholder="https://linkedin.com/in/votre-profil"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>

                            {/* Portfolio */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Globe className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Portfolio</p>
                                <EditableField
                                  fieldName="portfolio"
                                  value={formData.portfolio}
                                  placeholder="https://votre-portfolio.com"
                                  className="font-semibold text-gray-900"
                                />
                              </div>
                            </div>

                            {/* GitHub */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <ExternalLink className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">GitHub</p>
                                <EditableField
                                  fieldName="github"
                                  value={formData.github}
                                  placeholder="https://github.com/votre-profil"
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
                                  placeholder="Non spécifiée"
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
                                       formData.remote === 'hybrid' ? 'Hybride' : 'Non spécifié'}
                                placeholder="Non spécifié"
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
                                value={formData.yearsOfExperience}
                                placeholder="Non spécifiée"
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
                                  value={formData.dailyRate ? `${formData.dailyRate} €` : ''}
                                  placeholder="Non spécifié"
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
                                  value={formData.annualSalary ? `${formData.annualSalary} €` : ''}
                                  placeholder="Non spécifié"
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
                                {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                              </p>
                            </div>
                          </div>

                          {/* Statut de vérification */}
                          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-emerald-800">Profil vérifié</p>
                              <p className="text-xs text-emerald-600">Candidat validé par notre équipe</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              <PlanManager 
                candidate={{
                  id: formData.id,
                  name: formData.name,
                  planType: candidatePlan
                }} 
                onPlanUpdate={(newPlanType) => setCandidatePlan(newPlanType)} 
              />
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
                          onClick={() => setActiveTab('plan')}
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
                          onClick={() => setActiveTab('plan')}
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
                        <p className="text-gray-600 mb-4">Parfait pour les petites entreprises</p>
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
                          <span className="text-gray-700">Tableau Kanban pour organiser les candidats</span>
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
                        <p className="text-gray-600 mb-4">Pour les entreprises en croissance</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900">79€</span>
                          <span className="text-xl text-gray-600 ml-2">/mois</span>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Sélection de profil sur-mesure par notre équipe</span>
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
                          <span className="text-gray-700">Tableau Kanban avancé pour organiser les candidats</span>
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
                          <span className="text-gray-700">Tableau Kanban personnalisé pour organiser les candidats</span>
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
                          <span className="text-gray-700">Sélection de profil sur-mesure par notre équipe</span>
                        </li>
                      </ul>

                      <button className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200">
                        Nous contacter
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </motion.div>

                  {/* Section Tableau Kanban */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16"
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-5xl mx-auto">
                      <div className="text-center mb-8">
                        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl mx-auto mb-6 w-fit">
                          <Kanban className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Tableau Kanban pour recruteurs
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                          Organisez efficacement vos candidats avec notre tableau Kanban intuitif. 
                          Suivez l'avancement de vos recrutements de manière visuelle et collaborative.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <h4 className="text-lg font-semibold text-blue-900 mb-3">Fonctionnalités incluses</h4>
                          <ul className="space-y-2 text-blue-800">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-blue-600" />
                              Colonnes personnalisables
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-blue-600" />
                              Glisser-déposer intuitif
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-blue-600" />
                              Filtres avancés
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-blue-600" />
                              Notifications en temps réel
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <h4 className="text-lg font-semibold text-green-900 mb-3">Avantages</h4>
                          <ul className="space-y-2 text-green-800">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              Gain de temps significatif
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              Collaboration équipe
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              Suivi des performances
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              Intégration complète
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-center">
                        <Link 
                          to="/recruiter-dashboard"
                          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <Kanban className="w-5 h-5" />
                          Accéder au tableau Kanban
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                  {/* FAQ Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 max-w-5xl mx-auto">
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        Questions fréquentes
                      </h2>
                      <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Comment fonctionne le tableau Kanban ?
                          </h3>
                          <p className="text-gray-600">
                            Le tableau Kanban vous permet d'organiser vos candidats en colonnes (À contacter, Entretien prévu, En cours, Accepté, Rejeté) 
                            et de les déplacer facilement selon l'avancement de leur candidature.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Puis-je personnaliser les colonnes ?
                          </h3>
                          <p className="text-gray-600">
                            Oui, avec les plans Max et Premium, vous pouvez créer des colonnes personnalisées 
                            adaptées à votre processus de recrutement spécifique.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
