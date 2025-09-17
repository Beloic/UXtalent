/**
 * Dashboard de Matching pour Recruteurs
 * Interface complète pour visualiser et gérer les recommandations de candidats
 */

import React, { useState, useEffect } from 'react';
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
  const [filters, setFilters] = useState({
    minScore: 0.5,
    experience: '',
    location: '',
    availability: '',
    planType: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [recruiterId]);

  useEffect(() => {
    if (selectedJob) {
      fetchCandidatesForJob(selectedJob.id);
    }
  }, [selectedJob, filters]);

  const fetchJobs = async () => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.JOBS);
      const response = await authenticatedFetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        if (data.length > 0 && !selectedJob) {
          setSelectedJob(data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    }
  };

  const fetchCandidatesForJob = async (jobId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        minScore: filters.minScore.toString(),
        includeDetails: 'true'
      });
      
      const apiUrl = buildApiUrl(`${API_ENDPOINTS.MATCHING_CANDIDATES}/${jobId}?${params}`);
      const response = await authenticatedFetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
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
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filters.experience && candidate.experience !== filters.experience) return false;
    if (filters.location && !candidate.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.availability && candidate.availability !== filters.availability) return false;
    if (filters.planType && candidate.planType !== filters.planType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Matching</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Trouvez les meilleurs candidats grâce à l'IA
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchStats}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Sélection d'offre et filtres */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner une Offre</h3>
              
              {/* Liste des offres */}
              <div className="space-y-2 mb-6">
                {jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
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

              {/* Filtres */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Filtres</h4>
                
                <div className="space-y-4">
                  {/* Score minimum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score minimum: {formatScore(filters.minScore)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.1"
                      value={filters.minScore}
                      onChange={(e) => handleFilterChange('minScore', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Niveau d'expérience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expérience
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) => handleFilterChange('experience', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      placeholder="Rechercher par ville..."
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Disponibilité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disponibilité
                    </label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Toutes</option>
                      <option value="available">Disponible</option>
                      <option value="busy">Occupé</option>
                      <option value="unavailable">Indisponible</option>
                    </select>
                  </div>

                  {/* Type de plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan
                    </label>
                    <select
                      value={filters.planType}
                      onChange={(e) => handleFilterChange('planType', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Tous les plans</option>
                      <option value="free">Gratuit</option>
                      <option value="premium">Premium</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {selectedJob ? (
              <div className="space-y-6">
                {/* Informations de l'offre sélectionnée */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                      <p className="text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Candidats trouvés</div>
                      <div className="text-2xl font-bold text-blue-600">{filteredCandidates.length}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedJob.seniority}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedJob.remote}
                    </span>
                    {selectedJob.salary && (
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {selectedJob.salary}
                      </span>
                    )}
                  </div>
                </div>

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
                <div className="bg-white rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Candidats Recommandés ({filteredCandidates.length})
                      </h3>
                      {loading && (
                        <div className="flex items-center text-gray-500">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Chargement...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredCandidates.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun candidat ne correspond aux critères</p>
                        <p className="text-sm">Essayez d'ajuster vos filtres</p>
                      </div>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <div key={candidate.candidateId} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* En-tête candidat */}
                              <div className="flex items-center mb-3">
                                <h4 className="text-lg font-semibold text-gray-900 mr-3">
                                  {candidate.name}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(candidate.score)}`}>
                                  {formatScore(candidate.score)}%
                                </span>
                                {candidate.isFeatured && (
                                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-xs rounded-full border border-purple-300">
                                    ⭐ Featured
                                  </span>
                                )}
                              </div>

                              {/* Informations principales */}
                              <div className="flex items-center text-sm text-gray-600 mb-3">
                                <span className="mr-4 font-medium">{candidate.title}</span>
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                <span>{candidate.location}</span>
                              </div>

                              {/* Filtres visuels de recommandation */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                {/* Expérience */}
                                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  <div className="text-xs">
                                    <div className="font-medium text-blue-900">Expérience</div>
                                    <div className="text-blue-700">{candidate.experience}</div>
                                  </div>
                                </div>

                                {/* Disponibilité */}
                                <div className={`flex items-center p-2 rounded-lg border ${
                                  candidate.availability === 'available' 
                                    ? 'bg-green-50 border-green-100' 
                                    : candidate.availability === 'busy'
                                    ? 'bg-yellow-50 border-yellow-100'
                                    : 'bg-red-50 border-red-100'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    candidate.availability === 'available' 
                                      ? 'bg-green-500' 
                                      : candidate.availability === 'busy'
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}></div>
                                  <div className="text-xs">
                                    <div className={`font-medium ${
                                      candidate.availability === 'available' 
                                        ? 'text-green-900' 
                                        : candidate.availability === 'busy'
                                        ? 'text-yellow-900'
                                        : 'text-red-900'
                                    }`}>Disponibilité</div>
                                    <div className={`${
                                      candidate.availability === 'available' 
                                        ? 'text-green-700' 
                                        : candidate.availability === 'busy'
                                        ? 'text-yellow-700'
                                        : 'text-red-700'
                                    }`}>
                                      {candidate.availability === 'available' ? 'Disponible' : 
                                       candidate.availability === 'busy' ? 'Occupé' : 'Indisponible'}
                                    </div>
                                  </div>
                                </div>

                                {/* Salaire */}
                                {candidate.salary && (
                                  <div className="flex items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                    <div className="text-xs">
                                      <div className="font-medium text-emerald-900">Salaire</div>
                                      <div className="text-emerald-700">{candidate.salary}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Plan */}
                                {candidate.planType !== 'free' && (
                                  <div className="flex items-center p-2 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                    <div className="text-xs">
                                      <div className="font-medium text-purple-900">Plan</div>
                                      <div className="text-purple-700">
                                        {candidate.planType === 'premium' ? '⭐ Premium' : '👑 Pro'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Score détaillé avec barres de progression */}
                              {candidate.scoreBreakdown && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="text-xs font-medium text-gray-700 mb-3">Détail du score de compatibilité</div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">Expérience</span>
                                      <div className="flex items-center">
                                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mr-2">
                                          <div 
                                            className="h-1.5 bg-green-500 rounded-full transition-all duration-300"
                                            style={{ width: `${candidate.scoreBreakdown.experience * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-medium text-green-600 w-8 text-right">
                                          {formatScore(candidate.scoreBreakdown.experience)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">Localisation</span>
                                      <div className="flex items-center">
                                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mr-2">
                                          <div 
                                            className="h-1.5 bg-purple-500 rounded-full transition-all duration-300"
                                            style={{ width: `${candidate.scoreBreakdown.location * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-medium text-purple-600 w-8 text-right">
                                          {formatScore(candidate.scoreBreakdown.location)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">Salaire</span>
                                      <div className="flex items-center">
                                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mr-2">
                                          <div 
                                            className="h-1.5 bg-orange-500 rounded-full transition-all duration-300"
                                            style={{ width: `${candidate.scoreBreakdown.salary * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-medium text-orange-600 w-8 text-right">
                                          {formatScore(candidate.scoreBreakdown.salary)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">Disponibilité</span>
                                      <div className="flex items-center">
                                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mr-2">
                                          <div 
                                            className="h-1.5 bg-red-500 rounded-full transition-all duration-300"
                                            style={{ width: `${candidate.scoreBreakdown.availability * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-medium text-red-600 w-8 text-right">
                                          {formatScore(candidate.scoreBreakdown.availability)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action élégante */}
                            <div className="ml-6">
                              <button
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Voir le profil"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le profil
                              </button>
                            </div>
                          </div>
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
    </div>
  );
};

export default MatchingDashboard;
