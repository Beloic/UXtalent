import React from 'react';
import { Check, Star, Users, Briefcase } from 'lucide-react';
import PaymentLinkButton from './PaymentLinkButton';

/**
 * Grille de tarification avec Payment Links Stripe
 */
export const PaymentLinkPricingGrid = ({ userType = 'candidate' }) => {
  const candidatePlans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      period: '',
      description: 'Parfait pour commencer',
      features: [
        'Profil de base',
        'Recherche d\'emplois limitée',
        '3 postulations par mois',
        'Support par email'
      ],
      popular: false,
      cta: 'Commencer gratuitement',
      planType: null, // Pas de paiement pour le plan gratuit
      href: '/register?role=candidate'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '4,99',
      period: '/mois',
      description: 'Pour les candidats ambitieux',
      features: [
        'Profil candidat complet',
        'Badge Premium visible',
        'Mise en avant dans les recherches',
        'Statistiques de profil détaillées',
        'Accès au forum communautaire',
        'Support prioritaire'
      ],
      popular: true,
      cta: 'Choisir Premium',
      planType: 'premium-candidat'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '39',
      period: '/mois',
      description: 'Pour les professionnels expérimentés',
      features: [
        'Tous les avantages Premium',
        'Accès aux offres exclusives',
        'Coaching personnalisé',
        'Support dédié',
        'Mise en avant maximale',
        'Statistiques avancées'
      ],
      popular: false,
      cta: 'Choisir Pro',
      planType: 'pro-candidat'
    }
  ];

  const recruiterPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '19,99',
      period: '/mois',
      description: 'Pour les petites équipes',
      features: [
        'Accès à tous les profils de talents',
        'Filtres de recherche avancés',
        'Contact direct avec les candidats',
        'Tableau Kanban pour organiser les candidats',
        'Algorithme de Matching intelligent',
        'Export des talents en CSV/JSON',
        'Support par email'
      ],
      popular: true,
      cta: 'Choisir Starter',
      planType: 'starter'
    },
    {
      id: 'max',
      name: 'Max',
      price: '79',
      period: '/mois',
      description: 'Pour les grandes entreprises',
      features: [
        '🎯 Sélection de profil sur-mesure par notre équipe',
        'Accès illimité aux profils',
        'Contact direct avec tous les candidats',
        'Support prioritaire',
        'Tableau de bord complet',
        'Tableau Kanban avancé',
        'Algorithme de Matching intelligent',
        'Export des talents en CSV/JSON'
      ],
      popular: false,
      cta: 'Choisir Max',
      planType: 'max'
    }
  ];

  const plans = userType === 'candidate' ? candidatePlans : recruiterPlans;
  const icon = userType === 'candidate' ? Users : Briefcase;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`
            relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
            ${plan.popular 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          {/* Badge populaire */}
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Populaire
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-gray-100">
                  <icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              {/* Prix */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 ml-1">{plan.period}</span>
              </div>
            </div>

            {/* Fonctionnalités */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Bouton d'action */}
            <div className="text-center">
              {plan.planType ? (
                <PaymentLinkButton
                  planType={plan.planType}
                  price={plan.price}
                  className="w-full"
                >
                  {plan.cta}
                </PaymentLinkButton>
              ) : (
                <a
                  href={plan.href}
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentLinkPricingGrid;
