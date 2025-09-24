import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Award,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Target,
  Play,
  Mail,
  Calendar,
  Eye,
  Palette,
  Code,
  UserCheck,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

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
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              <strong className="text-gray-900">UX Talent</strong> est une plate-forme qui propose un vivier de talents sélectionné et validé par une équipe de Designer seniors. 
              Dans un marché saturé où la concurrence est rude, nous vous offrons un avantage décisif.
            </p>

            {/* CTA Principal */}
            <div className="flex justify-center mb-8 sm:mb-12 px-4 sm:px-0">
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
                <span className="text-xs sm:text-sm">+50 designers actifs</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-xs sm:text-sm">Profils vérifiés</span>
              </div>
            </div>

            {/* Stats professionnelles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 card-transition"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-900 font-semibold">Designers vérifiés</div>
                <div className="text-gray-500 text-sm mt-1">Communauté sélective</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 card-transition"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-gray-900 font-semibold">Entreprises partenaires</div>
                <div className="text-gray-500 text-sm mt-1">Startups et scale-ups</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 card-transition"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">7 jours</div>
                <div className="text-gray-900 font-semibold">Délai de réponse</div>
                <div className="text-gray-500 text-sm mt-1">Maximum garanti</div>
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
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-medium text-sm mb-6">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
              Réalité du marché 2025
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Le marché UX/UI est 
              <span className="text-indigo-600"> hautement concurrentiel</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Voici les chiffres qui révèlent pourquoi il est si difficile de décrocher un poste en design aujourd'hui.
            </p>
          </motion.div>

          {/* Stats avec meilleur design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { number: "85%", label: "Taux de saturation", subtitle: "Du marché français", icon: "📊", color: "slate" },
              { number: "200+", label: "Candidats par poste", subtitle: "En moyenne", icon: "👥", color: "blue" },
              { number: "3 mois", label: "Recherche moyenne", subtitle: "Pour trouver un poste", icon: "⏰", color: "indigo" },
              { number: "70%", label: "Échec des candidatures", subtitle: "Sans réseau", icon: "💔", color: "violet" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 text-center h-full card-transition hover:shadow-2xl">
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className={`text-4xl font-bold mb-2 ${
                    stat.color === 'slate' ? 'text-slate-600' : 
                    stat.color === 'blue' ? 'text-blue-600' : 
                    stat.color === 'indigo' ? 'text-indigo-600' : 'text-violet-600'
                  }`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                  <div className="text-gray-600 text-sm">{stat.subtitle}</div>
                  
                  {/* Effet de glow au hover */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                    stat.color === 'slate' ? 'bg-slate-500' : 
                    stat.color === 'blue' ? 'bg-blue-500' : 
                    stat.color === 'indigo' ? 'bg-indigo-500' : 'bg-violet-500'
                  }`}></div>
                </div>
              </motion.div>
            ))}
          </div>

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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Pourquoi cette concurrence acharnée ?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Trois facteurs majeurs expliquent cette difficulté croissante à trouver un emploi en UX/UI
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Problèmes à gauche */}
                <div className="space-y-6">
                  {[
                    {
                      icon: "📊",
                      title: "Saturation du marché",
                      description: "Explosion du nombre de designers face à une croissance limitée des postes qualifiés",
                      color: "slate"
                    },
                    {
                      icon: "🎯",
                      title: "Critères de sélection élevés", 
                      description: "Les entreprises recherchent des profils de plus en plus spécialisés et expérimentés",
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
                        "✅ Critères transparents et équitables", 
                        "✅ Accès privilégié aux recruteurs",
                        "✅ Sortez du lot dans la masse"
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

      {/* Pourquoi rejoindre notre pool */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pourquoi rejoindre notre pool de talents ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Face à la concurrence rude du marché, nous vous offrons un avantage décisif : 
              une sélection rigoureuse par des designers seniors qui connaissent les exigences du terrain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Avantages pour les candidats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Pour les Designers</h3>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Validation par des experts seniors</strong>
                    <p className="text-gray-600 text-sm">Évaluation rigoureuse par des designers expérimentés</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Avantage concurrentiel décisif</strong>
                    <p className="text-gray-600 text-sm">Sortez du lot dans un marché saturé</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Accès privilégié aux recruteurs</strong>
                    <p className="text-gray-600 text-sm">Entreprises qui font confiance à notre sélection</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Mentorat et conseils experts</strong>
                    <p className="text-gray-600 text-sm">Guidance par des professionnels du secteur</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Processus de sélection */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Processus de validation</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <strong className="text-gray-900">Candidature en ligne</strong>
                    <p className="text-gray-600 text-sm">Remplissez votre profil détaillé</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <strong className="text-gray-900">Validation par notre comité d'experts</strong>
                    <p className="text-gray-600 text-sm">Analyse experte de votre portfolio selon une grille objective</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <strong className="text-gray-900">Intégration au pool sélectif</strong>
                    <p className="text-gray-600 text-sm">Accès aux opportunités premium</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compétences recherchées */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nous recherchons des designers avec ces compétences
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nos entreprises partenaires recherchent des profils avec une expertise solide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Design UX/UI",
                skills: ["User Research", "Wireframing", "Prototypage", "Design System"],
                color: "text-blue-600",
                bgColor: "bg-blue-100"
              },
              {
                icon: <Code className="w-8 h-8" />,
                title: "Outils & Technologies",
                skills: ["Figma", "Zero Height", "Maze", "Hotjar"],
                color: "text-blue-600",
                bgColor: "bg-blue-100"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Méthodologies",
                skills: ["Design Thinking", "Agile", "Lean UX", "Design Sprint"],
                color: "text-blue-600",
                bgColor: "bg-blue-100"
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <div className={category.color}>
                    {category.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Vous ne cochez pas toutes les cases ?
              </h3>
              <p className="text-gray-600 mb-6">
                Pas de problème ! Nous valorisons aussi l'apprentissage continu et la passion pour le design. 
                Montrez-nous votre potentiel et votre motivation.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Users className="w-5 h-5" />
                Candidater quand même
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Processus transparent */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-50 rounded-2xl p-12 border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Un processus transparent et équitable
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nous croyons en la transparence et l'équité. Chaque candidature est validée 
                par notre comité d'experts selon des critères transparents et objectifs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">7 jours</div>
                  <div className="text-gray-600">Délai de réponse moyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">Gratuit</div>
                  <div className="text-gray-600">Candidature sans frais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">Feedback</div>
                  <div className="text-gray-600">Retour personnalisé</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Critères de validation transparents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Portfolio de qualité et diversité</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Expérience professionnelle pertinente</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Passion et engagement pour le design</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Potentiel d'évolution et d'adaptation</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final sobre */}
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
              Rejoignez notre pool sélectif de designers validés par des experts seniors. 
              Dans un marché où la concurrence est rude, obtenez l'avantage décisif.
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

            {/* Informations pratiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold">Candidature gratuite</div>
                <div className="text-blue-200 text-sm">Aucun frais d'inscription</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold">Réponse rapide</div>
                <div className="text-blue-200 text-sm">Sous 7 jours ouvrés</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold">Données sécurisées</div>
                <div className="text-blue-200 text-sm">Confidentialité garantie</div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-white mb-4">
                <strong>Des questions ?</strong> Notre équipe est là pour vous aider :
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:hello@loicbernard.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <Mail className="w-5 h-5" />
                  Contact
                </a>
              </div>
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
