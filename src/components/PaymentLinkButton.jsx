import React from 'react';

/**
 * Bouton pour rediriger vers les Payment Links Stripe
 */
export default function PaymentLinkButton({ 
  planType, 
  price, 
  className = '', 
  children 
}) {
  // Mapping des types de plans vers les liens Stripe
  const getPaymentLink = (planType) => {
    const links = {
      'premium-candidat': import.meta.env.VITE_STRIPE_PREMIUM_CANDIDAT_LINK,
      'elite-candidat': import.meta.env.VITE_STRIPE_ELITE_CANDIDAT_LINK,
      'starter': import.meta.env.VITE_STRIPE_STARTER_LINK,
      'max': import.meta.env.VITE_STRIPE_MAX_LINK,
    };
    
    return links[planType] || '#';
  };

  const paymentLink = getPaymentLink(planType);

  const handleClick = () => {
    if (paymentLink && paymentLink !== '#') {
      window.open(paymentLink, '_blank');
    } else {
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
    >
      {children}
    </button>
  );
}
