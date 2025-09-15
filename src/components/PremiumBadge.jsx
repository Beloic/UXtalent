import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';

const PremiumBadge = ({ plan, size = 'default' }) => {
  if (!plan || plan === 'free') return null;

  const badgeConfig = {
    premium: {
      icon: Star,
      text: 'Premium',
      gradient: 'from-yellow-400 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      shadow: 'shadow-yellow-100'
    },
    pro: {
      icon: Crown,
      text: 'Pro',
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-600',
      shadow: 'shadow-purple-100'
    }
  };

  const config = badgeConfig[plan];
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizeClasses = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.1 
      }}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        bg-gradient-to-r ${config.bgGradient}
        border ${config.borderColor}
        ${config.textColor}
        ${sizeClasses[size]}
        ${config.shadow}
        backdrop-blur-sm
        relative overflow-hidden
      `}
    >
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
      
      <Icon className={`${iconSizeClasses[size]} ${config.iconColor} relative z-10`} />
      <span className="relative z-10 font-bold">{config.text}</span>
      
      {/* Effet de lueur */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-10 blur-sm`}></div>
    </motion.div>
  );
};

export default PremiumBadge;
