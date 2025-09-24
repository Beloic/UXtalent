import React from "react";
import { Crown, Star } from "lucide-react";

export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    premium: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200",
    elite: "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 px-3 py-1.5 text-xs font-bold">
      <Crown className="w-3 h-3" />
      Premium
    </span>
  );
}

export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200 px-3 py-1.5 text-xs font-bold">
      <Star className="w-3 h-3" />
      Elite
    </span>
  );
}