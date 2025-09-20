import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Users, Briefcase, Star, ArrowRight } from "lucide-react";
import PaymentLinkPricingGrid from "../components/PaymentLinkPricing";

export default function PricingPage() {
  const [selectedTab, setSelectedTab] = useState('candidates');

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
          className="max-w-6xl mx-auto"
        >
          <PaymentLinkPricingGrid userType={selectedTab} />
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
              <button 
                onClick={() => window.open('/register?role=candidate', '_blank')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Commencer gratuitement
              </button>
              <button 
                onClick={() => window.open('mailto:contact@ux-jobs-pro.com', '_blank')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Nous contacter
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
