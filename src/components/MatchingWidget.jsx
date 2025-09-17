/**
 * Widget de Matching Intelligent
 * Affiche les recommandations de candidats ou d'offres avec scores de compatibilité
 */

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, DollarSign, Users, TrendingUp, Eye, Heart } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

const MatchingWidget = ({ 
  type = 'candidates', // 'candidates' ou 'jobs'
  jobId = null, 
  candidateId = null,
  limit = 5,
  showDetails = true,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if ((type === 'candidates' && jobId) || (type === 'jobs' && candidateId)) {
      fetchRecommendations();
    }
  }, [type, jobId, candidateId, limit]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'candidates' 
        ? `${API_ENDPOINTS.MATCHING_CANDIDATES}/${jobId}`
        : `${API_ENDPOINTS.MATCHING_JOBS}/${candidateId}`;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        minScore: '0.3',
        includeDetails: showDetails.toString()
      });
      
      const apiUrl = buildApiUrl(`${endpoint}?${params}`);
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des recommandations');
      }
      
      const data = await response.json();
      setRecommendations(data[type] || []);
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

  const getMatchLevelText = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Très bon';
    if (score >= 0.7) return 'Bon';
    if (score >= 0.6) return 'Correct';
    if (score >= 0.5) return 'Moyen';
    return 'Faible';
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const handleFeedback = async (recommendationId, action) => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.MATCHING_FEEDBACK);
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId,
          recommendationType: type.slice(0, -1), // 'candidate' ou 'job'
          action
        })
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des recommandations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button 
            onClick={fetchRecommendations}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {type === 'candidates' ? 'Candidats Recommandés' : 'Offres Recommandées'}
            </h3>
          </div>
          {stats && (
            <div className="text-sm text-gray-500">
              {stats.totalCandidates || stats.totalJobs} résultat{stats.totalCandidates > 1 || stats.totalJobs > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Liste des recommandations */}
      <div className="divide-y divide-gray-200">
        {recommendations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune recommandation trouvée</p>
            <p className="text-sm">Essayez d'ajuster vos critères de recherche</p>
          </div>
        ) : (
          recommendations.map((item, index) => {
            const data = type === 'candidates' ? item : item;
            const score = data.score;
            
            return (
              <div key={data.candidateId || data.jobId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-medium text-gray-900 mr-3">
                        {data.name || data.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                        {formatScore(score)}% - {getMatchLevelText(score)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="mr-4">{data.title || data.company}</span>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{data.location}</span>
                    </div>

                    {/* Compétences/Tags */}
                    {data.skills && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {data.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {data.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{data.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {data.tags && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {data.tags.slice(0, 5).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {data.tags.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{data.tags.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Détails supplémentaires */}
                    {showDetails && (
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        {data.experience && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {data.experience}
                          </span>
                        )}
                        {data.seniority && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {data.seniority}
                          </span>
                        )}
                        {data.availability && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {data.availability === 'available' ? 'Disponible' : 
                             data.availability === 'busy' ? 'Occupé' : 'Indisponible'}
                          </span>
                        )}
                        {data.salary && (
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {data.salary}
                          </span>
                        )}
                        {data.planType && data.planType !== 'free' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {data.planType === 'premium' ? '⭐ Premium' : '👑 Pro'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleFeedback(data.candidateId || data.jobId, 'viewed')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Voir le profil"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(data.candidateId || data.jobId, 'clicked')}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Ajouter aux favoris"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Score détaillé */}
                {showDetails && data.scoreBreakdown && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Compétences</div>
                        <div className="text-blue-600">{formatScore(data.scoreBreakdown.skills)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Expérience</div>
                        <div className="text-green-600">{formatScore(data.scoreBreakdown.experience)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Localisation</div>
                        <div className="text-purple-600">{formatScore(data.scoreBreakdown.location)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pied de page */}
      {recommendations.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Recommandations basées sur l'IA</span>
            <button 
              onClick={fetchRecommendations}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Actualiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingWidget;
