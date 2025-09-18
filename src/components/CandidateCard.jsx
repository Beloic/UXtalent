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


  // Définir les styles selon le plan avec design moderne
  const getCardStyles = () => {
    // overflow-hidden retiré pour permettre au badge de flotter au-dessus du bord
    const baseStyles = "group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1 border border-gray-100/50 backdrop-blur-sm";
    
    if (candidate.planType === 'pro') {
      return `${baseStyles} bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/80 border-amber-200/50 hover:border-amber-300/70`;
    } else if (candidate.planType === 'premium') {
      return `${baseStyles} bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 border-blue-200/50 hover:border-blue-300/70`;
    } else {
      return `${baseStyles} hover:border-gray-200/70`;
    }
  };

  return (
    <div className={getCardStyles()}>
      {/* Effet de brillance subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Badge Premium/Pro redesigné */}
      {/* Badge Premium/Pro sera affiché dans l'entête, à droite du nom */}
      
      {/* Header */}
      <div className={`${compact ? 'p-4 pb-3' : 'p-6 pb-4'}`}>
        <div className={`flex items-start gap-4 ${compact ? 'mb-3' : 'mb-4'}`}>
          {/* Photo de profil avec design moderne */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              {candidate.photo ? (
                <img
                  src={candidate.photo}
                  alt={`Photo de ${candidate.name}`}
                  className={`${compact ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl object-cover border-3 border-white shadow-xl ring-2 ring-gray-100/50`}
                  onError={(e) => {
                    console.log('❌ Erreur de chargement de la photo:', candidate.photo);
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=80&background=6366f1&color=ffffff&bold=true`;
                  }}
                  onLoad={() => {
                    console.log('✅ Photo chargée avec succès:', candidate.photo);
                  }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=80&background=6366f1&color=ffffff&bold=true`}
                  alt={`Avatar de ${candidate.name}`}
                  className={`${compact ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl object-cover border-3 border-white shadow-xl ring-2 ring-gray-100/50`}
                />
              )}
              {/* Indicateur de statut en ligne */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-lg">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                    {candidate.name}
                  </h3>
                </div>
                <p className={`${compact ? 'mb-1' : 'mb-2'} text-gray-600 font-medium line-clamp-2 leading-relaxed`}>{candidate.title}</p>
              </div>
              
              {/* Badge à gauche du bouton favoris */}
              <div className="flex items-center gap-2 ml-3">
                {(candidate.planType === 'premium' || candidate.planType === 'pro') && (
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm border ${
                    candidate.planType === 'pro'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-blue-600 text-white border-blue-700'
                  }`}>
                    <Star className="w-3 h-3 fill-current" />
                    <span>{candidate.planType === 'pro' ? 'Pro' : 'Premium'}</span>
                  </div>
                )}
                {user && isRecruiter && (
                  <button
                    onClick={toggleFavorite}
                    disabled={isLoadingFavorite}
                    className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                      isFavorited 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-lg' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                    } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {isLoadingFavorite ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Localisation + mode de travail */}
            <div className={`flex items-center gap-4 ${compact ? 'mb-2' : 'mb-3'}`}>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1.5 text-blue-500" />
                <span className="font-medium">{candidate.location}</span>
                {candidate.remote && (
                  <>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-600 font-medium">{getRemoteLabel(candidate.remote)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className={`${compact ? 'mb-3' : 'mb-5'}`}>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {(() => {
              const bio = candidate.bio || '';
              return bio.replace(/Années d'expérience: \d+ ans \([^)]+\)\n\n/, '');
            })()}
          </p>
        </div>

      </div>

      {/* Informations supplémentaires redesignées */}
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 rounded-2xl p-4 mb-4 border border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-600 text-sm">
                <Globe className="w-4 h-4 mr-1.5 text-blue-500" />
                <span className="font-semibold">{getRemoteLabel(candidate.remote)}</span>
              </div>
              {candidate.salary && (
                <div className="flex items-center text-gray-600 text-sm">
                  <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" />
                  <span className="font-semibold">{candidate.salary}</span>
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-500 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              <span>Mis à jour {new Date(candidate.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          {/* Rémunération redesignée */}
          {(candidate.dailyRate || candidate.annualSalary || candidate.daily_rate || candidate.annual_salary) && (
            <div className="pt-3 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Rémunération souhaitée</span>
                <div className="flex items-center gap-4">
                  {(candidate.dailyRate || candidate.daily_rate) && (
                    <div className="flex items-center text-gray-900">
                      <span className="text-sm font-medium mr-1">TJM:</span>
                      <span className="font-extrabold text-sm">{candidate.dailyRate || candidate.daily_rate}€</span>
                    </div>
                  )}
                  {(candidate.annualSalary || candidate.annual_salary) && (
                    <div className="flex items-center text-gray-900">
                      <span className="text-sm font-medium mr-1">Annuel:</span>
                      <span className="font-extrabold text-sm">{(candidate.annualSalary || candidate.annual_salary).toLocaleString('fr-FR')}€</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions redesignées - bouton secondaire (Outline) */}
      <div className="px-6 pb-6">
        <div className="border-t border-gray-200/50 pt-4">
          {candidate.id ? (
            <Link
              to={`/candidates/${candidate.id}`}
              className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-2xl border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir le profil complet
            </Link>
          ) : (
            <div className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-400 bg-white cursor-not-allowed">
              <User className="w-4 h-4 mr-2" />
              Profil indisponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
