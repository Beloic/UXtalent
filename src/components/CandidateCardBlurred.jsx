import React from "react";
import { MapPin, Globe, User, Briefcase, DollarSign, Award, Clock, Eye, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function CandidateCardBlurred({ candidate, hiddenCount, compact = false }) {
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

  return (
    <div className={`group bg-white/60 backdrop-blur-sm rounded-2xl ${compact ? 'p-4' : 'p-6'} shadow-xl border border-gray-200 relative overflow-hidden`}>
      {/* Overlay de flou */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10"></div>
      
      {/* Indicateur de contenu caché */}
      <div className="absolute top-4 right-4 z-20 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
        <Lock className="w-3 h-3" />
        Réservé aux recruteurs
      </div>
      
      {/* Header */}
      <div className={`flex items-start justify-between ${compact ? 'mb-3' : 'mb-6'} relative z-5`}>
        <div className="flex items-start gap-4 flex-1">
          {/* Photo de profil floutée */}
          <div className="relative">
            <div className={`${compact ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl bg-gray-300 flex items-center justify-center border-2 border-white shadow-lg`}>
              <User className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className={`font-bold text-gray-400 ${compact ? 'text-lg mb-1' : 'text-xl mb-2'}`}>
              Profil Premium
            </h3>
            <p className={`${compact ? 'text-base mb-2' : 'text-lg mb-3'} text-gray-400 font-medium`}>Designer UX/UI</p>
            <div className={`flex items-center text-sm text-gray-400 ${compact ? 'mb-2' : 'mb-3'}`}>
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              Localisation
            </div>
          </div>
        </div>
      </div>

      {/* Bio floutée */}
      <div className={`text-gray-400 text-sm ${compact ? 'mb-3' : 'mb-6'} line-clamp-2 leading-relaxed`}>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>

      {/* Bloc compétences retiré en mode liste */}

      {/* Détails retirés pour compacité */}

      {/* Message d'upgrade */}
      <div className={`${compact ? 'mb-4' : 'mb-6'} p-4 bg-orange-50 rounded-xl border border-orange-200 relative z-5`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">
              {hiddenCount} profils supplémentaires disponibles
            </span>
          </div>
          <p className="text-xs text-orange-600">
            Créez un compte recruteur pour accéder à tous les profils détaillés
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-4 border-t border-gray-100 relative z-5">
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl"
        >
          <User className="w-4 h-4 mr-2" />
          Devenir recruteur
        </Link>
      </div>
    </div>
  );
}
