/**
 * Suggestions d'Offres pour Candidats
 * Interface pour afficher les offres recommandées aux candidats
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star, 
  Eye, 
  Heart,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

const CandidateSuggestions = ({ candidateId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minScore: 0.5,
    location: '',
    seniority: '',
    remote: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (candidateId) {
      fetchSuggestions();
    }
  }, [candidateId, filters]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: '15',
        minScore: filters.minScore.toString(),
        includeDetails: 'true'
      });
      
      const apiUrl = buildApiUrl(`${API_ENDPOINTS.MATCHING_JOBS}${candidateId}/?${params}`);
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data.jobs || []);
      setStats(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const getMatchLevelText = (score) => {
    if (score >= 0.9) return 'Parfait';
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.7) return 'Très bon';
    if (score >= 0.6) return 'Bon';
    if (score >= 0.5) return 'Correct';
    return 'Faible';
  };

  const handleFeedback = async (jobId, action) => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.MATCHING_FEEDBACK);
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId: jobId,
          recommendationType: 'job',
          action
        })
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du feedback:', err);
    }
  };

  const filteredSuggestions = suggestions.filter(job => {
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.seniority && job.seniority !== filters.seniority) return false;
    if (filters.remote && job.remote !== filters.remote) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Offres Recommandées</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchSuggestions}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-sm text-gray-500">
              {filteredSuggestions.length} suggestion{filteredSuggestions.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Score min:</label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={filters.minScore}
              onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseFloat(e.target.value) }))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-8">{formatScore(filters.minScore)}%</span>
          </div>

          <select
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="">Toutes les villes</option>
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Marseille">Marseille</option>
            <option value="Toulouse">Toulouse</option>
            <option value="Bordeaux">Bordeaux</option>
          </select>

          <select
            value={filters.seniority}
            onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.value }))}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="">Tous les niveaux</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>

          <select
            value={filters.remote}
            onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.value }))}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="">Tous les types</option>
            <option value="onsite">Sur site</option>
            <option value="hybrid">Hybride</option>
            <option value="remote">À distance</option>
          </select>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des suggestions...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">
          <p>❌ {error}</p>
          <button 
            onClick={fetchSuggestions}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune offre ne correspond à vos critères</p>
          <p className="text-sm">Essayez d'ajuster vos filtres</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredSuggestions.map((job) => (
            <div key={job.jobId} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-medium text-gray-900 mr-3">
                      {job.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(job.score)}`}>
                      {formatScore(job.score)}% - {getMatchLevelText(job.score)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="mr-4 font-medium">{job.company}</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>

                  {/* Tags requis */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.tags.slice(0, 6).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 6 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{job.tags.length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Détails */}
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {job.seniority}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.remote === 'onsite' ? 'Sur site' : 
                       job.remote === 'hybrid' ? 'Hybride' : 'À distance'}
                    </span>
                    {job.salary && (
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.salary}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {job.viewsCount} vues
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {job.applicationsCount} candidatures
                    </span>
                  </div>

                  {/* Date de publication */}
                  <div className="mt-2 text-xs text-gray-400">
                    Publié le {new Date(job.postedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleFeedback(job.jobId, 'viewed')}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Voir l'offre"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </button>
                  <button
                    onClick={() => handleFeedback(job.jobId, 'clicked')}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Postuler"
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    Postuler
                  </button>
                  <button
                    onClick={() => handleFeedback(job.jobId, 'dismissed')}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Ignorer"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Score détaillé */}
              {job.scoreBreakdown && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-6 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Compétences</div>
                      <div className="text-blue-600">{formatScore(job.scoreBreakdown.skills)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Expérience</div>
                      <div className="text-green-600">{formatScore(job.scoreBreakdown.experience)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Localisation</div>
                      <div className="text-purple-600">{formatScore(job.scoreBreakdown.location)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Salaire</div>
                      <div className="text-orange-600">{formatScore(job.scoreBreakdown.salary)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Disponibilité</div>
                      <div className="text-red-600">{formatScore(job.scoreBreakdown.availability)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Plan</div>
                      <div className="text-indigo-600">{formatScore(job.scoreBreakdown.plan)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pied de page */}
      {filteredSuggestions.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Suggestions basées sur votre profil et l'IA</span>
            <div className="flex items-center space-x-4">
              <span>Score moyen: {stats ? Math.round(stats.averageScore * 100) : 0}%</span>
              <button 
                onClick={fetchSuggestions}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSuggestions;
