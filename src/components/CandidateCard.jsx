import React, { useState, useEffect } from "react";
import { MapPin, Globe, User, Briefcase, DollarSign, Award, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { PremiumBadge, ProBadge } from "./Badge";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../lib/supabase";

export default function CandidateCard({ candidate }) {
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
      case 'Junior': return 'bg-green-100 text-green-800';
      case 'Mid': return 'bg-blue-100 text-blue-800';
      case 'Senior': return 'bg-blue-100 text-blue-800';
      case 'Lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  // Définir les styles selon le plan
  const getCardStyles = () => {
    if (candidate.planType === 'pro') {
      return "group bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-amber-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative";
    } else if (candidate.planType === 'premium') {
      return "group bg-gradient-to-br from-blue-50/90 to-blue-100/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-blue-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative";
    } else {
      return "group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300";
    }
  };

  return (
    <div className={getCardStyles()}>
      {/* Badge de mise en avant pour Premium/Pro */}
      {(candidate.planType === 'premium' || candidate.planType === 'pro') && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className={`text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${
            candidate.planType === 'pro' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
              : 'bg-blue-600'
          }`}>
            <span className={candidate.planType === 'pro' ? 'text-amber-100' : 'text-blue-200'}>⭐</span>
            {candidate.planType === 'pro' ? 'Pro' : 'Premium'}
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4 flex-1">
          {/* Photo de profil ou Initiales */}
          <div className="relative">
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={`Photo de ${candidate.name}`}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                onError={(e) => {
                  console.log('❌ Erreur de chargement de la photo:', candidate.photo);
                  // Utiliser un avatar généré automatiquement
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=64&background=6366f1&color=ffffff&bold=true`;
                }}
                onLoad={() => {
                  console.log('✅ Photo chargée avec succès:', candidate.photo);
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=64&background=6366f1&color=ffffff&bold=true`}
                alt={`Avatar de ${candidate.name}`}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
              />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {candidate.name}
            </h3>
            <p className="text-lg text-gray-600 mb-3 font-medium">{candidate.title}</p>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              {candidate.location}
            </div>
          </div>
        </div>
        
        {/* Bouton favoris pour les recruteurs */}
        {user && isRecruiter && (
          <button
            onClick={toggleFavorite}
            disabled={isLoadingFavorite}
            className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
              isFavorited 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
            } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {isLoadingFavorite ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            )}
          </button>
        )}
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
        {(() => {
          // Masquer la ligne "Années d'expérience" de la bio puisqu'elle est affichée séparément
          const bio = candidate.bio || '';
          return bio.replace(/Années d'expérience: \d+ ans \([^)]+\)\n\n/, '');
        })()}
      </p>

      {/* Skills */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-700 mb-3 font-semibold">
          <Award className="w-4 h-4 mr-2 text-blue-500" />
          Compétences clés
        </div>
        <div className="flex flex-wrap gap-2">
          {(candidate.skills || []).slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200"
            >
              {skill}
            </span>
          ))}
          {(candidate.skills || []).length > 4 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              +{(candidate.skills || []).length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-600">
            <Globe className="w-4 h-4 mr-1 text-blue-500" />
            <span className="font-medium">{getRemoteLabel(candidate.remote)}</span>
          </div>
          {candidate.salary && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-1 text-green-500" />
              <span className="font-medium">{candidate.salary}</span>
            </div>
          )}
        </div>
        <div className="flex items-center text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span className="text-xs">
            Mis à jour {new Date(candidate.updatedAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Rémunération */}
      {(candidate.dailyRate || candidate.annualSalary || candidate.daily_rate || candidate.annual_salary) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-700 mb-3 font-semibold">
            Rémunération souhaitée
          </div>
          <div className="flex items-center justify-between text-sm">
            {(candidate.dailyRate || candidate.daily_rate) && (
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-1">TJM:</span>
                <span className="font-bold text-gray-900">{candidate.dailyRate || candidate.daily_rate}€</span>
              </div>
            )}
            {(candidate.annualSalary || candidate.annual_salary) && (
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-1">Annuel:</span>
                <span className="font-bold text-gray-900">{(candidate.annualSalary || candidate.annual_salary).toLocaleString('fr-FR')}€</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center pt-4 border-t border-gray-100">
        {candidate.id ? (
          <Link
            to={`/candidates/${candidate.id}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <User className="w-4 h-4 mr-2" />
            Voir le profil complet
          </Link>
        ) : (
          <span className="inline-flex items-center px-6 py-3 bg-gray-400 text-white text-sm font-medium rounded-xl cursor-not-allowed">
            <User className="w-4 h-4 mr-2" />
            Profil indisponible
          </span>
        )}
      </div>
    </div>
  );
}
