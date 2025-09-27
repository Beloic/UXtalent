import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Shield,
  Zap,
  Palette,
  Search,
  BarChart3,
  Building2,
  MessageSquare,
  Mail,
  Play,
  X,
  Eye,
  Users,
  BarChart2
} from 'lucide-react';

export default function RecruiterLandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const phrases = [
    "UX Talent : des designers UX/UI triés sur le volet.",
    "Trouvez des talents UX/UI validés par des experts.",
    "Le vivier de designers UX/UI de confiance.",
    "Des profils UX/UI vérifiés, prêts pour vos projets."
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Données des screenshots (visuels recruteurs d'origine)
  const screenshots = [
    "141shots_so.webp",
    "462shots_so.webp"
  ];

  const screenshotDescriptions = [
    {
      title: "Annuaire des Talents",
      description: "Explorez notre vivier de designers UX/UI pré-sélectionnés et vérifiés par nos experts"
    },
    {
      title: "Recherche et Filtres Avancés",
      description: "Trouvez rapidement les profils qui correspondent à vos critères avec nos outils de recherche intelligents"
    }
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section - Version Professionnelle */}
      <section className="relative overflow-hidden bg-gray-50">
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Bouton de basculement */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-medium"
              >
                <Palette className="w-4 h-4" />
                Vous êtes designer ? Rejoignez notre vivier de talents
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Trouvez vos talents 
              <span className="text-green-600"> UX UI</span>
            </h1>
            
            <div className="mb-8 max-w-4xl mx-auto px-4 sm:px-0 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                  className="text-lg sm:text-xl text-gray-600 leading-relaxed text-center"
                >
                  {phrases[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTA Principal */}
            <div className="flex justify-center mb-12">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200"
              >
                <Building2 className="w-5 h-5" />
                Accéder au vivier de talents
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Social Proof sobre */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "https://i.pravatar.cc/150?img=11",
                    "https://i.pravatar.cc/150?img=13",
                    "https://i.pravatar.cc/150?img=15",
                    "https://i.pravatar.cc/150?img=17",
                    "https://i.pravatar.cc/150?img=19"
                  ].map((avatar, i) => (
                    <img 
                      key={i} 
                      src={avatar} 
                      alt={`Profil recruteur ${i + 1} utilisant la plateforme UX Talent`}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-sm">Communauté grandissante</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm">Talents vérifiés</span>
              </div>
            </div>

            {/* Stats professionnelles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">24</div>
                <div className="text-gray-900 font-semibold">Designers inscrits</div>
                <div className="text-gray-500 text-sm mt-1">Communauté totale</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                <div className="text-gray-900 font-semibold">Start-ups partenaires</div>
                <div className="text-gray-500 text-sm mt-1">Entreprises de confiance</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">7</div>
                <div className="text-gray-900 font-semibold">Offres d'emploi actives</div>
                <div className="text-gray-500 text-sm mt-1">Opportunités disponibles</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Réalité du Marché - Version Recruteur */}
      <section className="relative py-20 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-20 h-20 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Header avec meilleur spacing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-gray-900">Un marché très </span><span className="text-blue-600">concurrentiel</span>
            </h2>
          </motion.div>

          {/* Section explicative restructurée */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Problèmes à gauche */}
                <div className="space-y-6">
                  {[
                    {
                      icon: "📊",
                      title: "Saturation du marché",
                      description: "Une moyenne de plus de 200 candidats par poste dès le lendemain de la publication",
                      color: "slate"
                    },
                    {
                      icon: "🧠",
                      title: "Incertitude du marché et IA", 
                      description: "Volatilité économique et automatisation accrue complexifient l'embauche et la visibilité des profils",
                      color: "green"
                    },
                    {
                      icon: "🤝",
                      title: "Importance cruciale du réseau",
                      description: "80% des emplois ne sont jamais publiés et se font par recommandation",
                      color: "emerald"
                    }
                  ].map((problem, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        problem.color === 'slate' ? 'bg-slate-100' :
                        problem.color === 'green' ? 'bg-green-100' : 'bg-emerald-100'
                      }`}>
                        {problem.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{problem.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{problem.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Solution à droite */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-bold mb-3">
                        Notre solution : La validation par l'expertise
                      </h4>
                    </div>
                    
                    <p className="text-green-100 text-lg leading-relaxed mb-6">
                      Notre comité d'experts UX/UI seniors <strong className="text-white">valide chaque profil</strong> selon des critères transparents et objectifs. 
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        "✅ Évaluation par des designers seniors",
                        "✅ Critères transparents et équitables"
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3 text-green-100"
                        >
                          <span className="text-green-300 font-bold">{benefit.split(' ')[0]}</span>
                          <span>{benefit.substring(2)}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      viewport={{ once: true }}
                      className="mt-8 pt-6 border-t border-white/20"
                    >
                      <div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
                        <Shield className="w-5 h-5" />
                        <span>Validation par notre comité d'experts</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Éléments décoratifs */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-200 rounded-full opacity-60 animate-float"></div>
                  <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-emerald-200 rounded-full opacity-40 animate-float" style={{animationDelay: '1s'}}></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Screenshots simplifiée (identique à la page candidat) */}
      <section id="features" className="relative py-24 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header adapté recruteurs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Des talents disponible 
              <span className="text-green-600">immédiatement</span>
            </h2>
          </motion.div>

          {/* Carousel simplifié */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 overflow-hidden max-w-3xl mx-auto">
              <div>
                <div className="relative">
                  <div className="bg-gray-100 rounded-t-lg p-2 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1 bg-white rounded px-2 py-1 ml-2 text-xs text-gray-500">
                        uxtalent.fr/{currentScreenshot === 0 ? 'talents' : currentScreenshot === 1 ? 'jobs' : 'analytics'}
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-b-lg shadow-lg overflow-hidden min-h-[330px] lg:min-h-[385px] group">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentScreenshot}
                        initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative h-full"
                      >
                        <img
                          src={`/screenshots/${screenshots[currentScreenshot]}`}
                          alt={`${screenshotDescriptions[currentScreenshot].title} - ${screenshotDescriptions[currentScreenshot].description}`}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Tooltip bas */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center opacity-0 group-hover:opacity-100 pb-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/50 max-w-xs mx-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="flex items-start gap-2 mb-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {screenshotDescriptions[currentScreenshot].title}
                          </h4>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {screenshotDescriptions[currentScreenshot].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Flèches */}
                  <button
                    onClick={() => setCurrentScreenshot((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center group"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-700 rotate-180 group-hover:text-green-600 transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentScreenshot((prev) => (prev + 1) % screenshots.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center group"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-green-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tarification */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Tarification transparente
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Choisissez le plan qui correspond à vos besoins de recrutement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plan Starter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Pour planifier un recrutement</p>
                <div className="text-3xl font-bold text-gray-900 mb-4">19,99€<span className="text-lg">/mois</span></div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Accès à tous les profils de talents</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Filtres de recherche avancés</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Contact direct avec les candidats</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Dashboard de matching avec scores de compatibilité</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Algorithme de Matching intelligent</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Export des talents en CSV/JSON</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Support par email</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Commencer gratuitement
                </Link>
              </motion.div>

              {/* Plan Max */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-green-600 rounded-2xl p-8 text-white relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Populaire
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Max</h3>
                <p className="text-green-100 mb-4">Pour un recrutement imminent</p>
                <div className="text-3xl font-bold mb-4">79€<span className="text-lg">/mois</span></div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>🎯 Sélection de profil sur-mesure par notre équipe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Accès illimité aux profils</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Contact direct avec tous les candidats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Tableau de bord complet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Analyse avancée de compatibilité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Algorithme de Matching intelligent</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Export des talents en CSV/JSON</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Export des données</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Commencer
                </Link>
              </motion.div>

              {/* Plan Premium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-600 mb-4">Solutions personnalisées</p>
                <div className="text-3xl font-bold text-gray-900 mb-4">Sur mesure</div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Accès illimité aux profils</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Recherche ultra-avancée</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Contact direct illimité</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Support dédié 24/7</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Tableau de bord personnalisé</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Algorithme de Matching intelligent</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Export des talents en CSV/JSON</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Intégrations personnalisées</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Formation équipe</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>SLA garantis</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Nous contacter
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à trouver vos talents UX UI ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Rejoignez notre communauté de recruteurs qui font confiance à UX Talent 
              pour leurs recrutements de designers.
            </p>
            
            {/* CTA Principal */}
            <div className="mb-8">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-green-600 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
              >
                <Building2 className="w-6 h-6" />
                Accéder au vivier de talents
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">UX Talent</h3>
              <p className="text-gray-400 mb-4">
                La plateforme qui révolutionne le recrutement UX/UI Design en France.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">UX</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">UI</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recruteurs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Rechercher des talents</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Designers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Découvrir la plateforme</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">S'inscrire</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Voir les profils</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:hello@loicbernard.com" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 UX Talent. Tous droits réservés. | <Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link> | <Link to="/politique-confidentialite" className="hover:text-white">Politique de confidentialité</Link></p>
          </div>
        </div>
      </footer>

      {/* Modal Vidéo */}
      {showVideoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-2xl max-w-4xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Découvrez UX Talent en 2 minutes</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Vidéo de démonstration</p>
                <p className="text-sm text-gray-500">(À remplacer par votre vraie vidéo)</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Email */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-xl shadow-lg z-50"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Merci ! Vous recevrez nos conseils par email.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
