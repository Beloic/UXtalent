import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Users, UserPlus, LogIn, LogOut, User, Settings, List, MessageSquare, CreditCard, Crown, Star, Briefcase, Shield, Menu, X, Bug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { usePermissions } from "../hooks/usePermissions";
import { buildApiUrl } from "../config/api";
import { ConditionalRender } from "./RoleGuard";

export default function Layout({ children, hideFooter = false, hideTopBar = false }) {
  const { user, signOut, isAuthenticated } = useAuth();
  const { isCandidate, isRecruiter, isAdmin, userRole } = usePermissions();
  const [hasProfile, setHasProfile] = useState(null);
  const [candidatePlan, setCandidatePlan] = useState('free');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Charger le chatbot Crisp
  useEffect(() => {
    // Script Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "c04f638e-303e-4e79-bcee-e6a013024480";
    
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.getElementsByTagName("head")[0].appendChild(script);

    // Cleanup function pour supprimer le script si le composant est démonté
    return () => {
      const crispScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (crispScript) {
        crispScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated || !isCandidate) {
        setHasProfile(true); // Les recruteurs et non-connectés peuvent toujours voir la liste
        return;
      }

      try {
        // Récupérer directement le profil du candidat par email
        const response = await fetch(buildApiUrl(`/api/candidates/profile/${encodeURIComponent(user.email)}`), {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (response.ok) {
          const userProfile = await response.json();
          setHasProfile(!!userProfile);
          // Charger le plan du candidat
          if (userProfile) {
            console.log('🎯 Profil candidat chargé dans Layout:', { planType: userProfile.planType, isFeatured: userProfile.isFeatured });
            setCandidatePlan(userProfile.planType || 'free');
          }
        } else if (response.status === 404) {
          // Si 404, cela signifie qu'il n'y a pas encore de profils dans la base
          setHasProfile(false);
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du profil:', error);
        setHasProfile(false);
      }
    };

    checkProfile();

    // Écouter les changements de plan depuis d'autres composants
    const handlePlanUpdate = (event) => {
      console.log('🎯 Événement planUpdated reçu:', event.detail);
      setCandidatePlan(event.detail.planType);
    };

    window.addEventListener('planUpdated', handlePlanUpdate);

    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
    };
  }, [isAuthenticated, user]);

  // Fonction pour obtenir le badge de plan
  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full shadow-lg">
            <span className="text-blue-200">⭐</span>
            Premium
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg">
            <span className="text-amber-100">⭐</span>
            Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            Gratuit
          </span>
        );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      {!hideTopBar && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 font-bold text-gray-900">
            <motion.div 
              initial={{ rotate: -10, scale: .9 }} 
              animate={{ rotate: 0, scale: 1 }} 
              transition={{ type: 'spring', stiffness: 260, damping: 18 }} 
              className="p-3 rounded-2xl bg-blue-600 shadow-lg"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl">UX Talent</span>
              <span className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full border border-orange-200">
                Alpha
              </span>
            </div>
          </Link>
          {/* Navigation Desktop */}
          <nav className="ml-8 hidden md:flex items-center gap-6 text-gray-600">
            {isAuthenticated ? (
              <>
                <NavLink 
                  to="/candidates" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <List className="w-4 h-4" />
                  Talents
                </NavLink>
                <NavLink 
                  to="/jobs" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <Briefcase className="w-4 h-4" />
                  Offres
                </NavLink>
                <NavLink 
                  to="/forum" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <MessageSquare className="w-4 h-4" />
                  Forum
                </NavLink>
                <NavLink 
                  to="/pricing" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <CreditCard className="w-4 h-4" />
                  Tarifs
                </NavLink>
                {/* Lien Admin supprimé */}
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <List className="w-4 h-4" />
                  Talents
                </Link>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Briefcase className="w-4 h-4" />
                  Offres
                </Link>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  Forum
                </Link>
                <Link 
                  to="/pricing" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <CreditCard className="w-4 h-4" />
                  Tarifs
                </Link>
              </>
            )}
          </nav>
          
          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          {/* Actions Desktop */}
          <div className="ml-auto hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                
                {/* Bouton pour les candidats */}
                <ConditionalRender role="candidate">
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/my-profile/profile" 
                      className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    {getPlanBadge(candidatePlan)}
                  </div>
                </ConditionalRender>
                
                {/* Bouton pour les recruteurs */}
                <ConditionalRender role="recruiter">
                  <Link 
                    to="/recruiter-dashboard" 
                    className="inline-flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                  >
                    <Users className="w-4 h-4" />
                    Dashboard
                  </Link>
                </ConditionalRender>
                
                
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/recruiters" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  Recruteurs
                </Link>
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Mobile */}
              <nav className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <NavLink 
                      to="/candidates" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                    >
                      <List className="w-5 h-5" />
                      Talents
                    </NavLink>
                    <NavLink 
                      to="/jobs" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Briefcase className="w-5 h-5" />
                      Offres
                    </NavLink>
                    <NavLink 
                      to="/forum" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                    >
                      <MessageSquare className="w-5 h-5" />
                      Forum
                    </NavLink>
                    <NavLink 
                      to="/pricing" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                    >
                      <CreditCard className="w-5 h-5" />
                      Tarifs
                    </NavLink>
                    {/* Lien Admin mobile supprimé */}
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <List className="w-5 h-5" />
                      Talents
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Briefcase className="w-5 h-5" />
                      Offres
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Forum
                    </Link>
                    <Link 
                      to="/pricing" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <CreditCard className="w-5 h-5" />
                      Tarifs
                    </Link>
                  </>
                )}
              </nav>

              {/* Actions Mobile */}
              <div className="border-t border-gray-200 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* Bouton pour les candidats */}
                    <ConditionalRender role="candidate">
                      <div className="space-y-2">
                        <Link 
                          to="/my-profile/profile" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                          <User className="w-5 h-5" />
                          Mon profil
                        </Link>
                        <div className="px-4">
                          {getPlanBadge(candidatePlan)}
                        </div>
                      </div>
                    </ConditionalRender>
                    
                    {/* Bouton pour les recruteurs */}
                    <ConditionalRender role="recruiter">
                      <Link 
                        to="/recruiter-dashboard" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                      >
                        <Users className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </ConditionalRender>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/recruiters" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                    >
                      <Users className="w-5 h-5" />
                      Recruteurs
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      Connexion
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
                    >
                      <UserPlus className="w-5 h-5" />
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>{children}</main>

      {!hideFooter && (
        <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">© {new Date().getFullYear()} UX Talent</p>
                <p className="text-sm text-gray-500">Fait avec ❤️ pour connecter les talents</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-center sm:text-right">
              <p className="font-medium mb-1">Annuaire de talents UX/Product Design</p>
              <p className="opacity-75">UI moderne • Tailwind CSS • Framer Motion</p>
            </div>
          </div>
        </div>
      </footer>
      )}
      
    </div>
  );
}