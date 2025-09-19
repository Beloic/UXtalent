import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Users, Briefcase, Star, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [selectedTab, setSelectedTab] = useState('candidates');

  const recruiterPlans = [
    {
      name: "Starter",
      price: "19,99€",
      period: "/mois",
      description: "Parfait pour les petites entreprises",
      features: [
        "Accès à tous les profils de talents",
        "Filtres de recherche avancés",
        "Contact direct avec les candidats",
        "Tableau Kanban pour organiser les candidats",
        "Algorithme de Matching intelligent",
        "Export des talents en CSV/JSON",
        "Support par email"
      ],
      popular: false,
      cta: "Commencer gratuitement"
    },
    {
      name: "Max",
      price: "79€",
      period: "/mois",
      description: "Pour les entreprises en croissance",
      features: [
        "Sélection de profil sur-mesure par notre équipe",
        "Accès illimité aux profils",
        "Contact direct avec tous les candidats",
        "Support prioritaire",
        "Tableau de bord complet",
        "Tableau Kanban avancé pour organiser les candidats",
        "Algorithme de Matching intelligent",
        "Export des talents en CSV/JSON"
      ],
      popular: true,
      cta: "Commencer"
    },
    {
      name: "Premium",
      price: "Sur mesure",
      period: "",
      description: "Solutions personnalisées",
      features: [
        "Accès illimité aux profils",
        "Recherche ultra-avancée",
        "Contact direct illimité",
        "Support dédié 24/7",
        "Tableau de bord personnalisé",
        "Tableau Kanban personnalisé pour organiser les candidats",
        "Algorithme de Matching intelligent",
        "Export des talents en CSV/JSON",
        "Intégrations personnalisées",
        "Formation équipe",
        "SLA garantis",
        "Sélection de profil sur-mesure par notre équipe"
      ],
      popular: false,
      cta: "Nous contacter"
    }
  ];

  const candidatePlans = [
    {
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
      popular: false,
      cta: "Créer mon profil"
    },
    {
      name: "Premium",
      price: "4,99€",
      period: "/mois",
      description: "Pour booster votre visibilité",
      features: [
        "Profil candidat complet",
        "Badge Premium visible",
        "Mise en avant dans les recherches",
        "Statistiques de profil détaillées",
        "Accès au forum communautaire",
        "Accès exclusif au Slack communautaire",
        "Support prioritaire"
      ],
      popular: true,
      cta: "Passer Premium"
    },
    {
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
      cta: "Devenir Pro"
    }
  ];

  const currentPlans = selectedTab === 'recruiters' ? recruiterPlans : candidatePlans;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Tarifs simples et transparents
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. 
            Que vous soyez recruteur ou candidat, nous avons une solution pour vous.
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 flex">
              <button
                onClick={() => setSelectedTab('candidates')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                  selectedTab === 'candidates'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-5 h-5" />
                Candidats
              </button>
              <button
                onClick={() => setSelectedTab('recruiters')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                  selectedTab === 'recruiters'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                Recruteurs
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {currentPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
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
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Comment fonctionne l'annulation ?
              </h3>
              <p className="text-gray-600">
                Vous pouvez annuler votre abonnement à tout moment en nous envoyant un email. 
                Aucune pénalité, aucune question posée. La plateforme restera accessible jusqu'à la fin de votre période d'abonnement en cours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des dizaines de professionnels qui font confiance à notre plateforme
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Commencer gratuitement
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Nous contacter
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
