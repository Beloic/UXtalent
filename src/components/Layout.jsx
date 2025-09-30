import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { Users, UserPlus, LogIn, LogOut, User, Settings, List, MessageSquare, CreditCard, Crown, Star, Briefcase, Shield, Menu, X, Bug, ChevronDown, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { usePermissions } from "../hooks/usePermissions";
import { useRecruiter } from "../hooks/useRecruiter";
import { buildApiUrl } from "../config/api";
import { ConditionalRender } from "./RoleGuard";

export default function Layout({ children, hideFooter = false, hideTopBar = false }) {
  const { user, signOut, isAuthenticated } = useAuth();
  const { isCandidate, isRecruiter, isAdmin, userRole } = usePermissions();
  const { recruiter, getPlanInfo } = useRecruiter();
  const [hasProfile, setHasProfile] = useState(null);
  const [candidatePlan, setCandidatePlan] = useState('free');
  const [userDisplayName, setUserDisplayName] = useState(null);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isSolutionsMobileOpen, setIsSolutionsMobileOpen] = useState(false);
  const solutionsRef = useRef(null);
  const userMenuRef = useRef(null);

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

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target)) {
        setIsSolutionsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        const response = await fetch(buildApiUrl(`/api/candidates/?email=${encodeURIComponent(user.email)}`), {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          // Gérer les deux formats de réponse possibles
          const userProfile = responseData.candidates?.[0] || responseData;
          setHasProfile(!!userProfile);
          // Charger le plan du candidat
          if (userProfile) {
            const plan = userProfile.plan || userProfile.planType || userProfile.plan_type || 'free';
            setCandidatePlan(plan);
            // Charger le nom d'affichage et la photo depuis le profil
            setUserDisplayName(userProfile.name || userProfile.first_name || null);
            setUserProfilePhoto(userProfile.photo || userProfile.profilePhoto || null);
          }
        } else if (response.status === 404) {
          // Si 404, cela signifie qu'il n'y a pas encore de profils dans la base
          setHasProfile(false);
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        setHasProfile(false);
      }
    };

    checkProfile();

    // Écouter les changements de plan depuis d'autres composants
    const handlePlanUpdate = (event) => {
      setCandidatePlan(event.detail.plan || event.detail.planType || 'free');
    };

    // Écouter les changements de nom depuis d'autres composants
    const handleNameUpdate = (event) => {
      setUserDisplayName(event.detail.name || null);
    };

    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('nameUpdated', handleNameUpdate);

    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('nameUpdated', handleNameUpdate);
    };
  }, [isAuthenticated, user]);

  // Redirection automatique supprimée

  // Fonction pour obtenir le badge de plan candidat
  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full shadow-lg">
            <span className="text-blue-200">⭐</span>
            Premium
          </span>
        );
      case 'elite':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg">
            <span className="text-amber-100">⭐</span>
            Elite
          </span>
        );
      default:
        // Ne pas afficher de badge pour le plan gratuit
        return null;
    }
  };

  // Fonction pour obtenir le badge de plan recruteur
  const getRecruiterPlanBadge = () => {
    if (!recruiter) {
      return null;
    }
    
    // Vérifier le statut d'abonnement - ne pas afficher le badge si annulé/suspendu
    if (recruiter.subscription_status !== 'active' && recruiter.subscription_status !== 'trialing') {
      return null;
    }
    
    const planInfo = getPlanInfo();
    const planType = recruiter.plan_type;
    
    switch (planType) {
      case 'starter':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-green-600 text-white rounded-full shadow-lg">
            <span className="text-green-200">🚀</span>
            Starter
          </span>
        );
      case 'max':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg">
            <span className="text-purple-100">⭐</span>
            Max
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg">
            <span className="text-yellow-100">👑</span>
            Premium
          </span>
        );
      case 'custom':
        return null;
      default:
        return null;
    }
  };

  // Fonction générique pour obtenir le badge de plan pour tous les utilisateurs
  const getUserPlanBadge = () => {
    // Pour les recruteurs
    if (isRecruiter && recruiter) {
      return getRecruiterPlanBadge();
    }
    
    // Pour les candidats
    if (isCandidate && candidatePlan && candidatePlan !== 'free') {
      switch (candidatePlan) {
        case 'pro':
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg">
              <span className="text-blue-100">💎</span>
              Pro
            </span>
          );
        case 'premium':
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg">
              <span className="text-yellow-100">👑</span>
              Premium
            </span>
          );
        case 'elite':
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg">
              <span className="text-purple-100">⭐</span>
              Elite
            </span>
          );
        default:
          return null;
      }
    }
    
    return null;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      {!hideTopBar && !isAuthenticated && (
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-xl glass">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-gray-900">
            <motion.div 
              initial={{ rotate: -10, scale: .9 }} 
              animate={{ rotate: 0, scale: 1 }} 
              transition={{ type: 'spring', stiffness: 260, damping: 18 }} 
              className="p-2 rounded-2xl bg-white shadow-xl shadow-blue-200 hover:scale-110 transition-all duration-300"
            >
              <img src="/logo.webp" alt="UX Talent" className="w-8 h-8 rounded-xl" />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl">UX Talent</span>
              <span className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full border border-orange-200">
                Alpha
              </span>
            </div>
          </Link>
          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-gray-600">
            {isAuthenticated ? (
              <>
                {/* Liens principaux pour utilisateurs connectés */}
                <div 
                  className="relative"
                  ref={solutionsRef}
                >
                  <button 
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsSolutionsOpen((v) => !v)}
                  >
                    <List className="w-4 h-4" />
                    Solutions
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSolutionsOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl p-2">
                      <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                          `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'text-blue-600 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Users className="w-4 h-4" />
                        Talents
                      </NavLink>
                      <NavLink 
                        to="/recruiters" 
                        className={({ isActive }) => 
                          `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'text-blue-600 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Briefcase className="w-4 h-4" />
                        Recruteur
                      </NavLink>
                    </div>
                  )}
                </div>
                <a 
                  href="#features" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('features');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Features
                </a>
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
                <div 
                  className="relative"
                  ref={solutionsRef}
                >
                  <button 
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsSolutionsOpen((v) => !v)}
                  >
                    <List className="w-4 h-4" />
                    Solutions
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSolutionsOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl p-2">
                      <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                          `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'text-blue-600 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Users className="w-4 h-4" />
                        Talents
                      </NavLink>
                      <NavLink 
                        to="/recruiters" 
                        className={({ isActive }) => 
                          `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'text-blue-600 bg-blue-50 font-medium' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Briefcase className="w-4 h-4" />
                        Recruteur
                      </NavLink>
                    </div>
                  )}
                </div>
                <a 
                  href="#features" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('features');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Features
                </a>
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
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                
                {/* Bouton pour les candidats */}
                <ConditionalRender role="candidate">
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/my-profile/profile" 
                      className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      onClick={() => {
                        try {
                          console.log('[NAV] Dashboard Candidat cliqué');
                          console.time('[DASHBOARD-CANDIDATE] total');
                        } catch {}
                      }}
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {getUserPlanBadge()}
                  </div>
                </ConditionalRender>
                
                {/* Bouton pour les recruteurs */}
                <ConditionalRender role="recruiter">
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/recruiter-dashboard" 
                      className="inline-flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                      onClick={() => {
                        try {
                          console.log('[NAV] Dashboard Recruteur cliqué');
                          console.time('[DASHBOARD-RECRUITER] total');
                        } catch {}
                      }}
                    >
                      <Users className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {getRecruiterPlanBadge()}
                  </div>
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
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 btn-modern"
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

      {/* Barre de navigation simplifiée pour utilisateurs connectés */}
      {!hideTopBar && isAuthenticated && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <Link to={isCandidate ? "/my-profile" : "/recruiter-dashboard"} className="flex items-center gap-3 font-bold text-gray-900">
              <motion.div 
                initial={{ rotate: -10, scale: .9 }} 
                animate={{ rotate: 0, scale: 1 }} 
                transition={{ type: 'spring', stiffness: 260, damping: 18 }} 
                className="p-2 rounded-xl bg-white shadow-lg shadow-blue-100 hover:scale-105 transition-all duration-300"
              >
                <img src="/logo.webp" alt="UX Talent" className="w-6 h-6 rounded-lg" />
              </motion.div>
              <div className="flex items-center gap-2">
                <span className="text-lg">UX Talent</span>
                <span className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full border border-orange-200">
                  Alpha
                </span>
              </div>
            </Link>
            
            {/* Menu utilisateur avec avatar */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                {userProfilePhoto ? (
                  <img
                    src={userProfilePhoto}
                    alt="Photo de profil"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu déroulant */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {/* En-tête du menu */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {userProfilePhoto ? (
                          <img
                            src={userProfilePhoto}
                            alt="Photo de profil"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userDisplayName || (user.user_metadata?.first_name && user.user_metadata?.last_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : user.email?.split('@')[0]) || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {getUserPlanBadge() && (
                        <div className="mt-2 flex justify-center">
                          {getUserPlanBadge()}
                        </div>
                      )}
                    </div>

                    {/* Options du menu */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                    <div className="rounded-xl border border-gray-200">
                      <button 
                        type="button"
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
                        onClick={() => setIsSolutionsMobileOpen((v) => !v)}
                      >
                        <span className="flex items-center gap-2">
                          <List className="w-5 h-5" />
                          Solutions
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isSolutionsMobileOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isSolutionsMobileOpen && (
                        <div className="px-2 pb-2">
                          <NavLink 
                            to="/" 
                            onClick={() => { setIsMobileMenuOpen(false); setIsSolutionsMobileOpen(false); }}
                            className={({ isActive }) => 
                              `mt-2 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                isActive 
                                  ? 'text-blue-600 bg-blue-50 font-medium' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`
                            }
                          >
                            <Users className="w-5 h-5" />
                            Talents
                          </NavLink>
                          <NavLink 
                            to="/recruiters" 
                            onClick={() => { setIsMobileMenuOpen(false); setIsSolutionsMobileOpen(false); }}
                            className={({ isActive }) => 
                              `mt-2 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                isActive 
                                  ? 'text-blue-600 bg-blue-50 font-medium' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`
                            }
                          >
                            <Briefcase className="w-5 h-5" />
                            Recruteur
                          </NavLink>
                        </div>
                      )}
                    </div>
                    <a 
                      href="#features" 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        const element = document.getElementById('features');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Eye className="w-5 h-5" />
                      Features
                    </a>
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
                    <div className="rounded-xl border border-gray-200">
                      <button 
                        type="button"
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
                        onClick={() => setIsSolutionsMobileOpen((v) => !v)}
                      >
                        <span className="flex items-center gap-2">
                          <List className="w-5 h-5" />
                          Solutions
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isSolutionsMobileOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isSolutionsMobileOpen && (
                        <div className="px-2 pb-2">
                          <Link 
                            to="/" 
                            onClick={() => { setIsMobileMenuOpen(false); setIsSolutionsMobileOpen(false); }}
                            className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          >
                            <Users className="w-5 h-5" />
                            Talents
                          </Link>
                          <Link 
                            to="/recruiters" 
                            onClick={() => { setIsMobileMenuOpen(false); setIsSolutionsMobileOpen(false); }}
                            className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          >
                            <Briefcase className="w-5 h-5" />
                            Recruteur
                          </Link>
                        </div>
                      )}
                    </div>
                    <a 
                      href="#features" 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        const element = document.getElementById('features');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Eye className="w-5 h-5" />
                      Features
                    </a>
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
                          Dashboard
                        </Link>
                        <div className="px-4">
                          {getUserPlanBadge()}
                        </div>
                      </div>
                    </ConditionalRender>
                    
                    {/* Bouton pour les recruteurs */}
                    <ConditionalRender role="recruiter">
                      <div className="space-y-2">
                        <Link 
                          to="/recruiter-dashboard" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200"
                        >
                          <Users className="w-5 h-5" />
                          Dashboard
                        </Link>
                        <div className="px-4">
                          {getRecruiterPlanBadge()}
                        </div>
                      </div>
                    </ConditionalRender>
                    
                    {/* Section utilisateur mobile */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        {userProfilePhoto ? (
                          <img
                            src={userProfilePhoto}
                            alt="Photo de profil"
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userDisplayName || (user.user_metadata?.first_name && user.user_metadata?.last_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : user.email?.split('@')[0]) || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {getUserPlanBadge() && (
                        <div className="mt-2 flex justify-center">
                          {getUserPlanBadge()}
                        </div>
                      )}
                    </div>
                    
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