import React, { useEffect, useState } from "react";
import { Filter, X, Users, MapPin, Briefcase, Search, Globe, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OptimizedCandidateCard from "../components/OptimizedCandidateCard";
import SignupCard from "../components/SignupCard";
import ToggleChip from "../components/ToggleChip";
import Pagination from "../components/Pagination";
import { useCandidates } from "../services/candidatesApi";
import { usePermissions } from "../hooks/usePermissions";
import { RecruiterSubscriptionGuard } from "../components/RecruiterSubscriptionGuard";
import { useRecruiter } from "../hooks/useRecruiter";

const EXPERIENCE_ORDER = { Junior: 1, Mid: 2, Senior: 3, Lead: 4 };

export default function CandidatesListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState([]); // ["remote","onsite","hybrid"]
  const [experience, setExperience] = useState([]); // ["Junior","Mid","Senior","Lead"]
  // const [availability, setAvailability] = useState([]); // ["available","busy","unavailable"] - Supprimé
  const [location, setLocation] = useState([]); // ["Paris","Lyon","Bordeaux","Marseille","Toulouse","Nantes"]
  const [salaryRange, setSalaryRange] = useState([]); // ["30-40k€","40-55k€","50-65k€","45-60k€","65-80k€"]
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "experience"
  const [page, setPage] = useState(1);
  const pageSize = 8;
  
  const { isRecruiter, isCandidate } = usePermissions();
  const { recruiter, loading: recruiterLoading } = useRecruiter();

  useEffect(() => setPage(1), [q, remote, experience, location, salaryRange, sortBy]);

  const toggleIn = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Utiliser l'API pour récupérer les candidats avec pagination côté serveur
  const { candidates, loading, error, total } = useCandidates({
    search: q,
    remote,
    experience,
    location,
    salaryRange,
    sortBy
  }, page, pageSize);


  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Plus besoin de pagination côté client - déjà fait côté serveur
  const paged = candidates;

  const hasActiveFilters = remote.length || experience.length || location.length || salaryRange.length || q;


  const content = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar filters */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 card-transition hover:shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" /> 
                  Filtres avancés
                </h2>
                {hasActiveFilters && (
                  <button 
                    onClick={() => { 
                      setRemote([]); 
                      setExperience([]); 
                      setLocation([]);
                      setSalaryRange([]);
                      setQ(""); 
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
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    placeholder="Nom, titre, compétences, ville…" 
                    className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                  {q && (
                    <button 
                      onClick={() => setQ("")} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  Mode de travail
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["remote","onsite","hybrid"]).map((v) => (
                    <ToggleChip key={v} active={remote.includes(v)} onClick={() => toggleIn(remote, setRemote, v)}>
                      {{remote:"Full remote", onsite:"Sur site", hybrid:"Hybride"}[v]}
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
                  {(["Junior","Mid","Senior","Lead"]).map((v) => (
                    <ToggleChip key={v} active={experience.includes(v)} onClick={() => toggleIn(experience, setExperience, v)}>
                      {v}
                    </ToggleChip>
                  ))}
                </div>
              </div>


              {/* Location */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> 
                  Localisation
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Paris","Lyon","Bordeaux","Marseille","Toulouse","Nantes"]).map((v) => (
                    <ToggleChip key={v} active={location.includes(v)} onClick={() => toggleIn(location, setLocation, v)}>
                      {v}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" /> 
                  Fourchette salariale
                </label>
                <select 
                  value={salaryRange.length > 0 ? salaryRange[0] : ''} 
                  onChange={(e) => setSalaryRange(e.target.value ? [e.target.value] : [])} 
                  className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Toutes les fourchettes</option>
                  <option value="30-40k">30k-40k€</option>
                  <option value="35-45k">35k-45k€</option>
                  <option value="40-50k">40k-50k€</option>
                  <option value="45-55k">45k-55k€</option>
                  <option value="50-60k">50k-60k€</option>
                  <option value="55-65k">55k-65k€</option>
                  <option value="60-70k">60k-70k€</option>
                  <option value="65-75k">65k-75k€</option>
                  <option value="70-80k">70k-80k€</option>
                  <option value="75-85k">75k-85k€</option>
                  <option value="80-90k">80k-90k€</option>
                  <option value="85-95k">85k-95k€</option>
                  <option value="90-100k">90k-100k€</option>
                  <option value="95-110k">95k-110k€</option>
                  <option value="100-120k">100k-120k€</option>
                  <option value="110-130k">110k-130k€</option>
                  <option value="120-140k">120k-140k€</option>
                  <option value="130-150k">130k-150k€</option>
                  <option value="140-160k">140k-160k€</option>
                  <option value="150k+">150k+€</option>
                </select>
              </div>


              {/* Sort */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> 
                  Trier par
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="recent">Plus récents</option>
                  <option value="experience">Niveau d'expérience</option>
                </select>
              </div>
            </div>

          </aside>

          {/* Results */}
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  {loading ? "Chargement..." : `${total} candidat${total>1?"s":""} trouvé${total>1?"s":""}`}
                </p>
              </div>
              {hasActiveFilters && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Filtres actifs</div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <p className="text-red-600 font-medium">Erreur lors du chargement des candidats : {error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des talents...</h3>
                <p className="text-gray-600">Récupération des derniers profils</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paged.map((candidate, index) => {
                  if (candidate.isSignupCard) {
                    return <SignupCard key={candidate.id} hiddenCount={candidate.hiddenCount} />;
                  }
                  
                  // Plus de floutage - tous les profils approuvés sont visibles en clair
                  
                  return (
                    <OptimizedCandidateCard
                      key={candidate.id} 
                      candidate={candidate} 
                      compact 
                    />
                  );
                })}
                {paged.length === 0 && (
                  <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-xl border border-white/20 card-transition">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun candidat trouvé</h3>
                    <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                  </div>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );

  // Appliquer le guard d'abonnement uniquement pour les recruteurs
  if (isRecruiter) {
    return (
      <RecruiterSubscriptionGuard recruiter={recruiter} loading={recruiterLoading}>
        {content}
      </RecruiterSubscriptionGuard>
    );
  }

  // Les candidats et visiteurs authentifiés non-recruteurs voient la page sans guard
  return content;
}
