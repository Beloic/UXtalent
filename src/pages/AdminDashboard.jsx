import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Check, X, Eye, User, Calendar, MapPin, Briefcase, ExternalLink, 
  Users, Clock, TrendingUp, Filter, Search, 
  CheckCircle, XCircle, AlertCircle, Star, Globe, Mail, Phone,
  List, Grid3X3, MessageSquare, Trash2, Edit, MoreVertical,
  Shield, Settings, BarChart3, Activity, Zap, Crown, Award,
  ChevronRight, ChevronDown, RefreshCw, Download, Upload,
  Bell, BellOff, Lock, Unlock, UserCheck, UserX, Target,
  ArrowUpRight, ArrowDownRight, Minus, Plus, Maximize2,
  Building2
} from 'lucide-react';
import Layout from '../components/Layout';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // all, pending, approved, rejected
  const [sortBy, setSortBy] = useState('recent'); // recent, name, experience
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [viewMode, setViewMode] = useState('list'); // list, cards
  
  // Forum states
  const [activeTab, setActiveTab] = useState('candidates'); // candidates, forum, jobs
  const [forumPosts, setForumPosts] = useState([]);
  const [forumStats, setForumStats] = useState({ totalPosts: 0, totalReplies: 0, totalUsers: 0 });
  const [isLoadingForum, setIsLoadingForum] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Jobs states
  const [jobs, setJobs] = useState([]);
  const [jobsStats, setJobsStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0 });
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobFilterStatus, setJobFilterStatus] = useState('all'); // all, pending, active, rejected

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    if (activeTab === 'forum') {
      loadForumData();
    } else if (activeTab === 'jobs') {
      loadJobsData();
    }
  }, [activeTab]);

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      const apiUrl = await buildApiUrl(API_ENDPOINTS.CANDIDATES);
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': 'Bearer admin-token' // Token spécial pour l'administrateur
        }
      });

      if (response.ok) {
        const data = await response.json();
        const candidatesList = Array.isArray(data) ? data : (data.candidates || []);

        // Debug: vérifier que les candidats ont un ID
        console.log('🔍 [ADMIN] Candidats chargés:', candidatesList.map(c => ({ id: c.id, name: c.name })));

        // Déterminer les groupes sans chevauchement (priorité: rejeté > approuvé > en attente)
        const approvedCandidates = candidatesList.filter(c => c.approved === true || c.status === 'approved');
        const rejectedCandidates = candidatesList.filter(c => c.approved === false || c.visible === false || c.status === 'rejected');
        const pendingCandidates = candidatesList.filter(c => !approvedCandidates.includes(c) && !rejectedCandidates.includes(c));

        setCandidates({
          pending: pendingCandidates,
          approved: approvedCandidates,
          rejected: rejectedCandidates,
          all: candidatesList
        });

        // Mettre à jour les statistiques (total = en attente + approuvés)
        setStats({
          total: pendingCandidates.length + approvedCandidates.length,
          pending: pendingCandidates.length,
          approved: approvedCandidates.length,
          rejected: rejectedCandidates.length
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des candidats:', error);
      setMessage('Erreur lors du chargement des candidats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadForumData = async () => {
    try {
      setIsLoadingForum(true);
      
      // Charger les posts du forum
      const postsApiUrl = await buildApiUrl(API_ENDPOINTS.FORUM_POSTS);
      const postsResponse = await fetch(postsApiUrl);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        // L'API retourne un objet avec une propriété 'posts'
        setForumPosts(Array.isArray(postsData.posts) ? postsData.posts : []);
      }
      
      // Charger les statistiques du forum
      const statsApiUrl = await buildApiUrl(API_ENDPOINTS.FORUM_STATS);
      const statsResponse = await fetch(statsApiUrl);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setForumStats(statsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du forum:', error);
      setMessage('Erreur lors du chargement des données du forum');
    } finally {
      setIsLoadingForum(false);
    }
  };

  const loadJobsData = async () => {
    try {
      setIsLoadingJobs(true);
      
      // Charger toutes les offres d'emploi (admin uniquement)
      const apiUrl = await buildApiUrl(API_ENDPOINTS.JOBS);
      const jobsResponse = await fetch(apiUrl);
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        
        // Calculer les statistiques par statut
        const stats = {
          total: jobsData.length,
          active: jobsData.filter(job => job.status === 'active').length,
          pending: jobsData.filter(job => job.status === 'pending_approval').length,
          rejected: jobsData.filter(job => job.status === 'rejected').length
        };
        setJobsStats(stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres d\'emploi:', error);
      setMessage('Erreur lors du chargement des offres d\'emploi');
    } finally {
      setIsLoadingJobs(false);
    }
  };



  const approveJob = async (jobId) => {
    try {
      // Pour l'instant, on utilise la route de mise à jour existante
      const apiUrl = await buildApiUrl(`${API_ENDPOINTS.JOBS}/${jobId}`);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        setMessage('Offre approuvée avec succès !');
        loadJobsData(); // Recharger les données
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Erreur lors de l'approbation: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      setMessage('Erreur lors de l\'approbation de l\'offre');
    }
  };

  const rejectJob = async (jobId, reason = '') => {
    const rejectionReason = reason || prompt('Raison du rejet (optionnel):');
    
    try {
      // Pour l'instant, on utilise la route de mise à jour existante
      const apiUrl = await buildApiUrl(`${API_ENDPOINTS.JOBS}/${jobId}`);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected', rejection_reason: rejectionReason })
      });

      if (response.ok) {
        setMessage('Offre rejetée avec succès !');
        loadJobsData(); // Recharger les données
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Erreur lors du rejet: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      setMessage('Erreur lors du rejet de l\'offre');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.')) {
      return;
    }

    try {
      const apiUrl = await buildApiUrl(`${API_ENDPOINTS.JOBS}/${jobId}`);
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });

      if (response.ok) {
        setMessage('Offre supprimée avec succès');
        loadJobsData(); // Recharger les données
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage('Erreur lors de la suppression de l\'offre');
    }
  };

  const deleteForumPost = async (postId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.')) {
      return;
    }

    try {
      const apiUrl = await buildApiUrl(`/api/admin/forum/posts/${postId}`);
      const response = await fetch(apiUrl, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Post supprimé avec succès');
        loadForumData(); // Recharger les données
      } else {
        const errorData = await response.json();
        setMessage(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage('Erreur lors de la suppression du post');
    }
  };

  const deleteForumReply = async (postId, replyId) => {
    console.log('🗑️ deleteForumReply appelée avec:', postId, replyId);
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      console.log('🔑 Token:', token ? 'présent' : 'absent');
      
      const apiUrl = await buildApiUrl(`/api/forum/posts/${postId}/replies/${replyId}`);
      console.log('🌐 URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      console.log('📡 Réponse:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ Suppression réussie');
        setMessage('Réponse supprimée avec succès');
        loadForumData(); // Recharger les données
        if (selectedPost) {
          // Recharger les détails du post sélectionné
          loadPostDetails(selectedPost.id);
        }
      } else {
        let errorData = {};
        try { errorData = await response.json(); } catch(_) {}
        console.log('❌ Erreur:', errorData);
        setMessage(`Erreur: ${errorData.error || 'Suppression impossible'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la réponse:', error);
      setMessage('Erreur lors de la suppression de la réponse');
    }
  };

  const loadPostDetails = async (postId) => {
    try {
      const apiUrl = await buildApiUrl(`/api/forum/posts/${postId}`);
      const response = await fetch(apiUrl);
      if (response.ok) {
        const postData = await response.json();
        setSelectedPost(postData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails du post:', error);
    }
  };

  const approveCandidate = async (candidateId) => {
    try {
      console.log('🔄 Approbation du candidat:', candidateId);
      const apiUrl = await buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${candidateId}`);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ approved: true, visible: true, status: null })
      });

      console.log('📡 Réponse du serveur:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Candidat approuvé avec succès:', result);
        setMessage('Candidat approuvé avec succès !');
        loadCandidates(); // Recharger la liste
        setSelectedCandidate(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur serveur:', response.status, errorData);
        setMessage(`Erreur lors de l'approbation: ${response.status} - ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setMessage(`Erreur de connexion: ${error.message}`);
    }
  };

  const rejectCandidate = async (candidateId) => {
    try {
      console.log('🔄 Rejet du candidat:', candidateId);
      const apiUrl = await buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${candidateId}`);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ approved: false, visible: false, status: null })
      });

      console.log('📡 Réponse du serveur:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Candidat rejeté avec succès:', result);
        setMessage('Candidat rejeté avec succès !');
        loadCandidates(); // Recharger la liste
        setSelectedCandidate(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur serveur:', response.status, errorData);
        setMessage(`Erreur lors du rejet: ${response.status} - ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setMessage(`Erreur de connexion: ${error.message}`);
    }
  };

  const reapproveCandidate = async (candidateId) => {
    try {
      const apiUrl = await buildApiUrl(`${API_ENDPOINTS.CANDIDATES}/${candidateId}`);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ approved: true, visible: true, status: null })
      });

      if (response.ok) {
        setMessage('Candidat réapprouvé avec succès !');
        loadCandidates(); // Recharger la liste
        setSelectedCandidate(null);
      } else {
        setMessage('Erreur lors de la réapprobation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la réapprobation');
    }
  };

  // Fonctions de filtrage et tri
  const getFilteredCandidates = () => {
    let filtered = [];
    
    // Filtrage par statut
    if (filterStatus === 'pending') {
      filtered = candidates.pending || [];
    } else if (filterStatus === 'approved') {
      filtered = candidates.approved || [];
    } else if (filterStatus === 'rejected') {
      filtered = candidates.rejected || [];
    } else if (filterStatus === 'all') {
      // Pour "Tous", on exclut les candidats rejetés
      filtered = [...(candidates.pending || []), ...(candidates.approved || [])];
    }
    
    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(term) ||
        candidate.title.toLowerCase().includes(term) ||
        candidate.location.toLowerCase().includes(term) ||
        candidate.bio.toLowerCase().includes(term) ||
        (Array.isArray(candidate.skills) ? candidate.skills.some(skill => skill.toLowerCase().includes(term)) : candidate.skills.toLowerCase().includes(term))
      );
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'experience':
          const expOrder = { Junior: 1, Mid: 2, Senior: 3, Lead: 4 };
          return (expOrder[b.experience] || 0) - (expOrder[a.experience] || 0);
        case 'recent':
        default:
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
    });
    
    return filtered;
  };

  const CandidateListItem = ({ candidate, isApproved = false, isRejected = false }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-6 border border-white/20 ${
        candidate.planType === 'pro' ? 'ring-2 ring-amber-500/50' : candidate.planType === 'premium' ? 'ring-2 ring-blue-500/50' : ''
      }`}
    >
      {/* Gradient overlay au hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isApproved ? 'bg-gradient-to-br from-emerald-500/5 to-green-600/5' : 
        isRejected ? 'bg-gradient-to-br from-red-500/5 to-rose-600/5' : 
        'bg-gradient-to-br from-amber-500/5 to-orange-600/5'
      }`}></div>
      {/* Badge Premium/Pro moderne */}
      {(candidate.planType === 'premium' || candidate.planType === 'pro') && (
        <div className="absolute top-4 right-4 z-20">
          <div className={`text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xl ${
            candidate.planType === 'pro' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          }`}>
            <Crown className="w-3 h-3" />
            {candidate.planType === 'pro' ? 'Pro' : 'Premium'}
          </div>
        </div>
      )}

      <div className="relative z-10 flex items-center gap-6">
        {/* Photo de profil moderne */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 ring-4 ring-white shadow-lg">
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={`Photo de ${candidate.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=64&background=6366f1&color=ffffff&bold=true`;
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=64&background=6366f1&color=ffffff&bold=true`}
                alt={`Avatar de ${candidate.name}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* Status badge moderne */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
            isApproved ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 
            isRejected ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
            'bg-gradient-to-br from-amber-500 to-orange-600'
          }`}>
            {isApproved ? <CheckCircle className="w-3 h-3 text-white" /> : 
             isRejected ? <XCircle className="w-3 h-3 text-white" /> : 
             <Clock className="w-3 h-3 text-white" />}
          </div>
        </div>

        {/* Informations principales */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {candidate.name}
            </h3>
            <p className="text-gray-600 truncate mt-1 font-medium">{candidate.title}</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <MapPin className="w-3 h-3 text-gray-500" />
              </div>
              <span className="truncate font-medium">{candidate.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Briefcase className="w-3 h-3 text-gray-500" />
              </div>
              <span className="truncate font-medium">{candidate.experience}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Clock className="w-3 h-3 text-gray-500" />
              </div>
              <span className="truncate font-medium">
                {candidate.availability === 'available' ? 'Disponible' : 
                 candidate.availability === 'busy' ? 'Occupé' : 'Non disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Status et Actions modernes */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className={`px-4 py-2 text-sm font-bold rounded-2xl ${
            isApproved 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/50' 
              : isRejected
              ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200/50'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50'
          }`}>
            {isApproved ? '✓ Approuvé' : isRejected ? '✗ Rejeté' : '⏳ En attente'}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                const candidateId = candidate.id;
                if (!candidateId) {
                  console.warn('🔍 [ADMIN] ID du candidat non disponible:', candidate.name);
                  return;
                }
                console.log('🔍 [ADMIN] Redirection vers le profil du candidat:', candidateId, candidate.name);
                navigate(`/candidates/${candidateId}`);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 font-semibold border border-blue-200/50 hover:border-blue-300/50"
            >
              <Eye className="w-4 h-4" />
              Profil
            </button>
            
            {!isApproved && !isRejected && (
              <>
                <button
                  onClick={() => approveCandidate(candidate.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-200 font-semibold border border-emerald-200/50 hover:border-emerald-300/50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => rejectCandidate(candidate.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl hover:from-red-100 hover:to-rose-100 transition-all duration-200 font-semibold border border-red-200/50 hover:border-red-300/50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </>
            )}
            
            {isApproved && (
              <button
                onClick={() => rejectCandidate(candidate.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl hover:from-red-100 hover:to-rose-100 transition-all duration-200 font-semibold border border-red-200/50 hover:border-red-300/50"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
            )}
            
            {isRejected && (
              <button
                onClick={() => reapproveCandidate(candidate.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-200 font-semibold border border-emerald-200/50 hover:border-emerald-300/50"
              >
                <CheckCircle className="w-4 h-4" />
                Réapprouver
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const CandidateCard = ({ candidate, isApproved = false, isRejected = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 ${
        isApproved ? 'border-emerald-500' : isRejected ? 'border-red-500' : 'border-amber-500'
      } hover:border-opacity-80`}
    >
      <div className="flex items-start gap-4">
        {/* Photo de profil avec effet */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-100 flex-shrink-0 ring-2 ring-white shadow-lg">
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={`Photo de ${candidate.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=64&background=6366f1&color=ffffff&bold=true`;
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=64&background=6366f1&color=ffffff&bold=true`}
                alt={`Avatar de ${candidate.name}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {isApproved && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
          {isRejected && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{candidate.title}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isApproved 
                ? 'bg-emerald-100 text-emerald-700' 
                : isRejected
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isApproved ? '✓ Approuvé' : isRejected ? '✗ Rejeté' : '⏳ En attente'}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{candidate.experience}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{candidate.availability}</span>
            </div>
          </div>

          {/* Compétences (aperçu) */}
          {candidate.skills && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {Array.isArray(candidate.skills) 
                  ? candidate.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  : <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">
                      {candidate.skills}
                    </span>
                }
                {Array.isArray(candidate.skills) && candidate.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                    +{candidate.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const candidateId = candidate.id;
                if (!candidateId) {
                  console.warn('🔍 [ADMIN] ID du candidat non disponible (vue carte):', candidate.name);
                  return;
                }
                console.log('🔍 [ADMIN] Redirection vers le profil du candidat (vue carte):', candidateId, candidate.name);
                navigate(`/candidates/${candidateId}`);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium"
            >
              <Eye className="w-4 h-4" />
              Profil
            </button>
            
            {!isApproved && !isRejected && (
              <>
                <button
                  onClick={() => approveCandidate(candidate.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all duration-200 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => rejectCandidate(candidate.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </>
            )}
            
            {isApproved && (
              <button
                onClick={() => rejectCandidate(candidate.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
            )}
            
            {isRejected && (
              <button
                onClick={() => reapproveCandidate(candidate.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all duration-200 font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Réapprouver
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const CandidateModal = ({ candidate, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header moderne */}
        <div className="relative overflow-hidden">
          <div className="relative p-8 pb-6 bg-white/95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Détails du candidat
                  </h2>
                  <p className="text-gray-600 mt-1 font-medium">Informations complètes du profil</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-100/50 backdrop-blur-sm transition-all duration-200 border border-gray-200/50 hover:border-gray-300/50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 bg-white/95">
          {/* Photo et infos de base modernes */}
          <div className="flex items-start gap-8 mb-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 ring-4 ring-white shadow-2xl">
                {candidate.photo ? (
                  <img
                    src={candidate.photo}
                    alt={`Photo de ${candidate.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=160&background=6366f1&color=ffffff&bold=true`;
                    }}
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=160&background=6366f1&color=ffffff&bold=true`}
                    alt={`Avatar de ${candidate.name}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Badge Premium/Pro */}
              {(candidate.planType === 'premium' || candidate.planType === 'pro') && (
                <div className="absolute top-4 right-4 z-10">
                  <div className={`text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xl ${
                    candidate.planType === 'pro' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <Crown className="w-3 h-3" />
                    {candidate.planType === 'pro' ? 'Pro' : 'Premium'}
                  </div>
                </div>
              )}
              {/* Status badge */}
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-xl ${
                candidate.approved 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-600'
              }`}>
                {candidate.approved ? <CheckCircle className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{candidate.name}</h3>
                  <p className="text-xl text-gray-600 mb-3 font-medium">{candidate.title}</p>
                </div>
                <div className={`px-6 py-3 text-sm font-bold rounded-2xl ${
                  candidate.approved 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/50' 
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50'
                }`}>
                  {candidate.approved ? '✓ Approuvé' : '⏳ En attente'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-semibold">{candidate.location}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-gray-700 font-semibold">{candidate.experience}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-gray-700 font-semibold">{candidate.availability}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio moderne */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Présentation
              </h4>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200/50">
              <p className="text-gray-700 leading-relaxed text-lg font-medium">{candidate.bio}</p>
            </div>
          </div>

          {/* Compétences modernes */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Compétences
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {Array.isArray(candidate.skills) ? candidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl text-sm font-semibold border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200"
                >
                  {skill}
                </span>
              )) : (
                <span className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl text-sm font-semibold border border-blue-200/50">
                  {candidate.skills}
                </span>
              )}
            </div>
          </div>

          {/* Liens modernes */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Liens & Contact
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidate.portfolio && (
                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 hover:border-blue-300/50 hover:shadow-lg"
                >
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Portfolio</span>
                </a>
              )}
              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 hover:border-blue-300/50 hover:shadow-lg"
                >
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">LinkedIn</span>
                </a>
              )}
              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg"
                >
                  <div className="p-2 bg-gray-200 rounded-xl group-hover:bg-gray-300 transition-colors duration-200">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">GitHub</span>
                </a>
              )}
            </div>
          </div>

          {/* Actions modernes */}
          <div className="flex gap-4 pt-8 border-t border-gray-200/50">
            {candidate.approved !== true && candidate.visible !== false ? (
              <>
                <button
                  onClick={() => {
                    approveCandidate(candidate.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105"
                >
                  <CheckCircle className="w-6 h-6" />
                  Approuver ce candidat
                </button>
                <button
                  onClick={() => {
                    rejectCandidate(candidate.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105"
                >
                  <XCircle className="w-6 h-6" />
                  Rejeter ce candidat
                </button>
              </>
            ) : candidate.approved === true ? (
              <button
                onClick={() => {
                  rejectCandidate(candidate.id);
                  onClose();
                }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105"
              >
                <XCircle className="w-6 h-6" />
                Rejeter ce candidat
              </button>
            ) : (
                <button
                  onClick={() => {
                    reapproveCandidate(candidate.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105"
                >
                  <CheckCircle className="w-6 h-6" />
                  Réapprouver ce candidat
                </button>
              )}
            </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement du dashboard...</h1>
          <p className="text-gray-600">Récupération des candidats</p>
        </div>
      </div>
    );
  }

  return (
    <Layout hideTopBar={true} hideFooter={true}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header moderne avec glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Gestion des candidats et forum</p>
                </div>
              </div>
              {/* Bouton de déconnexion */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/login');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span className="font-semibold">Se déconnecter</span>
                </button>
              </div>
            </div>
            
            {/* Navigation moderne */}
            <div className="mt-6">
            <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('candidates')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'candidates'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Candidats
                {stats.pending > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    {stats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'forum'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Forum
                {forumStats.totalPosts > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {forumStats.totalPosts}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'jobs'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Offres
                {jobsStats.pending > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    {jobsStats.pending}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Message de notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu principal basé sur l'onglet actif (avec transition élégante) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
        {activeTab === 'candidates' && (
          <>
            {/* Statistiques ultra-modernes avec glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Candidats Actifs</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">En attente + Approuvés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">En Attente</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">{stats.pending}</p>
                    <p className="text-xs text-gray-500 mt-1">Validation requise</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Approuvés</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">{stats.approved}</p>
                    <p className="text-xs text-gray-500 mt-1">Profils validés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Rejetés</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">{stats.rejected}</p>
                    <p className="text-xs text-gray-500 mt-1">Profils refusés</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Barre de recherche et filtres ultra-moderne */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/20"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Recherche moderne */}
                <div className="flex-1 w-full lg:w-auto lg:max-w-lg">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Rechercher par nom, titre, localisation ou compétences..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 backdrop-blur-sm focus:bg-white text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Filtres modernes */}
                <div className="flex gap-3 items-center">
                  <div className="relative group">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-900 min-w-[200px] appearance-none cursor-pointer shadow-sm focus:shadow-lg"
                    >
                      <option value="all">Tous les candidats</option>
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvés</option>
                      <option value="rejected">Rejetés</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-900 min-w-[160px] appearance-none cursor-pointer shadow-sm focus:shadow-lg"
                    >
                      <option value="recent">Plus récents</option>
                      <option value="name">Nom A-Z</option>
                      <option value="experience">Expérience</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Boutons de vue modernes */}
                  <div className="flex bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                        viewMode === 'list' 
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200/50' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                      }`}
                      title="Vue liste"
                    >
                      <List className="w-4 h-4" />
                      <span className="text-sm font-medium">Liste</span>
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                        viewMode === 'cards' 
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200/50' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                      }`}
                      title="Vue cartes"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Cartes</span>
                    </button>
                  </div>

                  {/* Bouton refresh */}
                  <button
                    onClick={loadCandidates}
                    className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-blue-200/50"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Liste des candidats moderne */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Candidats
                      </h2>
                      <p className="text-sm text-gray-600 font-medium">
                        {getFilteredCandidates().length} profil{getFilteredCandidates().length !== 1 ? 's' : ''} trouvé{getFilteredCandidates().length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {getFilteredCandidates().length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl">
                        <span className="text-sm font-semibold text-blue-700">
                          {filterStatus === 'pending' && `${stats.pending} en attente`}
                          {filterStatus === 'approved' && `${stats.approved} approuvés`}
                          {filterStatus === 'rejected' && `${stats.rejected} rejetés`}
                          {filterStatus === 'all' && `${stats.total} candidats actifs`}
                        </span>
                      </div>
                      <div className="px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl">
                        <span className="text-sm font-semibold text-emerald-700">
                          {Math.round((stats.approved / (stats.total || 1)) * 100)}% approuvés
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
          
              {getFilteredCandidates().length === 0 ? (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-16 text-center border border-white/20">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    {searchTerm ? 'Aucun résultat trouvé' : 'Aucun candidat'}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    {searchTerm 
                      ? `Aucun candidat ne correspond à "${searchTerm}". Essayez avec d'autres mots-clés.`
                      : 'Les candidats apparaîtront ici une fois qu\'ils auront soumis leur profil.'
                    }
                  </p>
                  {searchTerm ? (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setSearchTerm('')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                      >
                        <X className="w-4 h-4" />
                        Effacer la recherche
                      </button>
                      <button
                        onClick={loadCandidates}
                        className="flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-sm text-gray-700 rounded-2xl hover:bg-white transition-all duration-200 border border-gray-200/50 font-semibold"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={loadCandidates}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Actualiser la liste
                    </button>
                  )}
                </div>
          ) : (
            <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              <AnimatePresence>
                {getFilteredCandidates().map((candidate) => (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={viewMode === 'list' ? { opacity: 0, x: -20 } : { opacity: 0, scale: 0.9 }}
                    animate={viewMode === 'list' ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
                    exit={viewMode === 'list' ? { opacity: 0, x: 20 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === 'list' ? (
                      <CandidateListItem 
                        candidate={candidate} 
                        isApproved={candidate.approved === true}
                        isRejected={candidate.approved === false || candidate.visible === false}
                      />
                    ) : (
                      <CandidateCard 
                        candidate={candidate} 
                        isApproved={candidate.approved === true}
                        isRejected={candidate.approved === false || candidate.visible === false}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

          </>
        )}

        {/* Contenu de l'onglet Forum */}
        {activeTab === 'forum' && (
          <ForumManagementContent
            forumPosts={forumPosts}
            forumStats={forumStats}
            isLoadingForum={isLoadingForum}
            onDeletePost={deleteForumPost}
            onDeleteReply={deleteForumReply}
            selectedPost={selectedPost}
            setSelectedPost={setSelectedPost}
            loadPostDetails={loadPostDetails}
            onRefresh={loadForumData}
          />
        )}

        {/* Contenu de l'onglet Offres */}
        {activeTab === 'jobs' && (
          <JobsManagementContent
            jobs={jobs}
            jobsStats={jobsStats}
            isLoadingJobs={isLoadingJobs}
            onDeleteJob={deleteJob}
            onApproveJob={approveJob}
            onRejectJob={rejectJob}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            jobSearchTerm={jobSearchTerm}
            setJobSearchTerm={setJobSearchTerm}
            jobFilterStatus={jobFilterStatus}
            setJobFilterStatus={setJobFilterStatus}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </Layout>
  );
}

// Composant pour la gestion des offres d'emploi
const JobsManagementContent = ({ 
  jobs, 
  jobsStats, 
  isLoadingJobs, 
  onDeleteJob, 
  onApproveJob,
  onRejectJob,
  selectedJob, 
  setSelectedJob,
  jobSearchTerm,
  setJobSearchTerm,
  jobFilterStatus,
  setJobFilterStatus
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFilteredJobs = () => {
    let filtered = jobs;

    // Filtrage par statut
    if (jobFilterStatus !== 'all') {
      filtered = filtered.filter(job => {
        switch (jobFilterStatus) {
          case 'pending':
            return job.status === 'pending_approval';
          case 'active':
            return job.status === 'active';
          case 'rejected':
            return job.status === 'rejected';
          default:
            return true;
        }
      });
    }

    // Filtrage par recherche
    if (jobSearchTerm) {
      const searchLower = jobSearchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  if (isLoadingJobs) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chargement des offres...</h3>
          <p className="text-gray-600">Récupération des données en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total des offres</p>
              <p className="text-2xl font-bold text-gray-900">{jobsStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{jobsStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Approuvées</p>
              <p className="text-2xl font-bold text-gray-900">{jobsStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Rejetées</p>
              <p className="text-2xl font-bold text-gray-900">{jobsStats.rejected}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtres et recherche */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, entreprise ou localisation..."
                value={jobSearchTerm}
                onChange={(e) => setJobSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <select
              value={jobFilterStatus}
              onChange={(e) => setJobFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="active">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Liste des offres */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Offres d'emploi ({getFilteredJobs().length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {getFilteredJobs().length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune offre trouvée</p>
            </div>
          ) : (
            getFilteredJobs().map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                      {/* Badge de statut */}
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        job.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : job.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {job.status === 'active' ? '✓ Approuvée' : 
                         job.status === 'pending_approval' ? '⏳ En attente' : 
                         '✗ Rejetée'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Publié le {formatDate(job.created_at)}
                      {job.rejection_reason && (
                        <span className="ml-4 text-red-600">
                          Raison: {job.rejection_reason}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Actions selon le statut */}
                    {job.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => onApproveJob(job.id)}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => onRejectJob(job.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    {job.status === 'rejected' && (
                      <button
                        onClick={() => onApproveJob(job.id)}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                      >
                        Réapprouver
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Composant pour la gestion du forum
const ForumManagementContent = ({ 
  forumPosts, 
  forumStats, 
  isLoadingForum, 
  onDeletePost, 
  onDeleteReply, 
  selectedPost, 
  setSelectedPost,
  loadPostDetails,
  onRefresh
}) => {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US');
  };

  if (isLoadingForum) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Chargement du forum...</h2>
          <p className="text-gray-600 text-lg">Récupération des posts et statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques Forum ultra-modernes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Posts Totaux</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">{forumStats.totalPosts}</p>
              <p className="text-xs text-gray-500 mt-1">Discussions créées</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Réponses Totales</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">{forumStats.totalReplies}</p>
              <p className="text-xs text-gray-500 mt-1">Interactions utilisateurs</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">{forumStats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Membres du forum</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Liste des Posts Forum ultra-moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Posts du Forum
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {forumPosts.length} post{forumPosts.length !== 1 ? 's' : ''} trouvé{forumPosts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl">
              <span className="text-sm font-semibold text-purple-700">
                {forumStats.totalPosts} discussions
              </span>
            </div>
            <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-purple-200/50">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {forumPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <MessageSquare className="w-16 h-16 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Aucun post pour le moment
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Le forum est vide. Les posts apparaîtront ici quand les utilisateurs commenceront à créer des discussions.
            </p>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold mx-auto">
              <RefreshCw className="w-4 h-4" />
              Actualiser le forum
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {forumPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 hover:border-purple-200/50 hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {post.author_avatar || post.authorAvatar || post.author?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-semibold">par {post.author}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.created_at || post.createdAt)}</span>
                          <span>•</span>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200/50">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed line-clamp-3">{post.content}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold">{post.replies_count || post.replies?.length || 0} réponses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <Eye className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-semibold">{post.views || 0} vues</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => {
                        if (selectedPost?.id === post.id) {
                          setSelectedPost(null);
                        } else {
                          loadPostDetails(post.id);
                        }
                      }}
                      className="p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-purple-200/50"
                      title="Voir les détails"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-red-200/50"
                      title="Supprimer le post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Post Details */}
                {selectedPost?.id === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Full Content:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                    
                    {selectedPost.replies && selectedPost.replies.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Replies ({selectedPost.replies.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedPost.replies.map((reply) => (
                            <div key={reply.id} className="bg-gray-50 rounded-lg p-4 relative group">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                                      {reply.author_avatar || reply.authorAvatar || reply.author?.charAt(0) || 'U'}
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">{reply.author}</span>
                                    <span className="text-gray-500 text-sm">•</span>
                                    <span className="text-gray-500 text-sm">{formatTimeAgo(reply.created_at || reply.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{reply.content}</p>
                                </div>
                                <div className="flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('🗑️ Suppression réponse:', selectedPost.id, reply.id);
                                      onDeleteReply(selectedPost.id, reply.id);
                                    }}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 cursor-pointer border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md z-10 relative opacity-70 group-hover:opacity-100"
                                    title="Supprimer cette réponse"
                                    style={{ minWidth: '32px', minHeight: '32px' }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
