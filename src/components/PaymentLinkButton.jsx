import React from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';

/**
 * Composant bouton pour Payment Links Stripe
 */
const PaymentLinkButton = ({ 
  planType, 
  price, 
  className = '', 
  children,
  disabled = false
}) => {
  // Configuration des Payment Links
  const paymentLinks = {
    'premium-candidat': import.meta.env.VITE_STRIPE_PREMIUM_CANDIDAT_LINK,
    'pro-candidat': import.meta.env.VITE_STRIPE_PRO_CANDIDAT_LINK,
    'starter': import.meta.env.VITE_STRIPE_STARTER_LINK,
    'max': import.meta.env.VITE_STRIPE_MAX_LINK,
  };

  const paymentUrl = paymentLinks[planType];
  
  if (!paymentUrl) {
    console.error(`Payment Link non trouvé pour le plan: ${planType}`);
    return null;
  }

  const handlePayment = () => {
    if (disabled) return;
    
    // Ouvrir le Payment Link dans un nouvel onglet
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium
        transition-all duration-200
        ${disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
        }
        ${className}
      `}
    >
      <CreditCard className="w-4 h-4" />
      <span>{children || `Payer ${price}€`}</span>
      <ExternalLink className="w-3 h-3" />
    </button>
  );
};

export default PaymentLinkButton;
