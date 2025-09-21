/**
 * Widget de Matching Intelligent - Carte séparée (style détails talent)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
        ? `${API_ENDPOINTS.MATCHING_CANDIDATES}${jobId}/`
        : `${API_ENDPOINTS.MATCHING_JOBS}${candidateId}/`;
      
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

  const scorePct = (score) => Math.round(score * 100);
  const scoreTone = (score) => {
    if (score >= 0.8) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (score >= 0.6) return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (score >= 0.4) return 'bg-orange-50 text-orange-700 border border-orange-100';
    return 'bg-rose-50 text-rose-700 border border-rose-100';
  };

  const buildFallbackAvatar = (name) => {
    const safe = encodeURIComponent(name || 'UX Designer');
    return `https://ui-avatars.com/api/?name=${safe}&background=E5E7EB&color=111827&size=64&bold=true`;
  };

  const resolveAvatar = (c) => {
    const possible = [
      c?.photo,
      c?.photoUrl,
      c?.photo_url,
      c?.profilePhoto,
      c?.profile_photo,
      c?.avatar,
      c?.avatar_url,
      c?.image,
      c?.picture
    ].find(Boolean);
    return possible || buildFallbackAvatar(c?.name);
  };

  const openProfile = (candidateObj) => {
    const targetId = candidateObj?.candidateId || candidateObj?.id;
    if (!targetId) {
      console.warn('Aucun candidateId/id pour la recommandation:', candidateObj);
      return;
    }
    navigate(`/candidates/${targetId}`);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Candidats recommandés</h3>
        </div>
        <div className="text-sm text-gray-500">{recommendations.length} résultat{recommendations.length > 1 ? 's' : ''}</div>
      </div>

      {/* Liste */}
      <div className="divide-y divide-gray-100">
        {recommendations.map((c) => (
          <div
            key={c.candidateId || c.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:bg-gray-50"
            onClick={() => openProfile(c)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openProfile(c)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Avatar + Infos */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <img
                  src={resolveAvatar(c)}
                  alt={c.name || 'Candidat'}
                  className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-gray-200"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = buildFallbackAvatar(c?.name); }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${scoreTone(c.score)}`}>
                      {scorePct(c.score)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 mt-0.5 truncate">{c.title}</div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-1 truncate">
                    {c.location && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{c.location}</span>
                      </span>
                    )}
                    {c.seniority && <span className="truncate">{c.seniority}</span>}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openProfile(c); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                title="Voir le profil"
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs font-medium">Voir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingWidget;