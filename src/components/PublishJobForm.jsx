import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Globe, 
  Clock, 
  DollarSign, 
  FileText, 
  Tag,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Target,
  Users,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AutocompleteInput from './AutocompleteInput';
import { jobTitleSuggestions, locationSuggestions, salaryRanges } from '../data/suggestions';

export default function PublishJobForm({ onJobPublished }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    remote: 'onsite',
    type: 'CDI',
    seniority: 'Mid',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Configuration des étapes
  const steps = [
    {
      id: 1,
      title: 'Informations de base',
      description: 'Titre, entreprise et localisation',
      icon: Briefcase
    },
    {
      id: 2,
      title: 'Détails du poste',
      description: 'Type de contrat et expérience',
      icon: Target
    },
    {
      id: 3,
      title: 'Description',
      description: 'Missions et compétences',
      icon: FileText
    },
    {
      id: 4,
      title: 'Avantages',
      description: 'Bénéfices et tags',
      icon: Star
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Vérifier si l'étape est complétée (passée à l'étape suivante)
  const isStepCompleted = (stepNumber) => {
    return currentStep > stepNumber;
  };

  // Vérifier si l'étape actuelle est valide pour permettre de passer à la suivante
  const isStepValid = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.title && formData.company && formData.location;
      case 2:
        return formData.type && formData.seniority && formData.salary;
      case 3:
        return formData.description && formData.requirements;
      case 4:
        return formData.benefits && formData.tags.length > 0;
      default:
        return false;
    }
  };

  // Calculer le pourcentage de completion
  const getCompletionPercentage = () => {
    const completedSteps = steps.filter(step => isStepCompleted(step.id)).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Récupérer le token d'authentification
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        setMessage('❌ Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      // Envoyer l'offre à l'API
      const response = await fetch('https://ux-jobs-pro-backend.onrender.com/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newJob = await response.json();
        setMessage('✅ Offre publiée avec succès ! Elle est maintenant visible sur la plateforme.');
        setTimeout(() => {
          setMessage('');
          // Réinitialiser le formulaire
          setFormData({
            title: '',
            company: '',
            location: '',
            remote: 'onsite',
            type: 'CDI',
            seniority: 'Mid',
            salary: '',
            description: '',
            requirements: '',
            benefits: '',
            tags: []
          });
          if (onJobPublished) {
            onJobPublished(newJob);
          }
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        setMessage(`❌ Erreur lors de la publication: ${errorData.error || 'Erreur inconnue'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la publication de l\'offre');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.company && formData.location && formData.description && formData.requirements && formData.benefits && formData.tags.length > 0 && formData.salary;

  // Composant pour rendre le contenu de chaque étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Informations de base</h3>
              <p className="text-gray-600">Commençons par les informations essentielles de votre offre</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Titre du poste *
                </label>
                <AutocompleteInput
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="ex: UX Designer Senior"
                  suggestions={jobTitleSuggestions}
                  icon={Briefcase}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Entreprise *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="ex: TechCorp"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Localisation *
                </label>
                <AutocompleteInput
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="ex: Paris, France"
                  suggestions={locationSuggestions}
                  icon={MapPin}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Type de travail
                </label>
                <select
                  name="remote"
                  value={formData.remote}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="onsite">Sur site</option>
                  <option value="hybrid">Hybride</option>
                  <option value="remote">100% Remote</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Détails du poste</h3>
              <p className="text-gray-600">Précisez le type de contrat et le niveau d'expérience recherché</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Type de contrat
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Stage">Stage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Niveau d'expérience
                </label>
                <select
                  name="seniority"
                  value={formData.seniority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Salaire *
                </label>
                <select
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  {salaryRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Description du poste</h3>
              <p className="text-gray-600">Décrivez les missions et les compétences requises</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description du poste *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez le poste, les missions principales, l'environnement de travail..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Compétences requises *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Listez les compétences techniques et soft skills requises..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Avantages et tags</h3>
              <p className="text-gray-600">Ajoutez les bénéfices et tags pour rendre votre offre attractive</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Avantages et bénéfices *
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="Télétravail, mutuelle, tickets restaurant, formation..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Publier une offre d'emploi</h2>
          </div>

        {/* Étapes */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : isCompleted 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  <div className={`text-xs mt-1 ${isActive ? 'text-blue-500' : isCompleted ? 'text-blue-500' : 'text-gray-400'}`}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isStepValid(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isFormValid && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  Publier l'offre
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mx-8 mb-8 p-4 rounded-xl text-sm font-medium ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes('✅') && <CheckCircle className="w-4 h-4" />}
            {message.includes('❌') && <AlertCircle className="w-4 h-4" />}
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
