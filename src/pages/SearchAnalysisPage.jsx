import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Brain,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle,
  Zap,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { buildApiUrl } from '../config/api';

export default function SearchAnalysisPage() {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    availability: '',
    salary: '',
    skills: []
  });

  // Charger les données de la recherche
  const loadSearchData = async () => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      // Charger la recherche
      const searchResponse = await fetch(buildApiUrl(`/api/recruiter/searches/${searchId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        setSearch(searchData);
      } else {
        setMessage('❌ Erreur lors du chargement de la recherche');
        return;
      }

      // Charger tous les candidats
      const candidatesResponse = await fetch(buildApiUrl('/api/candidates/'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
      } else {
        setMessage('❌ Erreur lors du chargement des candidats');
      }
    } catch (error) {
      setMessage('❌ Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Simuler l'analyse IA (à remplacer par l'intégration réelle)
  const runAIAnalysis = async () => {
    try {
      setAnalyzing(true);
      setMessage('🤖 L\'IA analyse vos critères et compare avec les profils disponibles...');
      
      // Simulation d'un délai d'analyse
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulation des résultats d'analyse
      const candidatesArray = Array.isArray(candidates) ? candidates : [];
      const mockAnalysis = {
        totalCandidates: candidatesArray.length,
        matchingCandidates: Math.floor(candidatesArray.length * 0.7),
        topMatches: candidatesArray.slice(0, 5).map((candidate, index) => ({
          ...candidate,
          matchScore: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
          matchingSkills: candidate.skills?.slice(0, 3) || [],
          strengths: [
            'Expérience pertinente',
            'Compétences techniques alignées',
            'Disponibilité immédiate'
          ],
          concerns: [
            'Salaire légèrement au-dessus du budget',
            'Localisation différente'
          ]
        })),
        insights: [
          {
            type: 'success',
            title: 'Excellente correspondance',
            description: `${Math.floor(candidatesArray.length * 0.7)} candidats correspondent parfaitement à vos critères`
          },
          {
            type: 'warning',
            title: 'Attention au budget',
            description: 'Certains candidats senior dépassent votre fourchette salariale'
          },
          {
            type: 'info',
            title: 'Compétences recherchées',
            description: 'Les compétences les plus demandées sont React, Figma et Product Management'
          }
        ],
        recommendations: [
          'Considérez élargir votre recherche géographique pour plus d\'options',
          'Les profils junior-mid level offrent un meilleur rapport qualité-prix',
          'Priorisez les candidats avec une expérience en startup'
        ]
      };
      
      setAnalysis(mockAnalysis);
      setMessage('✅ Analyse terminée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'analyse IA');
    } finally {
      setAnalyzing(false);
    }
  };

  // Filtrer les candidats
  const filteredCandidates = Array.isArray(candidates) ? candidates.filter(candidate => {
    if (filters.experience && candidate.experience !== filters.experience) return false;
    if (filters.location && !candidate.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.availability && candidate.availability !== filters.availability) return false;
    if (filters.skills.length > 0) {
      const candidateSkills = candidate.skills?.map(s => s.toLowerCase()) || [];
      const hasRequiredSkills = filters.skills.some(skill => 
        candidateSkills.some(cs => cs.includes(skill.toLowerCase()))
      );
      if (!hasRequiredSkills) return false;
    }
    return true;
  }) : [];

  // Ajouter/retirer un candidat de la sélection
  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  useEffect(() => {
    loadSearchData();
  }, [searchId]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement de l'analyse...</h3>
        <p className="text-gray-600">Préparation des données pour l'intelligence artificielle</p>
      </div>
    );
  }

  if (!search) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Recherche introuvable</h3>
        <p className="text-gray-600 mb-6">La recherche demandée n'existe pas ou vous n'y avez pas accès.</p>
        <button
          onClick={() => navigate('/recruiter-dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/recruiter-dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{search.title}</h1>
            <p className="text-gray-600 mt-1">Analyse IA des candidats correspondants</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runAIAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Lancer l'analyse IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : message.includes('❌')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              {message.includes('✅') && <CheckCircle className="w-4 h-4" />}
              {message.includes('❌') && <AlertCircle className="w-4 h-4" />}
              {message.includes('🤖') && <Brain className="w-4 h-4" />}
              <span>{message}</span>
            </div>
          </div>
        </motion.div>
      )}
        {/* Informations de la recherche */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{search.title}</h2>
              {search.profile_type && (
                <span className="text-lg text-gray-600">• {search.profile_type}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Recherche active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {search.experience_level && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Expérience</p>
                  <p className="font-medium text-gray-900">{search.experience_level}</p>
                </div>
              </div>
            )}
            {search.location_preference && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Localisation</p>
                  <p className="font-medium text-gray-900">{search.location_preference}</p>
                </div>
              </div>
            )}
            {search.salary_range && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Salaire</p>
                  <p className="font-medium text-gray-900">{search.salary_range}</p>
                </div>
              </div>
            )}
            {search.availability_preference && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Disponibilité</p>
                  <p className="font-medium text-gray-900">{search.availability_preference}</p>
                </div>
              </div>
            )}
          </div>

          {search.required_skills && search.required_skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Compétences requises :</h3>
              <div className="flex flex-wrap gap-2">
                {search.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Résultats de l'analyse IA */}
        {analysis && (
          <div className="space-y-8">
            {/* Statistiques générales - Design premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border border-blue-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-blue-600 mb-1">{analysis.totalCandidates}</p>
                    <p className="text-sm font-medium text-blue-700">Candidats</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Base de données</h3>
                <p className="text-sm text-gray-600">Profils disponibles pour l'analyse</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border border-green-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-green-600 mb-1">{analysis.matchingCandidates}</p>
                    <p className="text-sm font-medium text-green-700">Matches</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Correspondances</h3>
                <p className="text-sm text-gray-600">Profils correspondant aux critères</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border border-purple-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-purple-600 mb-1">
                      {Math.round((analysis.matchingCandidates / analysis.totalCandidates) * 100)}%
                    </p>
                    <p className="text-sm font-medium text-purple-700">Taux</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Performance</h3>
                <p className="text-sm text-gray-600">Pourcentage de correspondance</p>
              </motion.div>
            </div>

            {/* Insights et recommandations - Design premium */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Insights IA</h3>
                </div>
                <div className="space-y-4">
                  {analysis.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`p-4 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
                        insight.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                        insight.type === 'warning' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                        'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          insight.type === 'success' ? 'bg-green-500' :
                          insight.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <h4 className="font-bold text-gray-900">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recommandations</h3>
                </div>
                <div className="space-y-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed pt-1">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Meilleurs matches - Design premium */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Meilleurs matches</h3>
                    <p className="text-sm text-gray-600">{analysis.topMatches.length} candidats sélectionnés par l'IA</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sélectionnés</p>
                    <p className="text-2xl font-bold text-green-600">{selectedCandidates.length}</p>
                  </div>
                  {selectedCandidates.length > 0 && (
                    <button className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                      <MessageCircle className="w-5 h-5" />
                      Contacter ({selectedCandidates.length})
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {analysis.topMatches.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`border-2 rounded-3xl p-6 transition-all duration-300 hover:shadow-lg ${
                      selectedCandidates.includes(candidate.id)
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={candidate.photo || `https://ui-avatars.com/api/?name=${candidate.name}&background=3b82f6&color=fff&size=80`}
                            alt={candidate.name}
                            className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">{candidate.matchScore}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h4>
                            <p className="text-lg text-gray-600 mb-1">{candidate.title}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {candidate.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="mb-3">
                              <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${candidate.matchScore}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Score de correspondance</p>
                            </div>
                            <button
                              onClick={() => toggleCandidateSelection(candidate.id)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                                selectedCandidates.includes(candidate.id)
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {selectedCandidates.includes(candidate.id) ? '✓ Sélectionné' : 'Sélectionner'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                            <h5 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Points forts
                            </h5>
                            <ul className="space-y-2">
                              {candidate.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-200">
                            <h5 className="text-sm font-bold text-yellow-700 mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Points d'attention
                            </h5>
                            <ul className="space-y-2">
                              {candidate.concerns.map((concern, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                            <Eye className="w-4 h-4" />
                            Voir le profil
                          </button>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                            <Heart className="w-4 h-4" />
                            Favoris
                          </button>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                            <MessageCircle className="w-4 h-4" />
                            Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* État initial - Invitation à lancer l'analyse - Design premium */}
        {!analysis && !analyzing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="max-w-3xl mx-auto">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Brain className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Prêt pour l'analyse IA</h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Notre intelligence artificielle va analyser vos critères de recherche et les comparer 
                avec tous les profils disponibles pour vous proposer les meilleures correspondances.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  Utilisez le bouton "Lancer l'analyse IA" ci-dessus pour commencer
                </p>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
}
