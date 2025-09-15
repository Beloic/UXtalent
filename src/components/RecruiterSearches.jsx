import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock,
  CheckCircle,
  Pause,
  Archive,
  Filter,
  Save,
  X,
  Brain,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function RecruiterSearches() {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    profile_type: '',
    required_skills: [],
    experience_level: '',
    salary_range: '',
    remote_preference: '',
    location_preference: '',
    availability_preference: '',
    additional_requirements: '',
    status: 'active'
  });

  // Charger les recherches
  const loadSearches = async () => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch('http://localhost:3001/api/recruiter/searches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearches(data);
      } else {
        setMessage('❌ Erreur lors du chargement des recherches');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recherches:', error);
      setMessage('❌ Erreur lors du chargement des recherches');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une recherche
  const saveSearch = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const url = editingSearch 
        ? `http://localhost:3001/api/recruiter/searches/${editingSearch.id}`
        : 'http://localhost:3001/api/recruiter/searches';
      
      const method = editingSearch ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage('✅ Recherche sauvegardée avec succès');
        setTimeout(() => setMessage(''), 3000);
        setShowForm(false);
        setEditingSearch(null);
        resetForm();
        loadSearches();
      } else {
        setMessage('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage('❌ Erreur lors de la sauvegarde');
    }
  };

  // Supprimer une recherche
  const deleteSearch = async (searchId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recherche ?')) return;
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(`http://localhost:3001/api/recruiter/searches/${searchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessage('✅ Recherche supprimée avec succès');
        setTimeout(() => setMessage(''), 3000);
        loadSearches();
      } else {
        setMessage('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  // Modifier une recherche
  const editSearch = (search) => {
    setEditingSearch(search);
    setFormData({
      title: search.title,
      profile_type: search.profile_type,
      required_skills: search.required_skills || [],
      experience_level: search.experience_level,
      salary_range: search.salary_range,
      remote_preference: search.remote_preference,
      location_preference: search.location_preference,
      availability_preference: search.availability_preference,
      additional_requirements: search.additional_requirements,
      status: search.status
    });
    setShowForm(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      profile_type: '',
      required_skills: [],
      experience_level: '',
      salary_range: '',
      remote_preference: '',
      location_preference: '',
      availability_preference: '',
      additional_requirements: '',
      status: 'active'
    });
  };

  // Ajouter une compétence
  const addSkill = (skill) => {
    if (skill.trim() && !formData.required_skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill.trim()]
      }));
    }
  };

  // Supprimer une compétence
  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Analyser une recherche avec l'IA
  const analyzeSearch = (search) => {
    navigate(`/recruiter/search-analysis/${search.id}`);
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadSearches();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des recherches...</h3>
        <p className="text-gray-600">Récupération de vos recherches sauvegardées</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Message de statut */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm font-medium mb-6 ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes('✅') && <CheckCircle className="w-4 h-4" />}
            {message.includes('❌') && <span className="text-red-500">❌</span>}
            <span>{message}</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Recherches</h2>
          <p className="text-gray-600 mt-2">Gérez vos critères de recherche de candidats</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSearch(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvelle recherche
        </button>
      </div>

      {/* Liste des recherches */}
      {searches.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune recherche pour le moment</h3>
          <p className="text-gray-600 mb-6">Créez votre première recherche pour commencer à trouver des candidats.</p>
          <button
            onClick={() => {
              resetForm();
              setEditingSearch(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer une recherche
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((search, index) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{search.title}</h3>
                    {search.profile_type && (
                      <span className="text-sm text-gray-600">• {search.profile_type}</span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap ${getStatusColor(search.status)}`}>
                    {getStatusIcon(search.status)}
                    {search.status === 'active' ? 'Active' : 
                     search.status === 'paused' ? 'En pause' :
                     search.status === 'completed' ? 'Terminée' : 'Archivée'}
                  </span>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    Créée le {new Date(search.created_at).toLocaleDateString('fr-FR')}
                    {search.updated_at !== search.created_at && (
                      <span> • Modifiée le {new Date(search.updated_at).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {search.status === 'active' && (
                    <button
                      onClick={() => analyzeSearch(search)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
                      title="Analyser avec l'IA"
                    >
                      <Brain className="w-4 h-4" />
                      Analyser
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => editSearch(search)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Formulaire de création/modification */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingSearch ? 'Modifier la recherche' : 'Nouvelle recherche'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSearch(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveSearch(); }} className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la recherche *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Développeur React Senior"
                    required
                  />
                </div>

                {/* Type de profil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de profil *
                  </label>
                  <input
                    type="text"
                    value={formData.profile_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Développeur Frontend, UX Designer, Product Manager"
                    required
                  />
                </div>

                {/* Niveau d'expérience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'expérience
                  </label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="Junior">Junior (0-2 ans)</option>
                    <option value="Mid">Mid (2-5 ans)</option>
                    <option value="Senior">Senior (5-10 ans)</option>
                    <option value="Lead">Lead (10+ ans)</option>
                  </select>
                </div>

                {/* Compétences requises */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences requises
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ajouter une compétence"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          addSkill(input.value);
                          input.value = '';
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {formData.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.required_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Préférence de travail à distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Préférence de travail à distance
                  </label>
                  <select
                    value={formData.remote_preference}
                    onChange={(e) => setFormData(prev => ({ ...prev, remote_preference: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Aucune préférence</option>
                    <option value="Remote">Télétravail uniquement</option>
                    <option value="Hybrid">Hybride</option>
                    <option value="Onsite">Présentiel uniquement</option>
                  </select>
                </div>

                {/* Localisation préférée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation préférée
                  </label>
                  <input
                    type="text"
                    value={formData.location_preference}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Paris, Lyon, Remote"
                  />
                </div>

                {/* Fourchette salariale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fourchette salariale
                  </label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 50-70k€, 400-600€/jour"
                  />
                </div>

                {/* Préférence de disponibilité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Préférence de disponibilité
                  </label>
                  <select
                    value={formData.availability_preference}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability_preference: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Aucune préférence</option>
                    <option value="Immediate">Immédiate</option>
                    <option value="1 month">1 mois</option>
                    <option value="2 months">2 mois</option>
                    <option value="3 months">3 mois</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                {/* Exigences supplémentaires */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exigences supplémentaires
                  </label>
                  <textarea
                    value={formData.additional_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_requirements: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Décrivez toute exigence particulière..."
                  />
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminée</option>
                    <option value="archived">Archivée</option>
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex items-center justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSearch(null);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {editingSearch ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
