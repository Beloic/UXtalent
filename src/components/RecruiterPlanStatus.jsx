import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Star, CreditCard, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { buildApiUrl } from '../config/api';

export default function RecruiterPlanStatus() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        setError('Session expirée');
        return;
      }

      // Pour l'instant, on simule un plan gratuit par défaut
      // Dans une vraie implémentation, on récupérerait le plan depuis l'API
      setCurrentPlan({
        id: 'free',
        name: 'Gratuit',
        features: [
          'Accès aux profils de base',
          'Contact limité',
          'Support par email'
        ],
        limitations: [
          'Maximum 10 contacts par mois',
          'Pas de mise en avant',
          'Fonctionnalités limitées'
        ]
      });
    } catch (error) {
      console.error('Erreur lors du chargement du plan:', error);
      setError('Erreur lors du chargement du plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement de votre plan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'starter':
        return <Users className="w-6 h-6" />;
      case 'max':
        return <Crown className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'starter':
        return 'from-blue-500 to-blue-600';
      case 'max':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(currentPlan.id)} rounded-xl flex items-center justify-center text-white`}>
          {getPlanIcon(currentPlan.id)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Plan actuel</h3>
          <p className="text-gray-600">{currentPlan.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Fonctionnalités incluses
          </h4>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {currentPlan.limitations && currentPlan.limitations.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Limitations actuelles
            </h4>
            <ul className="space-y-2">
              {currentPlan.limitations.map((limitation, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {currentPlan.id === 'free' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Upgradez votre plan</h4>
          </div>
          <p className="text-blue-700 text-sm">
            Débloquez plus de fonctionnalités et augmentez votre efficacité de recrutement avec nos plans premium.
          </p>
        </div>
      )}
    </motion.div>
  );
}
