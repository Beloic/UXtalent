import React from 'react';
import { AlertCircle, CreditCard, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Composant pour bloquer l'accès aux fonctionnalités spécifiques des recruteurs avec abonnement annulé
export const RecruiterSubscriptionGuard = ({ 
  children, 
  recruiter,
  showError = true 
}) => {
  // Vérifier si l'abonnement est annulé ou suspendu
  const isSubscriptionCancelled = recruiter?.subscription_status === 'cancelled' || 
                                  recruiter?.subscription_status === 'expired' ||
                                  recruiter?.status === 'suspended';
  
  // Si l'abonnement est actif, afficher le contenu normal
  if (recruiter?.subscription_status === 'active' && recruiter?.status !== 'suspended') {
    return children;
  }
  
  // Si pas d'erreur à afficher, retourner null
  if (!showError) {
    return null;
  }
  
  // Afficher l'écran de blocage
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès suspendu
          </h1>
          <p className="text-gray-600 mb-4">
            Votre abonnement a été annulé. Vous n'avez plus accès aux fonctionnalités premium.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-semibold">Abonnement annulé</span>
          </div>
          <p className="text-red-700 text-sm">
            Statut: {recruiter?.subscription_status === 'cancelled' ? 'Annulé' : 
                     recruiter?.subscription_status === 'expired' ? 'Expiré' : 
                     'Suspendu'}
          </p>
          {recruiter?.subscription_end_date && (
            <p className="text-red-600 text-xs mt-1">
              Fin d'accès: {new Date(recruiter.subscription_end_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Link
            to="/pricing"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Renouveler mon abonnement
          </Link>
          
          <a
            href="mailto:hello@loicbernard.com"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Contacter le support
          </a>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Vous pouvez toujours consulter votre profil de base, mais les fonctionnalités premium sont désactivées.
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant pour masquer/afficher des éléments selon le statut d'abonnement
export const SubscriptionBasedContent = ({ 
  children, 
  recruiter,
  fallback = null 
}) => {
  const isSubscriptionCancelled = recruiter?.subscription_status === 'cancelled' || 
                                  recruiter?.subscription_status === 'expired' ||
                                  recruiter?.status === 'suspended';
  
  if (isSubscriptionCancelled) {
    return fallback;
  }
  
  return children;
};

// Hook pour vérifier le statut d'abonnement
export const useSubscriptionStatus = (recruiter) => {
  const isSubscriptionCancelled = recruiter?.subscription_status === 'cancelled' || 
                                  recruiter?.subscription_status === 'expired' ||
                                  recruiter?.status === 'suspended';
  
  const isSubscriptionActive = recruiter?.subscription_status === 'active';
  
  const isSubscriptionTrial = recruiter?.subscription_status === 'trial';
  
  return {
    isSubscriptionCancelled,
    isSubscriptionActive,
    isSubscriptionTrial,
    subscriptionStatus: recruiter?.subscription_status,
    accountStatus: recruiter?.status
  };
};
