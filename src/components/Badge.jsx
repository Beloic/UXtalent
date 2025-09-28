import React from "react";
import { Crown, Star, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Badge({ children, variant = "default", animate = false }) {
  const variants = {
    default: "bg-white/80 backdrop-blur-sm text-blue-800 border border-blue-200 shadow-lg",
    premium: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 shadow-lg",
    elite: "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200 shadow-lg"
  };

  const BadgeComponent = animate ? motion.span : 'span';
  const motionProps = animate ? {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <BadgeComponent 
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300 hover:shadow-xl ${variants[variant]}`}
      {...motionProps}
    >
      {children}
    </BadgeComponent>
  );
}

export function PremiumBadge() {
  return (
    <motion.span 
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 text-xs font-bold shadow-xl shadow-yellow-200"
      animate={{
        boxShadow: [
          "0 0 20px rgba(251, 146, 60, 0.3)",
          "0 0 30px rgba(251, 146, 60, 0.6)",
          "0 0 20px rgba(251, 146, 60, 0.3)"
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <span className="text-yellow-100">👑</span>
      </motion.div>
      Premium
    </motion.span>
  );
}

export function ProBadge() {
  return (
    <motion.span 
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 text-xs font-bold shadow-xl shadow-purple-200"
      animate={{
        boxShadow: [
          "0 0 20px rgba(147, 51, 234, 0.3)",
          "0 0 30px rgba(147, 51, 234, 0.6)",
          "0 0 20px rgba(147, 51, 234, 0.3)"
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-purple-100">⭐</span>
      </motion.div>
      Elite
    </motion.span>
  );
}