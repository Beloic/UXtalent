import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CandidateLandingPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-10 text-center"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Prévisualisation Landing Candidat</h1>
        <p className="text-gray-600 mb-8">Cette page sert d'exemple pour tester le rendu UI de la landing dédiée aux candidats avec le nouveau design.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all">
            Retour à l'accueil
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


