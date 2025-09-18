import React, { useState, useEffect } from "react";
import { MapPin, Globe, User, Briefcase, DollarSign, Award, Clock, Heart, Star, Zap, TrendingUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { PremiumBadge, ProBadge } from "./Badge";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../lib/supabase";

export default function CandidateCard({ candidate, compact = false }) {
  const { user } = useAuth();
  const { isRecruiter } = usePermissions();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Vérifier si le candidat est en favori
  useEffect(() => {
    if (user && isRecruiter) {
      checkIfFavorited();
    }
  }, [user, isRecruiter, candidate.id]);

  const checkIfFavorited = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(`https://ux-jobs-pro-backend.onrender.com/api/recruiter/favorites/${candidate.id}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !isRecruiter) return;
    
    setIsLoadingFavorite(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (isFavorited) {
        // Retirer des favoris
        const response = await fetch(`https://ux-jobs-pro-backend.onrender.com/api/recruiter/favorites/${candidate.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
        // Ajouter aux favoris
        const response = await fetch(`https://ux-jobs-pro-backend.onrender.com/api/recruiter/favorites/${candidate.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const getRemoteLabel = (remote) => {
    switch (remote) {
      case 'remote': return 'Full remote';
      case 'onsite': return 'Sur site';
      case 'hybrid': return 'Hybride';
      default: return remote;
    }
  };

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'Junior': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Mid': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Senior': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Lead': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getExperienceIcon = (experience) => {
    switch (experience) {
      case 'Junior': return <Zap className="w-3 h-3" />;
      case 'Mid': return <TrendingUp className="w-3 h-3" />;
      case 'Senior': return <Star className="w-3 h-3" />;
      case 'Lead': return <Award className="w-3 h-3" />;
      default: return <Briefcase className="w-3 h-3" />;
    }
  };


  // Style aligné sur la carte d'offre (JobCard)
  const getCardStyles = () => {
    return "group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-200/50";
  };

  return (
    <div className={getCardStyles()}>
      {/* Header aligné avec JobCard */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
              {candidate.name}
            </h3>
            <p className="text-gray-600 font-medium mb-2 line-clamp-2">{candidate.title}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>{candidate.location}</span>
              </div>
              {candidate.remote && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>{getRemoteLabel(candidate.remote)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Pilule d'expérience pour rappeler le badge type */}
        {candidate.experience && (
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getExperienceColor(candidate.experience)} border`}>
            {candidate.experience}
          </div>
        )}
      </div>

      {/* Description alignée */}
      <p className="text-gray-600 mb-4 line-clamp-4 leading-relaxed">
        {(() => {
          const bio = candidate.bio || '';
          return bio.replace(/Années d'expérience: \d+ ans \([^)]+\)\n\n/, '');
        })()}
      </p>

      {/* Footer avec bouton comme JobCard */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div />
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {candidate.id ? (
            <Link
              to={`/candidates/${candidate.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
            >
              Voir le profil
              <Eye className="w-4 h-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-xl font-medium text-sm cursor-not-allowed w-full sm:w-auto justify-center">
              <User className="w-4 h-4" />
              Profil indisponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
