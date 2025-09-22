import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Filter, 
  X, 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Globe, 
  Building2,
  Calendar,
  TrendingUp,
  Star,
  Users,
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import JobCard from "../components/JobCard";
import ToggleChip from "../components/ToggleChip";
import Pagination from "../components/Pagination";
import MatchingWidget from "../components/MatchingWidget";
import { usePermissions } from "../hooks/usePermissions";
import { buildApiUrl, API_ENDPOINTS } from "../config/api";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteFilter, setRemoteFilter] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState([]);
  const [locationFilter, setLocationFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 6;
  
  const { isRecruiter, isCandidate } = usePermissions();

  // Charger les offres depuis l'API
  const loadJobs = async () => {
    try {
      setLoading(true);
      const apiUrl = await buildApiUrl(API_ENDPOINTS.JOBS);
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        setJobs([]);
      }
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les offres au montage du composant
  useEffect(() => {
    loadJobs();
  }, []);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => setPage(1), [searchQuery, remoteFilter, experienceFilter, locationFilter, typeFilter, sortBy]);

  const toggleIn = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Filtrer et trier les offres
  const filteredJobs = jobs.filter(job => {
    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = `${job.title} ${job.company} ${job.location} ${job.tags.join(' ')} ${job.description}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }

    // Filtres
    if (remoteFilter.length > 0 && !remoteFilter.includes(job.remote)) return false;
    if (experienceFilter.length > 0 && !experienceFilter.includes(job.seniority)) return false;
    if (locationFilter.length > 0 && !locationFilter.some(loc => job.location.toLowerCase().includes(loc.toLowerCase()))) return false;
    if (typeFilter.length > 0 && !typeFilter.includes(job.type)) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.postedAt) - new Date(a.postedAt);
    }
    if (sortBy === "company") {
      return a.company.localeCompare(b.company);
    }
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  const hasActiveFilters = remoteFilter.length || experienceFilter.length || locationFilter.length || typeFilter.length || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header avec statistiques */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar filters */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" /> 
                  Filtres avancés
                </h2>
                {hasActiveFilters && (
                  <button 
                    onClick={() => { 
                      setRemoteFilter([]); 
                      setExperienceFilter([]); 
                      setLocationFilter([]);
                      setTypeFilter([]);
                      setSearchQuery(""); 
                    }} 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1 rounded-full"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  Recherche
                </label>
                <div className="relative">
                  <input 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Poste, entreprise, compétences..." 
                    className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Remote */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Type de travail
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "remote", label: "100% Remote" },
                    { value: "hybrid", label: "Hybride" },
                    { value: "onsite", label: "Sur site" }
                  ].map((option) => (
                    <ToggleChip
                      key={option.value}
                      active={remoteFilter.includes(option.value)}
                      onClick={() => toggleIn(remoteFilter, setRemoteFilter, option.value)}
                    >
                      {option.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Niveau d'expérience
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "Junior", label: "Junior", color: "green" },
                    { value: "Mid", label: "Mid", color: "blue" },
                    { value: "Senior", label: "Senior", color: "purple" },
                    { value: "Lead", label: "Lead", color: "orange" }
                  ].map((option) => (
                    <ToggleChip
                      key={option.value}
                      active={experienceFilter.includes(option.value)}
                      onClick={() => toggleIn(experienceFilter, setExperienceFilter, option.value)}
                    >
                      {option.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Type de contrat */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Type de contrat
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "CDI", label: "CDI" },
                    { value: "CDD", label: "CDD" },
                    { value: "Freelance", label: "Freelance" },
                    { value: "Stage", label: "Stage" }
                  ].map((option) => (
                    <ToggleChip
                      key={option.value}
                      active={typeFilter.includes(option.value)}
                      onClick={() => toggleIn(typeFilter, setTypeFilter, option.value)}
                    >
                      {option.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Localisation */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Localisation
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Paris", "Lyon", "Bordeaux", "Marseille", "Toulouse", "Nantes", "Remote"].map((location) => (
                    <ToggleChip
                      key={location}
                      active={locationFilter.includes(location)}
                      onClick={() => toggleIn(locationFilter, setLocationFilter, location)}
                    >
                      {location}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Tri */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Trier par
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="company">Entreprise (A-Z)</option>
                </select>
              </div>
            </motion.div>

            {/* Call to action pour les recruteurs */}
            {isRecruiter && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <h3 className="text-lg font-bold mb-2">Publiez votre offre</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Attirez les meilleurs talents UX/UI en publiant votre offre sur notre plateforme.
                </p>
                <Link 
                  to="/recruiter-dashboard?tab=publish" 
                  className="block w-full bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  Publier une offre
                </Link>
              </motion.div>
            )}

          </aside>

          {/* Contenu principal */}
          <main className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Résultats */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
                  </h2>
                  {hasActiveFilters && (
                    <p className="text-gray-600 text-sm">
                      Filtres actifs : {[
                        ...remoteFilter,
                        ...experienceFilter,
                        ...locationFilter,
                        ...typeFilter,
                        ...(searchQuery ? [`"${searchQuery}"`] : [])
                      ].join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Liste des offres */}
              {loading ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-white/20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des offres...</h3>
                  <p className="text-gray-600">Récupération des dernières offres d'emploi</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-white/20">
                  {hasActiveFilters ? (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
                      <p className="text-gray-600 mb-6">
                        Essayez de modifier vos critères de recherche ou de supprimer certains filtres.
                      </p>
                      <button 
                        onClick={() => { 
                          setRemoteFilter([]); 
                          setExperienceFilter([]); 
                          setLocationFilter([]);
                          setTypeFilter([]);
                          setSearchQuery(""); 
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Réinitialiser les filtres
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre disponible</h3>
                      <p className="text-gray-600 mb-6">
                        Il n'y a actuellement aucune offre d'emploi disponible. Revenez plus tard pour découvrir de nouvelles opportunités.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
