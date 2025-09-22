import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, ArrowRight, CreditCard } from "lucide-react";
import { updateCandidatePlan } from "../services/candidatesApi";

export default function PlanManager({ candidate, onPlanUpdate }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(candidate?.planType || 'free');

  // Mettre à jour le plan sélectionné quand le candidat change
  useEffect(() => {
    if (candidate?.planType) {
      console.log('🎯 PlanManager: Mise à jour du plan sélectionné:', candidate.planType);
      setSelectedPlan(candidate.planType);
    }
  }, [candidate?.planType]);

  // Fonction pour obtenir le texte du bouton selon le plan actuel
  const getButtonText = (planId) => {
    if (selectedPlan === planId) {
      return "Plan actuel";
    }
    return `Choisir ${planId === 'free' ? 'Gratuit' : planId === 'premium' ? 'Premium' : 'Pro'}`;
  };

  const plans = [
    {
      id: 'free',
      name: "Gratuit",
      price: "0€",
      period: "",
      description: "Pour commencer votre recherche",
      features: [
        "Profil candidat complet",
        "Visibilité dans l'annuaire",
        "Contact par les recruteurs",
        "Accès au forum communautaire"
      ],
      current: selectedPlan === 'free',
      cta: getButtonText('free')
    },
    {
      id: 'premium',
      name: "Premium",
      price: "7,99€",
      period: "/mois",
      description: "Pour booster votre visibilité",
      features: [
        "Tout du plan Gratuit",
        "Badge Premium visible",
        "Mise en avant dans les recherches",
        "Statistiques de profil détaillées",
        "Support prioritaire",
        "Accès exclusif au Slack communautaire"
      ],
      popular: true,
      current: selectedPlan === 'premium',
      cta: getButtonText('premium')
    },
    {
      id: 'pro',
      name: "Pro",
      price: "39€",
      period: "/mois",
      description: "Pour un maximum de réussite",
      features: [
        "Tout du Premium",
        "Badge Pro exclusif",
        "Mise en avant maximale",
        "Statistiques avancées",
        "Accès aux offres exclusives",
        "Coaching carrière 1-à-1",
        "Support VIP",
        "Formations premium",
        "Réseautage événements",
        "Accès exclusif au Slack communautaire"
      ],
      popular: false,
      current: selectedPlan === 'pro',
      cta: getButtonText('pro')
    }
  ];

  const handlePlanChange = async (planId) => {
    console.log('🔄 Tentative de changement de plan:', { candidate, planId });
    
    if (!candidate?.id) {
      console.error('❌ ID candidat manquant:', candidate);
      alert('Erreur: Profil candidat non trouvé. Veuillez d\'abord créer votre profil.');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 Appel API updateCandidatePlan:', candidate.id, planId);
      const result = await updateCandidatePlan(candidate.id, planId, 1);
      console.log('✅ Résultat API:', result);
      
      setSelectedPlan(planId);
      if (onPlanUpdate) {
        onPlanUpdate(planId);
      }
      
      // Message de confirmation
      const planNames = { free: 'Gratuit', premium: 'Premium', pro: 'Pro' };
      alert(`Plan changé avec succès vers ${planNames[planId]} !`);
      
      // Déclencher un événement pour mettre à jour le badge dans la barre du haut
      console.log('📡 Déclenchement événement planUpdated:', { planType: planId });
      window.dispatchEvent(new CustomEvent('planUpdated', {
        detail: { planType: planId }
      }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du plan:', error);
      console.error('❌ Détails de l\'erreur:', {
        message: error.message,
        candidate: candidate,
        planId: planId
      });
      alert(`Erreur lors de la mise à jour du plan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 -mx-4 px-4 py-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gérer votre plan
          </h2>
          <p className="text-gray-600 mb-6 max-w-8xl mx-auto">
            Choisissez le plan qui correspond à vos besoins et boostez votre visibilité auprès des recruteurs.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Populaire
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xl text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={loading || plan.current}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  plan.current
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-gray-600">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                  Les changements prennent effet immédiatement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Comment fonctionne la mise en avant ?
                </h3>
                <p className="text-gray-600">
                  Les candidats Premium et Pro apparaissent en premier dans les résultats de recherche, 
                  avec des badges visibles pour attirer l'attention des recruteurs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
