import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Building2, 
  Clock, 
  Calendar,
  ExternalLink,
  Share2,
  Users,
  Briefcase,
  DollarSign,
  Star,
  CheckCircle,
  Zap,
  Mail,
  Linkedin,
  Twitter,
  Send
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../lib/supabase";
import { buildApiUrl } from "../config/api";
import MatchingWidget from "../components/MatchingWidget";

// Fonction pour formater le texte des offres d'emploi
const formatJobText = (text) => {
  if (!text) return '';
  
  // Diviser le texte en lignes
  const lines = text.split('\n');
  const formattedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignorer les lignes vides
    if (!line) {
      formattedLines.push('<br>');
      continue;
    }
    
    // Si la ligne commence par •, créer une puce stylisée
    if (line.startsWith('•')) {
      const content = line.substring(1).trim();
      formattedLines.push(`<div class="flex items-start gap-3 mb-3"><span class="text-blue-600 font-bold text-lg leading-6">•</span><span class="leading-6">${content}</span></div>`);
    }
    // Si la ligne contient **texte**, formater en gras avec espacement
    else if (line.includes('**')) {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      formattedLines.push(`<div class="mb-4 mt-6"><span class="text-lg leading-6">${formattedLine}</span></div>`);
    }
    // Si la ligne se termine par :, c'est probablement un titre
    else if (line.endsWith(':')) {
      formattedLines.push(`<div class="mb-3 mt-4"><span class="font-semibold text-gray-900 text-lg leading-6">${line}</span></div>`);
    }
    // Sinon, retourner la ligne normale
    else {
      formattedLines.push(`<div class="mb-2"><span class="leading-6">${line}</span></div>`);
    }
  }
  
  return formattedLines.join('');
};

export default function JobDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { isRecruiter, isCandidate } = usePermissions();

  // Déterminer l'URL de retour selon le rôle et l'onglet d'origine
  const getBackUrl = () => {
    if (isRecruiter) {
      const fromTab = location.state?.fromTab;
      if (fromTab === 'offers') return '/recruiter-dashboard/offers';
      return '/recruiter-dashboard/myjobs';
    }
    return '/my-profile/offers';
  };

  // Fonction pour postuler à l'offre
  const applyToJob = async () => {
    if (!job) {
      return;
    }
    
    setIsApplying(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        alert('Vous devez être connecté pour postuler');
        return;
      }
      

      // Solution temporaire : utiliser une route existante
      const requestData = { 
        action: 'apply_to_job',
        jobId: job.id,
        jobTitle: job.title,
        company: job.company
      };
      
      
      const response = await fetch(buildApiUrl('/api/candidates/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      

      if (response.ok) {
        const result = await response.json();
        setApplicationStatus('pending');
        
        // Stocker dans le localStorage pour la persistance
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        if (!appliedJobs.includes(job.id)) {
          appliedJobs.push(job.id);
          localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        }
        
        alert('Candidature envoyée avec succès !');
      } else if (response.status === 503) {
        alert('La table des candidatures n\'est pas encore créée. Veuillez contacter l\'administrateur.');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'envoi de la candidature');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsApplying(false);
    }
  };

  // Vérifier si le candidat a déjà postulé
  const checkApplicationStatus = async () => {
    if (!job) return; // Temporairement, permettre à tous les utilisateurs connectés
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) return;

      // Vérifier dans la table applications
      const response = await fetch(buildApiUrl(`/api/candidates/?action=check_application&jobId=${job.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.application) {
          setApplicationStatus(result.application.status);
        }
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        setJob(null);
        
        const response = await fetch(buildApiUrl(`/api/jobs/${id}`));
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
          
          // Pour les offres similaires, on peut charger toutes les offres et filtrer
          const allJobsResponse = await fetch(buildApiUrl('/api/jobs'));
          if (allJobsResponse.ok) {
            const allJobs = await allJobsResponse.json();
            const similar = allJobs
              .filter(j => j.id !== jobData.id && (j.company === jobData.company || j.seniority === jobData.seniority))
              .slice(0, 3);
            setRelatedJobs(similar);
          }
        } else if (response.status === 404) {
          setError('not_found');
        } else {
          setError('network_error');
        }
      } catch (error) {
        setError('network_error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user?.id) {
          setCurrentUserId(session.data.session.user.id);
        }
      } catch (error) {
      }
    };

    getCurrentUser();
  }, []);

  // Vérifier le statut de candidature quand l'offre est chargée
  useEffect(() => {
    if (job) { // Temporairement, permettre à tous les utilisateurs connectés
      checkApplicationStatus();
    }
  }, [job]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRemoteIcon = (remote) => {
    switch (remote) {
      case 'remote':
        return <Globe className="w-5 h-5 text-green-600" />;
      case 'hybrid':
        return <div className="flex items-center gap-1">
          <Globe className="w-4 h-4 text-blue-600" />
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>;
      case 'onsite':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Globe className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRemoteText = (remote) => {
    switch (remote) {
      case 'remote':
        return '100% Remote';
      case 'hybrid':
        return 'Hybride';
      case 'onsite':
        return 'Sur site';
      default:
        return 'Non spécifié';
    }
  };

  const getRemoteColor = (remote) => {
    switch (remote) {
      case 'remote':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'hybrid':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'onsite':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getSeniorityColor = (seniority) => {
    switch (seniority) {
      case 'Junior':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Mid':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Senior':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Lead':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'CDI':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'CDD':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Freelance':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Stage':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} chez ${job.company}`,
        text: `Découvrez cette offre d'emploi UX/UI : ${job.title} chez ${job.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Vous pourriez ajouter une notification ici
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement de l'offre...</h1>
          <p className="text-gray-600 mb-6">Récupération des détails de l'offre d'emploi</p>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || (!loading && !job && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offre non trouvée</h1>
          <p className="text-gray-600 mb-6">Cette offre d'emploi n'existe pas ou a été supprimée.</p>
          <Link 
            to={getBackUrl()} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  if (error === 'network_error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-6">Impossible de charger l'offre. Vérifiez votre connexion internet.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Réessayer
            </button>
            <Link 
              to={getBackUrl()} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux offres
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header avec navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to={getBackUrl()} 
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all duration-200 mb-6 bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Contenu principal */}
          <main className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-white/20 backdrop-blur-sm"
            >
              {/* Header de l'offre */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{job.title} - Offre d'emploi UX/UI</h1>
                    <p className="text-2xl text-gray-600 font-semibold mb-6">{job.company}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{getRemoteText(job.remote)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Publié le {formatDate(job.postedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={shareJob}
                      className="p-4 bg-white/60 text-gray-600 hover:bg-white/80 hover:shadow-lg rounded-2xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>


              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  À propos de cette offre
                </h2>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div 
                    className="text-gray-700 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: formatJobText(job.description) }}
                  />
                </div>
                
                {/* Description complète */}
                {job.requirements && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Exigences
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatJobText(job.requirements) }}
                      />
                    </div>
                  </div>
                )}
              </div>


              {/* Actions */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{isCandidate ? 'Postuler' : 'Contacter l\'entreprise'}</h2>
                <div className="flex flex-wrap gap-4">
                  {isCandidate ? (
                    <button 
                      onClick={applyToJob}
                      disabled={isApplying || applicationStatus}
                      className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold ${
                        applicationStatus 
                          ? 'bg-green-600 text-white cursor-default' 
                          : isApplying 
                            ? 'bg-blue-400 text-white cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isApplying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : applicationStatus ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {applicationStatus === 'pending' ? 'Candidature envoyée' : 
                           applicationStatus === 'reviewed' ? 'Candidature examinée' :
                           applicationStatus === 'accepted' ? 'Candidature acceptée' :
                           applicationStatus === 'rejected' ? 'Candidature refusée' : 'Candidature envoyée'}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Postuler
                        </>
                      )}
                    </button>
                  ) : (
                    // Vérifier si le recruteur est le propriétaire de l'offre
                    currentUserId && job && currentUserId === job.recruiterId ? (
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold">
                        <Building2 className="w-5 h-5" />
                        Votre offre d'emploi
                      </div>
                    ) : (
                      // Les recruteurs ne peuvent pas se contacter entre eux
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold">
                        <Building2 className="w-5 h-5" />
                        Offre d'emploi d'un autre recruteur
                      </div>
                    )
                  )}
                </div>
              </div>

            </motion.div>

            {/* Bloc séparé: Candidats recommandés pour les recruteurs */}
            {isRecruiter && job && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm"
              >
                <MatchingWidget 
                  type="candidates" 
                  jobId={job.id} 
                  limit={3}
                />
              </motion.div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Informations rapides */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Informations clés
              </h3>
              
              <div className="space-y-4">
                {/* Candidats en premier */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Candidats</div>
                    <div className="font-semibold text-gray-900">
                      {job.applicationsCount || job.applications_count || 0} candidat{(job.applicationsCount || job.applications_count || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type de contrat</div>
                    <div className="font-semibold text-gray-900">{job.type}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Niveau</div>
                    <div className="font-semibold text-gray-900">{job.seniority}</div>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Salaire</div>
                      <div className="font-semibold text-gray-900">{job.salary}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Avantages */}
            {job.benefits && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-blue-600" />
                  Avantages
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div 
                    className="text-gray-700 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: formatJobText(job.benefits) }}
                  />
                </div>
              </motion.div>
            )}

            {/* Compétences recherchées */}
            {job.tags && job.tags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Compétences recherchées
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium border border-blue-200 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Offres similaires */}
            {relatedJobs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Offres similaires
                </h3>
                
                <div className="space-y-4">
                  {relatedJobs.map((relatedJob) => (
                    <Link
                      key={relatedJob.id}
                      to={`/my-profile/offer/${relatedJob.id}`}
                      className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{relatedJob.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{relatedJob.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {relatedJob.location}
                        <span className="mx-1">•</span>
                        <span>{relatedJob.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  to="/my-profile/offers"
                  className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir toutes les offres
                </Link>
              </motion.div>
            )}


          </aside>
        </div>
      </div>
    </div>
  );
}
