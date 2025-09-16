import React from "react";
import { MapPin, Globe, Briefcase, DollarSign, Clock, ExternalLink, Building2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Aujourd'hui";
    if (diffDays === 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getRemoteIcon = (remote) => {
    switch (remote) {
      case 'remote':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'hybrid':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'onsite':
        return <Building2 className="w-4 h-4 text-gray-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRemoteText = (remote) => {
    switch (remote) {
      case 'remote':
        return '100% Remote';
      case 'hybrid':
        return 'Hybride';
      case 'onsite':
        return 'Sur site';
      default:
        return 'Non spécifié';
    }
  };

  const getRemoteColor = (remote) => {
    switch (remote) {
      case 'remote':
        return 'bg-green-100 text-green-800';
      case 'hybrid':
        return 'bg-blue-100 text-blue-800';
      case 'onsite':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeniorityColor = (seniority) => {
    switch (seniority) {
      case 'Junior':
        return 'bg-green-100 text-green-800';
      case 'Mid':
        return 'bg-blue-100 text-blue-800';
      case 'Senior':
        return 'bg-purple-100 text-purple-800';
      case 'Lead':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'CDI':
        return 'bg-emerald-100 text-emerald-800';
      case 'CDD':
        return 'bg-blue-100 text-blue-800';
      case 'Freelance':
        return 'bg-purple-100 text-purple-800';
      case 'Stage':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-200/50">
      {/* Header avec logo entreprise et infos principales */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium mb-2">{job.company}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-600" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                {getRemoteIcon(job.remote)}
                <span>{getRemoteText(job.remote)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getTypeColor(job.type)}`}>
            {job.type}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-4 leading-relaxed">
        {job.description}
      </p>

      {/* Footer avec date et bouton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Publié {formatDate(job.postedAt)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Voir l'offre
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
