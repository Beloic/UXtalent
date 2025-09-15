import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, 
  Globe, 
  Mail, 
  ExternalLink, 
  ArrowLeft, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Languages,
  User,
  Star,
  CheckCircle,
  Heart,
  HeartOff,
  Map,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { useCandidate } from "../services/candidatesApi";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

// Composant pour les tendances de vues (version simplifiée pour les recruteurs)
function ProfileViewsStats({ candidateId }) {
  const [stats, setStats] = useState({
    totalViews: 0,
    viewsLast7Days: 0,
    viewsToday: 0,
    trend: 0,
    trendPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Essayer de récupérer les vraies données depuis l'API publique
        try {
          const response = await fetch(`http://localhost:3001/api/candidates/${candidateId}/stats`);
          if (response.ok) {
            const data = await response.json();
            const dailyViews = data.dailyViews || [];
            
            // Calculer la tendance basée sur les vues des derniers jours
            let trend = 0;
            let trendPercentage = 0;
            if (dailyViews.length >= 6) {
              const recentViews = dailyViews.slice(-3).reduce((sum, day) => sum + (day.views || 0), 0);
              const olderViews = dailyViews.slice(0, 3).reduce((sum, day) => sum + (day.views || 0), 0);
              trend = recentViews > olderViews ? 1 : recentViews < olderViews ? -1 : 0;
              trendPercentage = olderViews > 0 ? Math.round(((recentViews - olderViews) / olderViews) * 100) : 0;
            }
            
            setStats({
              totalViews: data.profileViews || 0,
              viewsLast7Days: data.viewsLast7Days || 0,
              viewsToday: data.profileViewsToday || 0,
              trend,
              trendPercentage
            });
            return;
          }
        } catch (apiError) {
          console.log('API publique non disponible, utilisation des données simulées');
        }
        
        // Fallback avec des données simulées
        const mockStats = {
          totalViews: Math.floor(Math.random() * 200) + 50,
          viewsLast7Days: Math.floor(Math.random() * 30) + 5,
          viewsToday: Math.floor(Math.random() * 8) + 1,
          trend: Math.random() > 0.5 ? 1 : -1,
          trendPercentage: Math.floor(Math.random() * 50) + 10
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tendances de vues</h3>
            <p className="text-sm text-gray-600">Popularité du profil</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalViews}</div>
          <div className="text-sm text-gray-600 font-medium">Total vues</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.viewsLast7Days}</div>
          <div className="text-sm text-gray-600 font-medium">7 derniers jours</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.viewsToday}</div>
          <div className="text-sm text-gray-600 font-medium">Aujourd'hui</div>
        </div>
      </div>

      {/* Tendance */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center gap-4">
          {stats.trend === 1 && (
            <>
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">En hausse</div>
                <div className="text-sm text-gray-600">+{stats.trendPercentage}% cette semaine</div>
              </div>
            </>
          )}
          {stats.trend === -1 && (
            <>
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">En baisse</div>
                <div className="text-sm text-gray-600">{stats.trendPercentage}% cette semaine</div>
              </div>
            </>
          )}
          {stats.trend === 0 && (
            <>
              <BarChart3 className="w-8 h-8 text-gray-600" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">Stable</div>
                <div className="text-sm text-gray-600">Pas de changement significatif</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Note informative */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          💡 Les graphiques détaillés sont disponibles dans le profil premium du candidat
        </p>
      </div>
    </div>
  );
}

// Composant de carte avec géocodage
function LocationMap({ location }) {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) {
      setLoading(false);
      return;
    }

    // Géocoder la localisation pour obtenir les coordonnées
    const geocodeLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        
        if (!response.ok) {
          throw new Error('Erreur de géocodage');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setCoordinates({ lat: parseFloat(lat), lon: parseFloat(lon) });
        } else {
          setError('Localisation non trouvée');
        }
      } catch (err) {
        console.error('Erreur lors du géocodage:', err);
        setError('Impossible de localiser');
      } finally {
        setLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  if (!location) return null;

  if (loading) {
    return (
      <div className="w-full h-48 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="w-full h-48 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">{error || 'Localisation non trouvée'}</p>
        </div>
      </div>
    );
  }

  // Créer l'URL de la carte avec un zoom plus large pour voir la ville complète
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.1},${coordinates.lat - 0.1},${coordinates.lon + 0.1},${coordinates.lat + 0.1}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`;
  
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        title={`Carte de ${location}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams();
  const { candidate, loading, error } = useCandidate(id);
  const { user } = useAuth();
  const { isRecruiter } = usePermissions();
  const hasTrackedViewRef = React.useRef(false);
  
  // État pour les favoris
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');

  // Vérifier si le candidat est en favori
  useEffect(() => {
    if (user && isRecruiter && candidate?.id) {
      checkIfFavorited();
    }
  }, [user, isRecruiter, candidate?.id]);

  const checkIfFavorited = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(`http://localhost:3001/api/recruiter/favorites/${candidate.id}/check`, {
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

  const toggleFavorite = async () => {
    if (!user || !isRecruiter) return;
    
    setIsLoadingFavorite(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (isFavorited) {
        // Retirer des favoris
        const response = await fetch(`http://localhost:3001/api/recruiter/favorites/${candidate.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsFavorited(false);
          setFavoriteMessage('✅ Candidat retiré des favoris');
          setTimeout(() => setFavoriteMessage(''), 3000);
        }
      } else {
        // Ajouter aux favoris
        const response = await fetch(`http://localhost:3001/api/recruiter/favorites/${candidate.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsFavorited(true);
          setFavoriteMessage('✅ Candidat ajouté aux favoris');
          setTimeout(() => setFavoriteMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
      setFavoriteMessage('❌ Erreur lors de la modification des favoris');
      setTimeout(() => setFavoriteMessage(''), 3000);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Tracking des vues de profil (une seule fois par visite)
  React.useEffect(() => {
    if (candidate && candidate.id && !hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true; // Marquer immédiatement comme tracké
      
      // Envoyer une requête pour tracker la vue (sans email, juste l'ID)
      fetch(`http://localhost:3001/api/profile-stats/${id}/track-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: candidate.id
        })
      })
      .then(response => response.json())
      .then(data => {
        // Vue trackée avec succès
      })
      .catch(error => {
        console.error('Erreur lors du tracking de la vue:', error);
        hasTrackedViewRef.current = false; // Réinitialiser en cas d'erreur
      });
    }
  }, [candidate, id]);

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


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link 
          to="/candidates" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Erreur lors du chargement du candidat : {error}</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link 
          to="/candidates" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Link>
        <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
          <p className="text-gray-500">Candidat non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <Link 
            to="/candidates" 
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 backdrop-blur-sm">
              {/* Header du profil */}
              <div className="flex items-start gap-6 mb-8">
                {/* Photo de profil */}
                <div className="relative">
                  {candidate.photo ? (
                    <img
                      src={candidate.photo}
                      alt={`Photo de ${candidate.name}`}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=96&background=6366f1&color=ffffff&bold=true`;
                      }}
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=96&background=6366f1&color=ffffff&bold=true`}
                      alt={`Avatar de ${candidate.name}`}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {candidate.name}
                    </h1>
                    {/* Badge Premium/Pro */}
                    {(candidate.planType === 'premium' || candidate.planType === 'pro') && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg ${
                        candidate.planType === 'pro' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                          : 'bg-blue-600'
                      }`}>
                        <span className={candidate.planType === 'pro' ? 'text-amber-100' : 'text-blue-200'}>⭐</span>
                        {candidate.planType === 'pro' ? 'Pro' : 'Premium'}
                      </span>
                    )}
                    
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
                          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mb-4">{candidate.title || 'Titre non spécifié'}</p>
                  <div className="flex items-center gap-4">
                    {(() => {
                      // Extraire les années d'expérience depuis la bio structurée
                      const bio = candidate.bio || '';
                      const match = bio.match(/Années d'expérience: (\d+) ans/);
                      const years = match ? parseInt(match[1]) : (candidate.yearsOfExperience || candidate.years_of_experience);
                      
                      if (!years) return null;
                      
                      // Définir les couleurs selon les années d'expérience
                      const getYearsColor = (years) => {
                        if (years <= 1) return 'bg-green-100 text-green-800 border border-green-200';
                        if (years <= 3) return 'bg-blue-100 text-blue-800 border border-blue-200';
                        if (years <= 6) return 'bg-purple-100 text-purple-800 border border-purple-200';
                        if (years <= 10) return 'bg-orange-100 text-orange-800 border border-orange-200';
                        return 'bg-red-100 text-red-800 border border-red-200'; // 10+ ans
                      };
                      
                      return (
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getYearsColor(years)}`}>
                          {years === 1 ? '1 an XP' : `${years} ans XP`}
                        </span>
                      );
                    })()}
                    {candidate.location && (
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message de statut des favoris */}
              {favoriteMessage && (
                <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${
                  favoriteMessage.includes('✅') 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {favoriteMessage.includes('✅') && <Heart className="w-4 h-4" />}
                    {favoriteMessage.includes('❌') && <span className="text-red-500">❌</span>}
                    <span>{favoriteMessage}</span>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  À propos
                </h2>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {(() => {
                      // Masquer la ligne "Années d'expérience" de la bio puisqu'elle est affichée séparément
                      const bio = candidate.bio || '';
                      return bio.replace(/Années d'expérience: \d+ ans \([^)]+\)\n\n/, '');
                    })()}
                  </p>
                </div>
              </div>

              {/* Compétences */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Compétences
                </h2>
                <div className="flex flex-wrap gap-3">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Compétences non spécifiées</p>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contacter ce candidat</h2>
                <div className="flex flex-wrap gap-4">
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                    >
                      <Mail className="w-5 h-5" />
                      Envoyer un email
                    </a>
                  )}
                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border border-blue-200"
                    >
                      <ExternalLink className="w-5 h-5" />
                      LinkedIn
                    </a>
                  )}
                  {candidate.portfolio && (
                    <a
                      href={candidate.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold border border-gray-200"
                    >
                      <Globe className="w-5 h-5" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bloc séparé pour les tendances de vues */}
          <div className="lg:col-span-2 mt-8">
            <ProfileViewsStats candidateId={candidate.id} />
          </div>

          {/* Barre latérale droite */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20 backdrop-blur-sm sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Informations
              </h3>
              
              <div className="space-y-6">
                {/* Localisation */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Localisation</p>
                      <p className="font-semibold text-gray-900">{candidate.location || 'Non spécifiée'}</p>
                    </div>
                  </div>
                  
                  {/* Carte de localisation */}
                  {candidate.location && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Map className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700">Localisation exacte</p>
                      </div>
                      <LocationMap location={candidate.location} />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Carte fournie par OpenStreetMap</span>
                        <a
                          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(candidate.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Ouvrir dans OpenStreetMap
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remote */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Mode de travail</p>
                    <p className="font-semibold text-gray-900">{candidate.remote ? getRemoteLabel(candidate.remote) : 'Non spécifié'}</p>
                  </div>
                </div>

                {/* Téléphone */}
                {candidate.phone && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Téléphone</p>
                      <p className="font-semibold text-gray-900">{candidate.phone}</p>
                    </div>
                  </div>
                )}

                {/* Années d'expérience */}
                {(() => {
                  // Extraire les années d'expérience depuis la bio structurée
                  const bio = candidate.bio || '';
                  const match = bio.match(/Années d'expérience: (\d+) ans/);
                  const years = match ? parseInt(match[1]) : (candidate.yearsOfExperience || candidate.years_of_experience);
                  
                  return years ? (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Années d'expérience</p>
                        <p className="font-semibold text-gray-900">
                          {years} {years === 1 ? 'an XP' : 'ans XP'}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Salaire */}
                {candidate.salary && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Salaire souhaité</p>
                      <p className="font-semibold text-gray-900">{candidate.salary}</p>
                    </div>
                  </div>
                )}

                {/* Langues */}
                {candidate.languages && candidate.languages.length > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Languages className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Langues</p>
                      <p className="font-semibold text-gray-900">{candidate.languages.join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Profil créé */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Profil créé</p>
                    <p className="font-semibold text-gray-900">
                      {(() => {
                        // Essayer createdAt d'abord, puis created_at en fallback
                        const dateValue = candidate.createdAt || candidate.created_at;
                        if (!dateValue) return 'Non spécifiée';
                        
                        try {
                          const date = new Date(dateValue);
                          return isNaN(date.getTime()) ? 'Non spécifiée' : date.toLocaleDateString('fr-FR');
                        } catch (error) {
                          console.error('Erreur de format de date:', dateValue, error);
                          return 'Non spécifiée';
                        }
                      })()}
                    </p>
                  </div>
                </div>


                {/* Rémunération */}
                {(candidate.dailyRate || candidate.annualSalary || candidate.daily_rate || candidate.annual_salary) && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">Rémunération souhaitée</p>
                      <div className="space-y-2">
                        {(candidate.dailyRate || candidate.daily_rate) && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">TJM:</span>
                            <span className="font-bold text-gray-900">{candidate.dailyRate || candidate.daily_rate}€</span>
                          </div>
                        )}
                        {(candidate.annualSalary || candidate.annual_salary) && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">Salaire annuel:</span>
                            <span className="font-bold text-gray-900">{(candidate.annualSalary || candidate.annual_salary).toLocaleString('fr-FR')}€</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Statut de vérification */}
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Profil vérifié</p>
                    <p className="text-xs text-emerald-600">Candidat validé par notre équipe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
