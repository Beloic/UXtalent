import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  User, 
  Briefcase, 
  MapPin, 
  Globe, 
  Mail, 
  ExternalLink, 
  DollarSign, 
  Languages,
  Camera,
  ArrowLeft,
  CheckCircle,
  UserPlus,
  LogIn
} from "lucide-react";
import { motion } from "framer-motion";

export default function AddProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    location: "",
    remote: "hybrid",
    experience: "Mid",
    skills: [],
    bio: "",
    portfolio: "",
    linkedin: "",
    email: "",
    salary: "",
    languages: [],
    photo: ""
  });
  const [currentSkill, setCurrentSkill] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Rediriger vers la connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pré-remplir les informations de l'utilisateur connecté
  useEffect(() => {
    if (user && user.user_metadata) {
      setFormData(prev => ({
        ...prev,
        name: `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim(),
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    if (currentLanguage.trim() && !formData.languages.includes(currentLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, currentLanguage.trim()]
      }));
      setCurrentLanguage("");
    }
  };

  const removeLanguage = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://ux-jobs-pro-backend.onrender.com/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/candidates');
        }, 2000);
      } else {
        console.error('Erreur lors de l\'ajout du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 text-center shadow-xl border border-gray-200"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profil ajouté avec succès !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre profil a été ajouté au vivier de talents. Vous allez être redirigé vers la liste des candidats.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button 
          onClick={() => navigate('/candidates')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajouter mon profil
          </h1>
          <p className="text-gray-600">
            Rejoignez notre vivier de talents UX/Product Design et faites-vous découvrir par les entreprises.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations personnelles */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Marie Dubois"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du poste *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Senior UX Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Paris, France"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'expérience *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="Junior">Junior (0-2 ans)</option>
                  <option value="Mid">Mid (2-5 ans)</option>
                  <option value="Senior">Senior (5+ ans)</option>
                  <option value="Lead">Lead (8+ ans)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Remote et Contact */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Préférences de travail
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de travail *
                </label>
                <select
                  name="remote"
                  value={formData.remote}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="remote">Full remote</option>
                  <option value="hybrid">Hybride</option>
                  <option value="onsite">Sur site</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salaire souhaité
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: 50-65k€"
                />
              </div>
            </div>
          </div>

          {/* Compétences */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Compétences
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ajouter une compétence (ex: Figma)"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Langues */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Langues
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ajouter une langue (ex: Français)"
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              À propos
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présentation *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Décrivez votre parcours, vos spécialités et ce qui vous passionne dans le design..."
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="https://linkedin.com/in/votre-profil"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="https://votre-portfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo de profil
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de votre photo
              </label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="https://exemple.com/photo.jpg"
              />
              <p className="text-sm text-gray-500 mt-2">
                Optionnel. Si vous ne fournissez pas de photo, vos initiales seront affichées.
              </p>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ajout en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Ajouter mon profil
                </div>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
