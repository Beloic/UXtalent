import React, { useMemo } from 'react';
import { ArrowRight, Check, CheckCircle, Star } from 'lucide-react';
import { useRecruiter } from '../hooks/useRecruiter';

export default function RecruiterPricingLanding() {
  const { recruiter } = useRecruiter();

  const plans = useMemo(() => ([
    {
      name: 'Starter',
      price: '19,99€',
      period: '/mois',
      description: 'Pour planifier un recrutement',
      features: [
        "Accès à tous les profils de talents",
        "Filtres de recherche avancés",
        "Contact direct avec les candidats",
        "Algorithme de Matching intelligent",
        "Export des talents en CSV/JSON",
        "Support par email"
      ],
      popular: false,
      cta: 'Commencer',
      linkEnv: 'VITE_STRIPE_STARTER_LINK'
    },
    {
      name: 'Max',
      price: '79€',
      period: '/mois',
      description: 'Pour un recrutement imminent',
      features: [
        '🎯 Sélection de profil sur-mesure par notre équipe',
        "Accès illimité aux profils",
        "Contact direct avec tous les candidats",
        "Support prioritaire",
        "Tableau de bord complet",
        "Algorithme de Matching intelligent",
        "Export des talents en CSV/JSON"
      ],
      popular: true,
      cta: 'Commencer',
      linkEnv: 'VITE_STRIPE_MAX_LINK'
    }
  ]), []);

  const isCurrentPlan = (planName) => {
    if (!recruiter) return false;
    const mapping = { Starter: 'starter', Max: 'max' };
    return mapping[planName] === recruiter.plan_type && recruiter.subscription_status === 'active';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre plan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Accédez immédiatement à l'annuaire de talents et à nos outils de matching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-300 ${
                plan.popular ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" /> Populaire
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

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => {
                  const hasEmoji = /^[🎯🚀⭐🌟💎🔥]/u.test(feature);
                  return (
                    <li key={i} className="flex items-start gap-3">
                      {!hasEmoji && <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}
                      <span className={`text-gray-700 ${hasEmoji ? 'font-semibold' : ''}`}>{feature}</span>
                    </li>
                  );
                })}
              </ul>

              {isCurrentPlan(plan.name) ? (
                <div className="w-full py-4 px-6 rounded-xl font-semibold bg-green-100 text-green-800 border-2 border-green-300 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Plan actuel
                </div>
              ) : (
                <button
                  onClick={() => {
                    const link = import.meta.env[plan.linkEnv];
                    if (link) window.open(link, '_blank');
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-sm text-gray-500">Une question ? Écrivez à hello@loicbernard.com</p>
        </div>
      </div>
    </div>
  );
}


