/**
 * Widget de Matching Intelligent - Version Minimaliste
 * Affiche les recommandations de candidats avec un design épuré
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, MapPin } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { authenticatedFetch } from '../utils/auth';

const MatchingWidget = ({ 
  type = 'candidates',
  jobId = null, 
  candidateId = null,
  limit = 3,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        includeDetails: 'false'
      });
      
      const apiUrl = buildApiUrl(`${endpoint}?${params}`);
      const response = await authenticatedFetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des recommandations');
      }
      
      const data = await response.json();
      setRecommendations(data[type] || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Ne rien afficher en cas d'erreur ou de résultats vides
  }

  return (
    <div className={`${className}`}>
      {/* En-tête minimaliste */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">
            Candidats Recommandés
          </h3>
        </div>
      </div>

      {/* Liste des candidats - Design minimaliste */}
      <div className="space-y-3">
        {recommendations.map((candidate) => (
          <div key={candidate.candidateId} className="group">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {/* Informations principales */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {candidate.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatScore(candidate.score)}%
                  </span>
                </div>
                <div className="text-xs text-gray-700 truncate">
                  {candidate.title}
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-0.5 truncate">
                  {candidate.location && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{candidate.location}</span>
                    </span>
                  )}
                  {candidate.seniority && (
                    <span className="truncate">{candidate.seniority}</span>
                  )}
                </div>
              </div>

              {/* Action unique */}
              <button
                onClick={() => {
                  // Action pour voir le profil
                  console.log('Voir profil:', candidate.candidateId);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Voir le profil"
              >
                <Eye className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingWidget;