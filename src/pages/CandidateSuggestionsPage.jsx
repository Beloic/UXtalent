/**
 * Page des Suggestions d'Offres pour Candidats
 * Affiche les offres recommandées basées sur le profil du candidat
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  ArrowLeft,
  Settings,
  BarChart3
} from 'lucide-react';
import CandidateSuggestions from '../components/CandidateSuggestions';
import { RoleGuard } from '../components/RoleGuard';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

export default function CandidateSuggestionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Récupérer l'ID du candidat depuis l'utilisateur connecté
    if (user?.id) {
      setCandidateId(user.id);
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.MATCHING_STATS);
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['candidate']}>
      <div className="min-h-screen bg-gray-50">
        {/* En-tête */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/candidates')}
                    className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Suggestions d'Offres</h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Offres personnalisées basées sur votre profil et l'IA
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={fetchStats}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Statistiques et informations */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Statistiques personnelles */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos Statistiques</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profil complet</span>
                      <span className="text-sm font-medium text-green-600">✓ Complet</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compétences</span>
                      <span className="text-sm font-medium text-blue-600">5+ skills</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expérience</span>
                      <span className="text-sm font-medium text-purple-600">Senior</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Localisation</span>
                      <span className="text-sm font-medium text-orange-600">Paris</span>
                    </div>
                  </div>
                </div>

                {/* Statistiques globales */}
                {stats && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Marché</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Offres actives</span>
                        <span className="text-sm font-medium text-gray-900">{stats.dataQuality.activeJobs}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Score moyen</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(stats.matching.averageCompatibilityScore * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Matches excellents</span>
                        <span className="text-sm font-medium text-blue-600">
                          {stats.matching.highQualityPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conseils */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Conseils</h3>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start">
                      <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Mettez à jour vos compétences régulièrement</span>
                    </div>
                    <div className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Les offres avec un score &gt; 80% sont prioritaires</span>
                    </div>
                    <div className="flex items-start">
                      <Eye className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Consultez régulièrement vos suggestions</span>
                    </div>
                    <div className="flex items-start">
                      <Heart className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Postulez rapidement aux offres intéressantes</span>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier mon profil
                    </button>
                    <button
                      onClick={() => navigate('/candidates')}
                      className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Voir tous les candidats
                    </button>
                    <button
                      onClick={() => navigate('/jobs')}
                      className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Toutes les offres
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal - Suggestions */}
            <div className="lg:col-span-3">
              <CandidateSuggestions candidateId={candidateId} />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
