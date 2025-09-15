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
  Layout,
  Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RoleGuard } from '../components/RoleGuard';
import { usePermissions } from '../hooks/usePermissions';
import CandidateKanban from '../components/CandidateKanban';
import Calendar from '../components/Calendar';
import AppointmentIndicator from '../components/AppointmentIndicator';
import RecruiterSearches from '../components/RecruiterSearches';
import RecruiterCompany from '../components/RecruiterCompany';
import { loadAppointments } from '../services/appointmentsApi';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isRecruiter } = usePermissions();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
      
      const response = await fetch('http://localhost:3001/api/recruiter/favorites', {
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
      
      const response = await fetch(`http://localhost:3001/api/recruiter/favorites/${candidateId}`, {
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
      
      const response = await fetch(`http://localhost:3001/api/recruiter/favorites/${candidateId}`, {
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
      
      const response = await fetch(`http://localhost:3001/api/recruiter/favorites/export?format=${format}`, {
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
      
      const response = await fetch('http://localhost:3001/api/candidates?sortBy=recent', {
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
      
      const response = await fetch(`http://localhost:3001/api/recruiter/candidates/${candidateId}/status`, {
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

  // Recharger les données quand on change d'onglet
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
          } else if (activeTab === 'kanban') {
            await loadCandidates();
          }
        } finally {
          setRefreshing(false);
        }
      };
      
      loadData();
    }
  }, [activeTab, user, isRecruiter, loadFavorites, loadCandidates, loadAppointmentsData]);

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
                  onClick={() => setActiveTab('favorites')}
                  disabled={refreshing}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'favorites'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'favorites' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                  Mes Favoris
                </button>
                <button
                  onClick={() => setActiveTab('kanban')}
                  disabled={refreshing}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'kanban'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'kanban' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Layout className="w-5 h-5" />
                  )}
                  Vue Kanban
                  {candidates.length > 0 && !refreshing && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {candidates.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  disabled={refreshing}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'calendar'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'calendar' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CalendarIcon className="w-5 h-5" />
                  )}
                  Calendrier
                </button>
                <button
                  onClick={() => setActiveTab('searches')}
                  disabled={refreshing}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'searches'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'searches' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Mes Recherches
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  disabled={refreshing}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'company'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {refreshing && activeTab === 'company' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Building className="w-5 h-5" />
                  )}
                  Mon Entreprise
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
                      {/* Boutons d'export pour les favoris */}
                      {favorites.length > 0 && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => exportFavorites('csv')}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileText className="w-4 h-4" />
                            {exporting ? 'Export...' : 'Export CSV'}
                          </button>
                          
                          <button
                            onClick={() => exportFavorites('json')}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Database className="w-4 h-4" />
                            {exporting ? 'Export...' : 'Export JSON'}
                          </button>
                        </div>
                      )}
                      
                      {favorites.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold">
                          <Heart className="w-5 h-5 fill-current" />
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
                          
                          {/* Affichage du prochain rendez-vous */}
                          {(() => {
                            const nextAppointment = getNextAppointmentForCandidate(candidate.id);
                            if (nextAppointment) {
                              return (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-blue-800">Prochain rendez-vous</span>
                                  </div>
                                  <div className="text-sm text-blue-700">
                                    <div className="font-medium">{nextAppointment.title}</div>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span>{formatAppointmentDate(nextAppointment)}</span>
                                      <span className="capitalize">{nextAppointment.type}</span>
                                      {nextAppointment.location && (
                                        <span>{nextAppointment.location}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {candidate.planType === 'premium' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            Premium
                          </span>
                        )}
                        {candidate.planType === 'pro' && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                            Pro
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


            {activeTab === 'kanban' && (
              <motion.div 
                key="kanban"
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
                        <h2 className="text-2xl font-bold text-gray-900">Vue Kanban</h2>
                        {refreshing && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Mise à jour...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">Organisez vos candidats par statut avec le drag & drop</p>
                    </div>
                    {candidates.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                        <Layout className="w-5 h-5" />
                        <span>{candidates.length} candidat{candidates.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
            
                {candidatesLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement du Kanban...</h3>
                    <p className="text-gray-600">Préparation de la vue Kanban</p>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="p-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun candidat pour le Kanban</h3>
                    <p className="text-gray-600 mb-6">Les candidats apparaîtront ici une fois qu'ils seront ajoutés.</p>
                    <Link 
                      to="/candidates" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Voir tous les candidats
                    </Link>
                  </div>
                ) : (
                  <CandidateKanban 
                    candidates={candidates}
                    onUpdateStatus={updateCandidateStatus}
                    onToggleFavorite={addToFavorites}
                    favorites={favorites}
                    onRefreshCandidates={loadCandidates}
                    appointments={appointments}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100"
              >
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">Calendrier des Rendez-vous</h2>
                        {refreshing && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Mise à jour...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">Planifiez et gérez vos entretiens</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <Calendar candidates={candidates} favorites={favorites} />
                </div>
              </motion.div>
            )}

            {activeTab === 'searches' && (
              <motion.div 
                key="searches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100"
              >
                <RecruiterSearches />
              </motion.div>
            )}

            {activeTab === 'company' && (
              <motion.div 
                key="company"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100"
              >
                <RecruiterCompany />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RoleGuard>
  );
}