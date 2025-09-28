import React from 'react';
import { Star, Crown } from 'lucide-react';

// Badge Premium simple sans animations
export function SimplePremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg bg-blue-600">
      <Star className="w-3 h-3" />
      Premium
    </span>
  );
}

// Badge Elite simple sans animations
export function SimpleEliteBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
      <Crown className="w-3 h-3" />
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
