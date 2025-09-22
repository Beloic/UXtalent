import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  HeartOff, 
  ArrowLeft, 
  Users, 
  Star, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Mail,
  ExternalLink,
  Calendar as CalendarIcon,
  Trash2,
  Eye,
  Building,
  Download,
  FileText,
  Database,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Building2,
  X,
  Pause,
  Play,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RoleGuard } from '../components/RoleGuard';
import { usePermissions } from '../hooks/usePermissions';
import Calendar from '../components/Calendar';
import AppointmentIndicator from '../components/AppointmentIndicator';
import PublishJobForm from '../components/PublishJobForm';
import EditJobForm from '../components/EditJobForm';
import MatchingDashboard from '../components/MatchingDashboard';
import { loadAppointments } from '../services/appointmentsApi';
import { buildApiUrl } from '../config/api';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isRecruiter } = usePermissions();
  const location = useLocation();
  const getActiveTabFromPath = () => {
    if (location.pathname.startsWith('/recruiter-dashboard/appointments')) return 'appointments';
    if (location.pathname.startsWith('/recruiter-dashboard/myjobs')) return 'myjobs';
    if (location.pathname.startsWith('/recruiter-dashboard/matching')) return 'matching';
    if (location.pathname.startsWith('/recruiter-dashboard/plan')) return 'plan';
    return 'favorites';
  };
  const activeTab = getActiveTabFromPath();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobApplications, setJobApplications] = useState({});
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Fonction pour toggle le dropdown des candidatures
  const toggleDropdown = (jobId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  // Fonction pour obtenir le prochain rendez-vous d'un candidat
  const getNextAppointmentForCandidate = (candidateId) => {
    const candidateAppointments = appointments.filter(apt => apt.candidate_id == candidateId);
    if (candidateAppointments.length === 0) return null;
    
    // Trier par date et heure, et retourner le plus proche dans le futur
    const now = new Date();
    const futureAppointments = candidateAppointments.filter(apt => {
      const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
      return appointmentDate > now;
    });
    
    if (futureAppointments.length === 0) return null;
    
    return futureAppointments.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateA - dateB;
    })[0];
  };

  // Fonction pour formater la date d'un rendez-vous
  const formatAppointmentDate = (appointment) => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (appointmentDate.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return `Demain à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return appointmentDate.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Charger les offres du recruteur
  const loadMyJobs = async () => {
    try {
      setLoadingJobs(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        return;
      }

      const response = await fetch(buildApiUrl('/api/jobs'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const jobsData = await response.json();
        setMyJobs(jobsData);
        
        // Charger les candidatures pour chaque offre
        await loadApplicationsForJobs(jobsData, token);
      } else {
        console.error('Erreur lors du chargement des offres');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Charger les candidatures pour les offres
  const loadApplicationsForJobs = async (jobs, token) => {
    try {
      setLoadingApplications(true);
      const applicationsData = {};
      
      for (const job of jobs) {
        try {
          const response = await fetch(buildApiUrl(`/api/candidates/?action=get_job_applications&jobId=${job.id}`), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            applicationsData[job.id] = result.applications || [];
          } else if (response.status === 503) {
            // Table applications non trouvée
            console.warn(`Table applications non trouvée pour l'offre ${job.id}`);
            applicationsData[job.id] = [];
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des candidatures pour l'offre ${job.id}:`, error);
          applicationsData[job.id] = [];
        }
      }
      
      setJobApplications(applicationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Charger les rendez-vous depuis l'API
  const loadAppointmentsData = useCallback(async () => {
    try {
      console.log('🔄 Rechargement des rendez-vous...');
      const appointmentsData = await loadAppointments();
      setAppointments(appointmentsData);
      console.log('✅ Rendez-vous rechargés:', appointmentsData.length);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      setAppointments([]);
    }
  }, []);

  // Charger les favoris du recruteur
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(buildApiUrl('/api/recruiter/favorites'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('❌ Erreur lors du chargement des favoris:', response.status, errorData);
        setMessage('❌ Erreur lors du chargement des favoris');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des favoris:', error);
      setMessage('❌ Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Ajouter aux favoris - mise à jour optimiste
  const addToFavorites = async (candidateId) => {
    // Vérifier que candidates est un tableau
    if (!Array.isArray(candidates)) return;
    
    // Trouver le candidat à ajouter
    const candidateToAdd = candidates.find(c => c.id === candidateId);
    if (!candidateToAdd) return;

    // Mise à jour optimiste de l'état local
    setFavorites(prevFavorites => {
      // Vérifier que prevFavorites est un tableau
      if (!Array.isArray(prevFavorites)) {
        return [candidateToAdd]; // Créer un nouveau tableau avec le candidat
      }
      
      // Vérifier si déjà en favori
      if (prevFavorites.some(fav => fav.id === candidateId)) {
        return prevFavorites; // Déjà en favori
      }
      return [...prevFavorites, candidateToAdd];
    });

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(buildApiUrl(`/api/recruiter/favorites/${candidateId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessage('✅ Candidat ajouté aux favoris');
        setTimeout(() => setMessage(''), 3000);
        // Pas besoin de recharger - l'état local est déjà mis à jour
      } else {
        // En cas d'erreur, recharger pour restaurer l'état correct
        setMessage('❌ Erreur lors de l\'ajout aux favoris');
        setTimeout(() => setMessage(''), 3000);
        loadFavorites();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      setMessage('❌ Erreur lors de l\'ajout aux favoris');
      setTimeout(() => setMessage(''), 3000);
      // En cas d'erreur, recharger pour restaurer l'état correct
      loadFavorites();
    }
  };

  // Retirer des favoris - mise à jour optimiste
  const removeFromFavorites = async (candidateId) => {
    // Mise à jour optimiste de l'état local
    setFavorites(prevFavorites => {
      // Vérifier que prevFavorites est un tableau
      if (!Array.isArray(prevFavorites)) {
        return prevFavorites; // Retourner tel quel si ce n'est pas un tableau
      }
      
      return prevFavorites.filter(fav => fav.id !== candidateId);
    });

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(buildApiUrl(`/api/recruiter/favorites/${candidateId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessage('✅ Candidat retiré des favoris');
        setTimeout(() => setMessage(''), 3000);
        // Pas besoin de recharger - l'état local est déjà mis à jour
      } else {
        // En cas d'erreur, recharger pour restaurer l'état correct
        setMessage('❌ Erreur lors de la suppression des favoris');
        setTimeout(() => setMessage(''), 3000);
        loadFavorites();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      setMessage('❌ Erreur lors de la suppression des favoris');
      setTimeout(() => setMessage(''), 3000);
      // En cas d'erreur, recharger pour restaurer l'état correct
      loadFavorites();
    }
  };

  // Fonction d'export des favoris
  const exportFavorites = async (format = 'csv') => {
    if (!user || favorites.length === 0) return;
    
    try {
      setExporting(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        setMessage('❌ Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => setMessage(''), 5000);
        return;
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiter/favorites/export?format=${format}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `favoris-recruiter-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage(`✅ Export ${format.toUpperCase()} réussi (${favorites.length} candidats)`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('Erreur d\'export:', response.status, errorData);
        
        if (response.status === 401) {
          setMessage('❌ Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 404) {
          setMessage('❌ Route d\'export non trouvée. Veuillez contacter le support.');
        } else {
          setMessage(`❌ Erreur lors de l'export: ${errorData.error || 'Erreur inconnue'}`);
        }
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setMessage('❌ Erreur lors de l\'export');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  // Charger les candidats
  const loadCandidates = useCallback(async () => {
    if (!user) return;
    
    try {
      setCandidatesLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(buildApiUrl('/api/candidates/?sortBy=recent'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      } else {
        console.error('❌ Erreur lors du chargement des candidats:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des candidats:', error);
    } finally {
      setCandidatesLoading(false);
    }
  }, [user]);

  // Modifier le statut d'un candidat - mise à jour optimiste
  const updateCandidateStatus = async (candidateId, newStatus) => {
    // Mise à jour optimiste de l'état local
    setCandidates(prevCandidates => {
      // Vérifier que prevCandidates est un tableau
      if (!Array.isArray(prevCandidates)) {
        return prevCandidates; // Retourner tel quel si ce n'est pas un tableau
      }
      
      return prevCandidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: newStatus }
          : candidate
      );
    });

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(buildApiUrl(`/api/recruiter/candidates/${candidateId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Pas besoin de recharger - l'état local est déjà mis à jour
      } else {
        // En cas d'erreur, recharger pour restaurer l'état correct
        setMessage('❌ Erreur lors de la mise à jour du statut');
        setTimeout(() => setMessage(''), 3000);
        loadCandidates();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setMessage('❌ Erreur lors de la mise à jour du statut');
      setTimeout(() => setMessage(''), 3000);
      // En cas d'erreur, recharger pour restaurer l'état correct
      loadCandidates();
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (user && isRecruiter) {
      loadFavorites();
      loadCandidates();
      loadAppointmentsData();
    }
  }, [user, isRecruiter, loadFavorites, loadCandidates, loadAppointmentsData]);

  // Pas de gestion d'état d'onglet: déterminé par le chemin

  // Recharger les données quand on change de route d'onglet
  useEffect(() => {
    if (user && isRecruiter) {
      setRefreshing(true);
      
      // Recharger les rendez-vous à chaque changement d'onglet
      loadAppointmentsData();
      
      // Recharger les données spécifiques selon l'onglet
      const loadData = async () => {
        try {
          if (activeTab === 'favorites') {
            await loadFavorites();
          } else if (activeTab === 'appointments') {
            await loadCandidates();
          }
        } finally {
          setRefreshing(false);
        }
      };
      
      loadData();
    }
  }, [activeTab, user, isRecruiter, loadFavorites, loadCandidates, loadAppointmentsData]);

  // Charger les offres quand l'onglet "Mes offres" est sélectionné
  useEffect(() => {
    if (activeTab === 'myjobs') {
      loadMyJobs();
    }
  }, [activeTab]);

  // Fonction pour démarrer l'édition d'une offre
  const handleEditJob = (job) => {
    setEditingJob(job);
  };

  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  // Fonction pour mettre à jour une offre après édition
  const handleJobUpdated = (updatedJob) => {
    setMyJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
    setEditingJob(null);
    setMessage('✅ Offre mise à jour avec succès !');
    setTimeout(() => setMessage(''), 3000);
  };

  // Fonction pour supprimer une offre
  const handleDeleteJob = async (jobId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.')) {
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        setMessage('❌ Erreur d\'authentification');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const response = await fetch(buildApiUrl(`/api/jobs/${jobId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Supprimer l'offre de la liste locale
        setMyJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        setMessage('✅ Offre supprimée avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'offre:', error);
      setMessage('❌ Erreur lors de la suppression de l\'offre');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Fonction pour mettre en pause une offre
  const handlePauseJob = async (jobId) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        setMessage('❌ Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const response = await fetch(buildApiUrl(`/api/jobs/${jobId}/pause`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pausedJob = await response.json();
        setMyJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === pausedJob.id ? pausedJob : job
          )
        );
        setMessage('⏸️ Offre mise en pause avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        setMessage(`❌ Erreur lors de la mise en pause: ${errorData.error || 'Erreur inconnue'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erreur lors de la mise en pause de l\'offre:', error);
      setMessage('❌ Erreur lors de la mise en pause de l\'offre');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Fonction pour reprendre une offre
  const handleResumeJob = async (jobId) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        setMessage('❌ Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const response = await fetch(buildApiUrl(`/api/jobs/${jobId}/resume`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const resumedJob = await response.json();
        setMyJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === resumedJob.id ? resumedJob : job
          )
        );
        setMessage('▶️ Offre reprise avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        setMessage(`❌ Erreur lors de la reprise: ${errorData.error || 'Erreur inconnue'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erreur lors de la reprise de l\'offre:', error);
      setMessage('❌ Erreur lors de la reprise de l\'offre');
      setTimeout(() => setMessage(''), 3000);
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

  if (!isRecruiter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600 mb-6">Cette page est réservée aux recruteurs.</p>
          <Link 
            to="/candidates" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Voir les candidats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['recruiter']}>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
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
                Retour aux candidats
              </Link>
              
              {/* Onglets de navigation */}
              <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 flex">
                <button
                  onClick={() => navigate('/recruiter-dashboard/favorites')}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'favorites'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'favorites' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  Favoris
                </button>
                <button
                  onClick={() => navigate('/recruiter-dashboard/appointments')}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'appointments'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'appointments' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CalendarIcon className="w-4 h-4" />
                  )}
                  Mes rendez-vous
                  {candidates.length > 0 && !refreshing && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {candidates.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/recruiter-dashboard/myjobs')}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'myjobs'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'myjobs' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Briefcase className="w-4 h-4" />
                  )}
                  Mes offres
                  {myJobs.length > 0 && !refreshing && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {myJobs.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/recruiter-dashboard/matching')}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'matching'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'matching' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Matching
                </button>
                <button
                  onClick={() => navigate('/recruiter-dashboard/plan')}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'plan'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'plan' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Mon Plan
                </button>
              </div>
            </div>
          </motion.div>

          {/* Message de statut */}
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-medium mb-6 ${
                message.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.includes('✅') && <Heart className="w-4 h-4" />}
                {message.includes('❌') && <span className="text-red-500">❌</span>}
                <span>{message}</span>
              </div>
            </motion.div>
          )}

          {/* Contenu des onglets */}
          <AnimatePresence mode="wait">
            {activeTab === 'favorites' && (
              <motion.div 
                key="favorites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100"
              >
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">Mes Candidats Favoris</h2>
                        {refreshing && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Mise à jour...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">Gérez vos candidats préférés</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {favorites.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Heart className="w-4 h-4 fill-current text-red-500" />
                          <span>{favorites.length} favori{favorites.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des favoris...</h3>
                    <p className="text-gray-600">Récupération de vos candidats favoris</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="p-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori pour le moment</h3>
                    <p className="text-gray-600 mb-6">Commencez par ajouter des candidats à vos favoris depuis la liste des candidats.</p>
                    <Link 
                      to="/candidates" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Voir tous les candidats
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {favorites.map((candidate, index) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-8 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                              {candidate.photo ? (
                                <img 
                                  src={candidate.photo} 
                                  alt={candidate.name}
                                  className="w-16 h-16 rounded-2xl object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-xl">
                                  {candidate.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                                {candidate.status && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    candidate.status === 'À contacter' ? 'bg-gray-100 text-gray-700' :
                                    candidate.status === 'Entretien prévu' ? 'bg-blue-100 text-blue-700' :
                                    candidate.status === 'En cours' ? 'bg-yellow-100 text-yellow-700' :
                                    candidate.status === 'Accepté' ? 'bg-green-100 text-green-700' :
                                    candidate.status === 'Refusé' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {candidate.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 font-medium mb-2">{candidate.title}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {candidate.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {candidate.experience || 'Mid'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {candidate.annualSalary ? `${candidate.annualSalary}€` : 'Non spécifié'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  Ajouté le {new Date(candidate.favoritedAt).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {candidate.planType === 'premium' && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                Premium
                              </span>
                            )}
                            {candidate.planType === 'elite' && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                                Elite
                              </span>
                            )}
                            
                            {/* Indicateur de rendez-vous */}
                            <AppointmentIndicator 
                              candidateId={candidate.id} 
                              appointments={appointments} 
                            />
                            
                            {/* Badge de rendez-vous planifié */}
                            {getNextAppointmentForCandidate(candidate.id) && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Entretien prévu
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => navigate(`/candidates/${candidate.id}`)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                              >
                                <Eye className="w-4 h-4" />
                                Voir profil
                              </button>
                              
                              <button 
                                onClick={() => removeFromFavorites(candidate.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium"
                              >
                                <HeartOff className="w-4 h-4" />
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div 
                key="appointments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        {refreshing && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Mise à jour...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {candidates.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold">
                          <CalendarIcon className="w-5 h-5" />
                          <span>{candidates.length} candidat{candidates.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            
                {candidatesLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement du calendrier...</h3>
                    <p className="text-gray-600">Préparation de vos rendez-vous</p>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="p-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun candidat pour les rendez-vous</h3>
                    <p className="text-gray-600 mb-6">Les candidats apparaîtront ici une fois qu'ils seront ajoutés.</p>
                    <Link 
                      to="/candidates" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Voir tous les candidats
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                      </div>
                      {refreshing && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium">Mise à jour...</span>
                        </div>
                      )}
                    </div>
                    <Calendar candidates={candidates} favorites={favorites} />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'myjobs' && (
              <motion.div 
                key="myjobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                {/* Formulaire d'édition */}
                {editingJob && (
                  <EditJobForm 
                    job={editingJob}
                    onJobUpdated={handleJobUpdated}
                    onCancel={handleCancelEdit}
                  />
                )}

                {/* Container Titre et Actions */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mes offres d'emploi</h2>
                        <p className="text-gray-600">Gérez vos offres publiées</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/jobs/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Publier une offre
                      </button>
                      <button
                        onClick={loadMyJobs}
                        disabled={loadingJobs}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loadingJobs ? 'animate-spin' : ''}`} />
                        Actualiser
                      </button>
                    </div>
                  </div>
                </div>

                {loadingJobs ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement de vos offres...</p>
                    </div>
                  </div>
                ) : myJobs.length === 0 ? (
                  <div className="text-center py-16">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre publiée</h3>
                    <p className="text-gray-600 mb-6">Vous n'avez pas encore publié d'offres d'emploi.</p>
                    <button
                      onClick={() => navigate('/jobs/new')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Publier ma première offre
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myJobs.map((job) => {
                      const applications = jobApplications[job.id] || [];
                      
                      return (
                        <div key={job.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  job.status === 'active' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : job.status === 'pending_approval'
                                    ? 'bg-amber-100 text-amber-700'
                                    : job.status === 'paused'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {job.status === 'active' ? '✓ Publiée' : 
                                   job.status === 'pending_approval' ? '⏳' : 
                                   job.status === 'paused' ? '⏸️ En pause' :
                                   '✗ Rejetée'}
                                </span>
                                {applications.length > 0 && (
                                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                    {applications.length} candidature{applications.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {job.company}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {job.type}
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">
                                Créée le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                                {job.rejection_reason && (
                                  <span className="ml-4 text-red-600">
                                    Raison du rejet: {job.rejection_reason}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {job.status === 'pending_approval' && (
                                <span className="text-sm text-amber-600 font-medium">
                                  En attente de validation
                                </span>
                              )}
                              {job.status === 'rejected' && (
                                <button
                                  onClick={() => navigate('/jobs/new')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                >
                                  Republier
                                </button>
                              )}
                              {job.status === 'active' && (
                                <>
                                  <button
                                    onClick={() => handleEditJob(job)}
                                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Modifier"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handlePauseJob(job.id)}
                                    className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                    title="Mettre en pause"
                                  >
                                    <Pause className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Accéder à l'offre
                                  </button>
                                </>
                              )}
                              {job.status === 'paused' && (
                                <>
                                  <button
                                    onClick={() => handleEditJob(job)}
                                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Modifier"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleResumeJob(job.id)}
                                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Reprendre"
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Accéder à l'offre
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Dropdown des candidatures */}
                          {applications.length > 0 && (
                            <div className="mt-4">
                              <button
                                onClick={() => toggleDropdown(job.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    Candidatures ({applications.length})
                                  </span>
                                </div>
                                <div className={`transform transition-transform duration-200 ${openDropdowns[job.id] ? 'rotate-180' : ''}`}>
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>
                              
                              {/* Contenu du dropdown */}
                              {openDropdowns[job.id] && (
                                <div className="mt-2 space-y-3">
                                  {applications.map((application, index) => (
                                    <div key={application.id} className="bg-white hover:shadow-md transition-all duration-200 rounded-xl border border-gray-100">
                                      <div className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="relative">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                              <span className="text-sm font-semibold text-white">
                                                {application.candidate?.name?.charAt(0) || '?'}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                                              {application.candidate?.name || 'Candidat anonyme'}
                                            </h4>
                                            {application.candidate?.title && (
                                              <p className="text-xs text-gray-600 truncate">
                                                {application.candidate.title}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-1">
                                            <span>Postulé le {new Date(application.applied_at).toLocaleDateString('fr-FR')}</span>
                                            {application.candidate?.location && (
                                              <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{application.candidate.location}</span>
                                              </div>
                                            )}
                                          </div>
                                          {(() => {
                                            // Utiliser l'ID numérique du candidat (pas l'UUID) pour le lien
                                            const candidateId = application.candidate?.id || application.candidate_id;
                                            if (!candidateId) {
                                              return (
                                                <span className="px-3 py-1 bg-gray-400 text-white rounded-lg text-xs font-medium flex items-center gap-1 flex-shrink-0">
                                                  <Eye className="w-3 h-3" />
                                                  Profil indisponible
                                                </span>
                                              );
                                            }
                                            return (
                                              <Link 
                                                to={`/candidates/${candidateId}`}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 flex-shrink-0"
                                              >
                                                <Eye className="w-3 h-3" />
                                                Profil
                                              </Link>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'matching' && (
              <motion.div 
                key="matching"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <MatchingDashboard recruiterId={user?.id} />
              </motion.div>
            )}

            {activeTab === 'plan' && (
              <motion.div 
                key="plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
                  <div className="p-8 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mon Plan</h2>
                        <p className="text-gray-600">Gérez votre abonnement et vos fonctionnalités</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {/* Plan actuel */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Plan Gratuit
                          </h3>
                          <p className="text-gray-600">
                            Accès aux fonctionnalités de base
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            0€
                          </div>
                          <div className="text-sm text-gray-500">
                            
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => window.open('/pricing', '_blank')}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Passer à Premium
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Formulaire de publication déplacé vers la page /jobs/new */}
          </AnimatePresence>
        </div>
      </div>
    </RoleGuard>
  );
}