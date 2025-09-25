import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Award,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Play,
  Calendar,
  Eye,
  Palette,
  Code,
  UserCheck,
  X,
  Bell,
  Search,
  BarChart2
} from 'lucide-react';

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const phrases = [
    "Trop de profils se perdent dans la masse — le tien mérite d'être remarqué.",
    "Dans un marché saturé, on t'aide à sortir du lot.",
    "Le marché déborde, mais nous te faisons une place de choix."
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Données des screenshots
  const screenshots = [
    "141shots_so.png",
    "462shots_so.png", 
    "852shots_so.png"
  ];

  const screenshotDescriptions = [
    {
      title: "Annuaire des Talents",
      description: "Votre profil est mis en avant au sein d'un vivier de talents"
    },
    {
      title: "Offres d'Emploi Exclusives",
      description: "Accédez à des offres d'emploi vérifiées et exclusives, publiées par des entreprises partenaires de qualité."
    },
    {
      title: "Statistiques et Analytics",
      description: "Statistiques détaillées de votre profil"
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -top-8 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
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
                to="/recruiters"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline transition-all duration-200 font-medium"
              >
                <Users className="w-4 h-4" />
                Vous êtes recruteur ? Découvrez notre plateforme
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Tu cherches un job en 
              <span className="text-blue-600"> UX UI ?</span>
            </h1>
            
            <div className="mb-4 max-w-4xl mx-auto px-4 sm:px-0 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                  className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed text-center"
                >
                  {phrases[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTA Principal */}
            <div className="flex justify-center mb-12 px-4 sm:px-0">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Proposer mon profil</span>
                <span className="sm:hidden">Mon profil</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Social Proof sobre */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-8 sm:mb-12 text-gray-500 px-4 sm:px-0">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "https://i.pravatar.cc/150?img=1",
                    "https://i.pravatar.cc/150?img=3",
                    "https://i.pravatar.cc/150?img=5",
                    "https://i.pravatar.cc/150?img=7",
                    "https://i.pravatar.cc/150?img=9"
                  ].map((avatar, i) => (
                    <img 
                      key={i} 
                      src={avatar} 
                      alt={`Designer ${i + 1}`}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm">+24 designers actifs</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-xs sm:text-sm">Profils vérifiés</span>
              </div>
            </div>

            {/* Stats professionnelles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 card-transition"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">24+</div>
                <div className="text-gray-900 font-semibold">Designers vérifiés</div>
                <div className="text-gray-500 text-sm mt-1">Communauté sélective</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 card-transition"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                <div className="text-gray-900 font-semibold">Entreprises partenaires</div>
                <div className="text-gray-500 text-sm mt-1">Startups et scale-ups</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Réalité du Marché - Améliorée */}
      <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
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
              <span className="text-gray-900">Un marché </span><span className="text-blue-600">très concurrentiel</span>
            </h2>
            {/* Badge et paragraphe introductif supprimés à la demande */}
          </motion.div>

          {/* Blocs de statistiques supprimés à la demande */}

          {/* Section explicative restructurée */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden"
          >
            <div className="p-8 md:p-12">
              {/* Titre centré avec icône */}
              <div className="text-center mb-12">
                {/* Titre supprimé à la demande */}
                {/* Texte explicatif supprimé à la demande */}
              </div>
              
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
                      color: "blue"
                    },
                    {
                      icon: "🤝",
                      title: "Importance cruciale du réseau",
                      description: "80% des emplois ne sont jamais publiés et se font par recommandation",
                      color: "indigo"
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
                        problem.color === 'blue' ? 'bg-blue-100' : 'bg-indigo-100'
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
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-bold mb-3">
                        Notre solution : La validation par l'expertise
                      </h4>
                    </div>
                    
                    <p className="text-blue-100 text-lg leading-relaxed mb-6">
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
                          className="flex items-center gap-3 text-blue-100"
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
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full opacity-60 animate-float"></div>
                  <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-indigo-200 rounded-full opacity-40 animate-float" style={{animationDelay: '1s'}}></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fonctionnalités de la plateforme - Design simplifié et cohérent */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header simple */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Booste ta visibilité auprès des recruteurs
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conçu pour mettre en lumière le profil des meilleurs talents.
            </p>
          </div>

          {/* Grille de fonctionnalités stylée */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Eye className="w-8 h-8" />, 
                title: "Visibilité dans l'annuaire", 
                desc: "Votre profil mis en avant auprès des meilleurs recruteurs du secteur.",
                color: "blue",
                bgGradient: "from-blue-50 to-blue-100",
                iconBg: "bg-blue-500",
                accent: "border-blue-200"
              },
              { 
                icon: <Users className="w-8 h-8" />, 
                title: "Forum communautaire exclusif", 
                desc: "Réseau privé de designers pour partager expériences et conseils.",
                color: "purple",
                bgGradient: "from-purple-50 to-purple-100",
                iconBg: "bg-purple-500",
                accent: "border-purple-200"
              },
              { 
                icon: <Briefcase className="w-8 h-8" />, 
                title: "Offres d'emploi exclusives", 
                desc: "Accès direct à des offres uniques et vérifiées.",
                color: "green",
                bgGradient: "from-green-50 to-green-100",
                iconBg: "bg-green-500",
                accent: "border-green-200"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-8 shadow-lg border-2 ${feature.accent} hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 group`}
              >
                {/* Icône colorée */}
                <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                {/* Contenu */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-600 transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Screenshots simplifiée */}
      <section id="features" className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* Éléments décoratifs modernes */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Accélère tes recherches
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              des fonctionnalités pour booster votre profil
            </p>
          </motion.div>

          {/* Container principal simplifié */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 overflow-hidden max-w-2xl mx-auto">
              <div>
                <div className="relative">
                  {/* Browser mockup */}
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
                  
                  {/* Screenshot container avec animations et tooltip */}
                  <div className="relative bg-white rounded-b-lg shadow-lg overflow-hidden min-h-[300px] lg:min-h-[350px] group">
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
                          alt={`Screenshot ${currentScreenshot + 1} de la plateforme UX Talent`}
                          className="w-full h-full object-cover object-top"
                        />
                        
                        {/* Overlay gradient pour l'effet premium */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Tooltip de description au survol - repositionné en bas */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center opacity-0 group-hover:opacity-100 pb-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/50 max-w-xs mx-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="flex items-start gap-2 mb-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
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

                  {/* Navigation arrows */}
                  <button
                    onClick={() => setCurrentScreenshot((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center group"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-700 rotate-180 group-hover:text-blue-600 transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentScreenshot((prev) => (prev + 1) % screenshots.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center group"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Users className="w-6 h-6" />
              Créer mon profil maintenant
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Processus transparent */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Un processus transparent et équitable
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nous croyons en la transparence et l'équité. Chaque candidature est validée 
              par notre comité d'experts selon des critères transparents et objectifs.
            </p>
          </motion.div>


          {/* Section critères simplifiée */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Critères de validation transparents
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Chaque profil est évalué selon ces 4 critères objectifs et mesurables
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Palette,
                  title: "Portfolio de qualité et diversité",
                  description: "Évaluation de vos réalisations créatives",
                  color: "blue"
                },
                {
                  icon: Briefcase,
                  title: "Expérience professionnelle pertinente",
                  description: "Analyse de votre parcours professionnel",
                  color: "green"
                },
                {
                  icon: Zap,
                  title: "Passion et engagement pour le design",
                  description: "Votre motivation et vision créative",
                  color: "purple"
                },
                {
                  icon: TrendingUp,
                  title: "Potentiel d'évolution et d'adaptation",
                  description: "Capacité d'apprentissage et croissance",
                  color: "indigo"
                }
              ].map((criterion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      criterion.color === 'blue' ? 'bg-blue-500' :
                      criterion.color === 'green' ? 'bg-green-500' :
                      criterion.color === 'purple' ? 'bg-purple-500' :
                      criterion.color === 'indigo' ? 'bg-indigo-500' : 'bg-gray-500'
                    }`}>
                      <criterion.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {criterion.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {criterion.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Badge de confiance simplifié */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium">
                <Shield className="w-4 h-4" />
                <span>Processus certifié et transparent</span>
                <CheckCircle className="w-4 h-4" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final moderne mais raisonnable */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à sortir du lot dans un marché saturé ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez notre vivier de talents dès maintenant.
            </p>
            
            {/* CTA Principal */}
            <div className="mb-8">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
              >
                <Users className="w-6 h-6" />
                Rejoindre le pool de talents
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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">UX</span>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">UI</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Designers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Voir les profils</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recruteurs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/recruiters" className="hover:text-white transition-colors">Découvrir la plateforme</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">S'inscrire</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Rechercher</Link></li>
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
