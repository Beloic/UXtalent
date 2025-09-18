/**
 * Dashboard de Matching pour Recruteurs
 * Interface complète pour visualiser et gérer les recommandations de candidats
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import MatchingWidget from './MatchingWidget';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { authenticatedFetch } from '../utils/auth';

const MatchingDashboard = ({ recruiterId }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [recruiterId]);


  useEffect(() => {
    if (selectedJob) {
      fetchCandidatesForJob(selectedJob.id);
    }
  }, [selectedJob]);

  // Déclencher l'animation quand les candidats sont chargés
  useEffect(() => {
    if (isFullyLoaded && !loading && candidates.length > 0 && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      // Délai pour s'assurer que le DOM est rendu
      const timer = setTimeout(() => {
        setAnimateBars(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFullyLoaded, loading, candidates.length]);

  const fetchJobs = async () => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.JOBS);
      const response = await authenticatedFetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        setJobsLoaded(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      setJobsLoaded(true); // Marquer comme chargé même en cas d'erreur
    }
  };

  const fetchCandidatesForJob = async (jobId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '3',
        minScore: '0.3',
        includeDetails: 'true'
      });
      
      const apiUrl = buildApiUrl(`${API_ENDPOINTS.MATCHING_CANDIDATES}/${jobId}?${params}`);
      const response = await authenticatedFetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
      setCandidates(data.candidates || []);
      setIsFullyLoaded(true);
      
      // Déclencher l'animation après le chargement
      setTimeout(() => {
        setAnimateBars(true);
      }, 300);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des candidats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.MATCHING_STATS);
      const response = await authenticatedFetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setStatsLoaded(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStatsLoaded(true); // Marquer comme chargé même en cas d'erreur
    }
  };


  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationBadge = (score) => {
    if (score >= 0.8) {
      return {
        text: 'Vivement recommandé',
        color: 'bg-green-100 text-green-800 border border-green-200'
      };
    } else if (score >= 0.6) {
      return {
        text: 'Recommandé',
        color: 'bg-blue-100 text-blue-800 border border-blue-200'
      };
    } else {
      return {
        text: 'À considérer',
        color: 'bg-orange-100 text-orange-800 border border-orange-200'
      };
    }
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  // Composant de barre de progression animée
  const AnimatedProgressBar = ({ score, color, delay = 0, label }) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const hasAnimated = useRef(false);
    
    useEffect(() => {
      if (animateBars && !hasAnimated.current) {
        hasAnimated.current = true;
        const timer = setTimeout(() => {
          setIsAnimated(true);
        }, delay);
        return () => clearTimeout(timer);
      }
    }, [animateBars, delay]);

    // Réinitialiser quand on change d'offre
    useEffect(() => {
      if (!animateBars) {
        hasAnimated.current = false;
        setIsAnimated(false);
      }
    }, [animateBars]);

    const width = isAnimated ? score * 100 : 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-700">{label}</span>
          <span className={`text-lg font-bold ${color}`}>
            {formatScore(score)}%
          </span>
        </div>
        <div className="relative">
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ease-out relative ${
                label === 'Expérience' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                label === 'Localisation' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                label === 'Salaire' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ 
                width: `${width}%`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Matching</h1>
            <p className="mt-1 text-sm text-gray-600">
              Trouvez les meilleurs candidats grâce au Matching
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAnimateBars(false);
                setIsFullyLoaded(false);
                hasAnimatedRef.current = false;
                fetchStats();
                if (selectedJob) {
                  fetchCandidatesForJob(selectedJob.id);
                }
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Sélection d'offre et filtres */}
        <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner une Offre</h3>
              
              {/* Liste des offres */}
              <div className="space-y-2">
                {jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setAnimateBars(false);
                      setIsFullyLoaded(false);
                      hasAnimatedRef.current = false;
                      fetchCandidatesForJob(job.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedJob?.id === job.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.company}</div>
                    <div className="text-xs text-gray-500">{job.location}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {selectedJob ? (
              <div className="space-y-6">

                {/* Statistiques rapides */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Score Moyen</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {Math.round(stats.matching.averageCompatibilityScore * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex items-center">
                        <Star className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Matches Excellents</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stats.matching.highQualityMatches}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Candidats Totaux</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stats.dataQuality.totalCandidates}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Qualité</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stats.matching.highQualityPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des candidats */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidates.length === 1 ? 'Candidat Recommandé' : 'Candidats Recommandés'} ({candidates.length})
                    </h3>
                    {loading && (
                      <div className="flex items-center text-gray-500">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </div>
                    )}
                  </div>

                  <div className="space-y-12">
                    {candidates.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun candidat ne correspond aux critères</p>
                        <p className="text-sm">Essayez d'ajuster vos filtres</p>
                      </div>
                    ) : (
                      candidates.map((candidate) => (
                        <div key={candidate.candidateId} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
                          {/* En-tête candidat */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              {/* Photo de profil */}
                              <div className="mr-4">
                                {candidate.profilePhoto ? (
                                  <img
                                    src={candidate.profilePhoto}
                                    alt={`Photo de ${candidate.name}`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => {
                                      console.log(`❌ Erreur chargement photo pour ${candidate.name}:`, candidate.profilePhoto);
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                    onLoad={() => {
                                      console.log(`✅ Photo chargée pour ${candidate.name}:`, candidate.profilePhoto);
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-gray-200 ${candidate.profilePhoto ? 'hidden' : 'flex'}`}
                                >
                                  {candidate.name ? candidate.name.charAt(0).toUpperCase() : '?'}
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <h4 className="text-xl font-bold text-gray-900 mr-3">
                                  {candidate.name}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRecommendationBadge(candidate.score).color}`}>
                                  {getRecommendationBadge(candidate.score).text}
                                </span>
                              </div>
                            </div>
                            <button
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Voir le profil"
                              onClick={() => window.location.href = `/candidates/${candidate.candidateId}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le profil
                            </button>
                          </div>

                          {/* Informations principales */}
                          <div className="flex items-center text-sm text-gray-600 mb-8">
                            <span className="mr-4 font-medium text-base">{candidate.title}</span>
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-base">{candidate.location}</span>
                          </div>

                          {/* Score détaillé avec barres de progression pleine largeur */}
                          {candidate.scoreBreakdown && (
                            <div className="space-y-6">
                              <div className="text-lg font-bold text-gray-800 mb-6">Détail du score de compatibilité</div>
                              
                              <AnimatedProgressBar 
                                score={candidate.scoreBreakdown.experience}
                                color="text-green-600"
                                delay={0}
                                label="Expérience"
                              />

                              <AnimatedProgressBar 
                                score={candidate.scoreBreakdown.location}
                                color="text-purple-600"
                                delay={200}
                                label="Localisation"
                              />

                              <AnimatedProgressBar 
                                score={candidate.scoreBreakdown.salary}
                                color="text-orange-600"
                                delay={400}
                                label="Salaire"
                              />

                              <AnimatedProgressBar 
                                score={candidate.scoreBreakdown.availability}
                                color="text-red-600"
                                delay={600}
                                label="Disponibilité"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une offre</h3>
                <p className="text-gray-600">Choisissez une offre dans la sidebar pour voir les candidats recommandés</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MatchingDashboard;
