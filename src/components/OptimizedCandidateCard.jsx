import React, { useState, useEffect, useRef } from "react";
import { MapPin, Globe, User, Briefcase, Euro, Award, Clock, Heart, Star, Zap, TrendingUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { PremiumBadge, ProBadge } from "./Badge";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../lib/supabase";

export default function OptimizedCandidateCard({ candidate, compact = false, isFavorited = false, onToggleFavorite }) {
  const { user } = useAuth();
  const { isRecruiter, isCandidate } = usePermissions();
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer pour le lazy loading des images
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !isRecruiter || !onToggleFavorite) return;
    
    setIsLoadingFavorite(true);
    try {
      await onToggleFavorite(candidate.id, !isFavorited);
    } catch (error) {
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

  // Fonction pour déterminer si le nom doit être masqué
  const shouldHideName = () => {
    // Si c'est un candidat et que ce n'est pas son propre profil, masquer le nom
    if (isCandidate && user?.email !== candidate.email) {
      return true;
    }
    return false;
  };

  // Style aligné sur la carte d'offre (JobCard)
  const getCardStyles = () => {
    const base = "group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-300 card-transition";
    
    // Styles normaux pour tous les utilisateurs
    if (candidate.planType === 'premium') {
      return `${base} hover:shadow-2xl hover:scale-[1.02] hover:border-blue-200/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 cursor-pointer shadow-glow`;
    }
    if (candidate.planType === 'elite') {
      return `${base} hover:shadow-2xl hover:scale-[1.02] hover:border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 cursor-pointer shadow-glow-purple`;
    }
    return `${base} hover:shadow-2xl hover:scale-[1.02] hover:border-blue-200/50 cursor-pointer`;
  };

  // Générer l'URL de l'avatar avec lazy loading
  const getAvatarUrl = () => {
    const name = shouldHideName() ? 'Candidat' : encodeURIComponent(candidate.name || 'UX');
    return `https://ui-avatars.com/api/?name=${name}&size=96&background=6366f1&color=ffffff&bold=true`;
  };

  return (
    <div className={getCardStyles()}>
      {/* Badges en haut à droite - masqués pour les candidats anonymes */}
      {!shouldHideName() && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {candidate.planType === 'premium' && <PremiumBadge />}
          {candidate.planType === 'elite' && <ProBadge />}
        </div>
      )}
      
      {/* Header aligné avec JobCard */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-0">
          {/* Colonne gauche: Avatar avec lazy loading */}
          <div className="flex flex-col items-start gap-2 w-24">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-elegant hover:shadow-glow transition-all duration-300">
              {candidate.photo && !imageError ? (
                <img
                  ref={imgRef}
                  data-src={candidate.photo}
                  alt={shouldHideName() ? "Photo de candidat anonyme" : `Photo de ${candidate.name}`}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  style={{ 
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              ) : (
                <img
                  src={getAvatarUrl()}
                  alt={shouldHideName() ? "Avatar anonyme" : `Avatar de ${candidate.name}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          
          {/* Colonne droite: texte principal */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-16 sm:h-20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                  {shouldHideName() ? "Candidat anonyme" : candidate.name}
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-base font-medium line-clamp-2">{candidate.title}</p>
            
            {/* Ligne de métadonnées alignée à gauche */}
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              {candidate.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-red-600" />
                  <span className="truncate">{candidate.location}</span>
                </div>
              )}
              {candidate.experience && (
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1.5 text-gray-500" />
                  <span>{candidate.experience}</span>
                </div>
              )}
              {candidate.remote && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1.5 text-blue-600" />
                  <span>{getRemoteLabel(candidate.remote)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description alignée */}
      <p className="text-gray-600 mb-4 line-clamp-4 leading-relaxed">
        {(() => {
          const bio = candidate.bio || '';
          return bio.replace(/Années d'expérience: \d+ ans \([^)]+\)\n\n/, '');
        })()}
      </p>

      {/* Footer avec rémunération et bouton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {(candidate.dailyRate || candidate.daily_rate) && (
            <div className="flex items-center gap-1">
              <Euro className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{candidate.dailyRate || candidate.daily_rate}€ TJM</span>
            </div>
          )}
          {(candidate.annualSalary || candidate.annual_salary) && (
            <div className="flex items-center gap-1">
              <Euro className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{(candidate.annualSalary || candidate.annual_salary).toLocaleString('fr-FR')}€ annuel</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {candidate.id ? (
            <Link
              to={isRecruiter ? `/recruiter-dashboard/talent/${candidate.id}` : `/my-profile/talent/${candidate.id}`}
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
