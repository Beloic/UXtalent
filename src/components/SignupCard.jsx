import React from "react";
import { Link } from "react-router-dom";
import { Lock, Users, Star, ArrowRight } from "lucide-react";

export default function SignupCard({ hiddenCount }) {
  return (
    <div className="group bg-blue-600 rounded-2xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 text-white relative overflow-hidden">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 text-center">
        {/* Icône principale */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-2xl font-bold mb-4">
          {hiddenCount} talents supplémentaires disponibles
        </h3>

        {/* Description */}
        <p className="text-blue-100 mb-6 text-lg leading-relaxed">
          Accédez à tous les profils de notre communauté exclusive de designers UX/Product.
        </p>

        {/* Avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center justify-center gap-2 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
            <Users className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium">Profils vérifiés</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">Talents premium</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
            <Lock className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium">Accès exclusif</span>
          </div>
        </div>

        {/* Bouton d'inscription */}
        <Link 
          to="/register"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span>Créer un compte gratuit</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Note en bas */}
        <p className="text-blue-200 text-sm mt-4">
          Inscription gratuite • Accès immédiat • Aucun engagement
        </p>
      </div>

      {/* Effet de brillance */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );
}
