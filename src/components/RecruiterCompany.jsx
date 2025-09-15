import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Save, 
  Edit, 
  MapPin, 
  Users, 
  Globe, 
  Linkedin, 
  Heart,
  CheckCircle,
  Plus,
  X,
  Briefcase,
  Mail,
  ExternalLink,
  DollarSign,
  Languages,
  Camera,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RecruiterCompany() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    company_description: '',
    company_size: '',
    company_industry: '',
    company_location: '',
    company_website: '',
    company_linkedin: '',
    company_values: '',
    company_culture: '',
    benefits: [],
    work_environment: '',
    growth_opportunities: ''
  });

  // Charger les informations de l'entreprise
  const loadCompany = async () => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch('http://localhost:3001/api/recruiter/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        if (data) {
          setFormData({
            company_name: data.company_name || '',
            company_description: data.company_description || '',
            company_size: data.company_size || '',
            company_industry: data.company_industry || '',
            company_location: data.company_location || '',
            company_website: data.company_website || '',
            company_linkedin: data.company_linkedin || '',
            company_values: data.company_values || '',
            company_culture: data.company_culture || '',
            benefits: data.benefits || [],
            work_environment: data.work_environment || '',
            growth_opportunities: data.growth_opportunities || ''
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Erreur API:', response.status, errorText);
        setMessage(`❌ Erreur lors du chargement des informations (${response.status})`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'entreprise:', error);
      setMessage(`❌ Erreur lors du chargement des informations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sauvegarder les informations de l'entreprise
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch('http://localhost:3001/api/recruiter/company', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 2000);
      } else {
        setMessage('❌ Erreur lors de la sauvegarde');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage('❌ Erreur lors de la sauvegarde');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Ajouter un avantage
  const addBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits.includes(currentBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }));
      setCurrentBenefit("");
    }
  };

  // Supprimer un avantage
  const removeBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  useEffect(() => {
    loadCompany();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des informations...</h3>
        <p className="text-gray-600">Récupération des informations de votre entreprise</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-12 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 text-center shadow-xl border border-gray-200"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Informations sauvegardées avec succès !
          </h1>
          <p className="text-gray-600 mb-6">
            Les informations de votre entreprise ont été mises à jour.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </motion.div>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Informations de base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: TechCorp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  name="company_industry"
                  value={formData.company_industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Technologie, Finance, Santé"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de l'entreprise
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Sélectionner une taille</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201-500">201-500 employés</option>
                  <option value="500+">500+ employés</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="company_location"
                  value={formData.company_location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Paris, France"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              À propos de l'entreprise
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'entreprise *
              </label>
              <textarea
                name="company_description"
                value={formData.company_description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Décrivez votre entreprise, sa mission, ses valeurs..."
              />
            </div>
          </div>

          {/* Contact et liens */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Contact et liens
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://www.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="company_linkedin"
                  value={formData.company_linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://linkedin.com/company/example"
                />
              </div>
            </div>
          </div>

          {/* Valeurs et culture */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Valeurs et culture
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeurs de l'entreprise
                </label>
                <textarea
                  name="company_values"
                  value={formData.company_values}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Décrivez les valeurs importantes pour votre entreprise..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Culture d'entreprise
                </label>
                <textarea
                  name="company_culture"
                  value={formData.company_culture}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Décrivez l'ambiance et la culture de votre entreprise..."
                />
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Avantages offerts
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentBenefit}
                  onChange={(e) => setCurrentBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ajouter un avantage (ex: Mutuelle)"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeBenefit(benefit)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Environnement de travail */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Environnement de travail
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environnement de travail
                </label>
                <textarea
                  name="work_environment"
                  value={formData.work_environment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Décrivez l'environnement de travail, les outils utilisés..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opportunités de croissance
                </label>
                <textarea
                  name="growth_opportunities"
                  value={formData.growth_opportunities}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Décrivez les possibilités d'évolution et de formation..."
                />
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sauvegarde en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Sauvegarder les informations
                </div>
              )}
            </button>
          </div>
        </form>
    </div>
  );
}