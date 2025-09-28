import React from 'react';
import { Star, Crown } from 'lucide-react';

// Badge Premium simple sans animations - style cohérent avec le menu déroulant
export function SimplePremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg">
      <span className="text-yellow-100">👑</span>
      Premium
    </span>
  );
}

// Badge Elite simple sans animations - style cohérent avec le menu déroulant
export function SimpleEliteBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg">
      <span className="text-purple-100">⭐</span>
      Elite
    </span>
  );
}

// Badge générique pour les deux plans
export function SimplePlanBadge({ planType }) {
  if (planType === 'premium') {
    return <SimplePremiumBadge />;
  }
  if (planType === 'elite') {
    return <SimpleEliteBadge />;
  }
  return null;
}
