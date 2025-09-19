import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bug, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Users, 
  Heart,
  ArrowRight,
  Zap,
  Shield,
  Target,
  MessageSquare,
  Send,
  Copy,
  Eye
} from 'lucide-react';

export default function ReportBugPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://uxtalents.featurebase.app/en');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Badge Alpha */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-8 border border-orange-200"
            >
              <AlertTriangle className="w-4 h-4" />
              Version Alpha en Développement
            </motion.div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Signaler un <span className="text-blue-600">Bug</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Vous avez trouvé un problème sur UX Talents ? Aidez-nous à améliorer la plateforme 
              en signalant les bugs que vous rencontrez.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="p-4 bg-blue-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bug className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bugs Signalés</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">47</p>
              <p className="text-sm text-gray-500">Cette semaine</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="p-4 bg-green-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bugs Corrigés</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">32</p>
              <p className="text-sm text-gray-500">Cette semaine</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="p-4 bg-purple-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contributeurs</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">156</p>
              <p className="text-sm text-gray-500">Utilisateurs actifs</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* How to Report */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-red-100 rounded-2xl">
                  <Bug className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Comment Signaler</h2>
                  <p className="text-gray-600">Suivez ces étapes simples</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cliquez sur le bouton ci-dessous</h3>
                    <p className="text-gray-600">Accédez directement à notre plateforme Featurebase dédiée aux bugs</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Créez un nouveau ticket</h3>
                    <p className="text-gray-600">Ajoutez un ticket avec le titre du problème rencontré</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Décrivez le problème</h3>
                    <p className="text-gray-600">Ajoutez une description détaillée, captures d'écran si possible</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Nous nous en occupons</h3>
                    <p className="text-gray-600">Notre équipe analysera et corrigera le problème rapidement</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
              <a 
                href="https://uxtalents.featurebase.app/en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                Accéder à Featurebase
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              </div>
            </motion.div>

            {/* What to Report */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* What to Report */}
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-orange-100 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Que Signaler</h2>
                    <p className="text-gray-600">Types de problèmes à remonter</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <Bug className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900">Bugs et Erreurs</h3>
                      <p className="text-red-700 text-sm">Fonctionnalités qui ne marchent pas, erreurs d'affichage, crashes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Problèmes d'Interface</h3>
                      <p className="text-blue-700 text-sm">Éléments mal alignés, textes coupés, boutons non cliquables</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900">Performance</h3>
                      <p className="text-purple-700 text-sm">Pages qui se chargent lentement, actions qui traînent</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Suggestions</h3>
                      <p className="text-green-700 text-sm">Idées d'amélioration, nouvelles fonctionnalités</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-10 text-white">
                <h2 className="text-2xl font-bold mb-6">Actions Rapides</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="w-5 h-5" />
                      <span className="font-medium">Copier le lien Featurebase</span>
                    </div>
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>

                  <a
                    href="/forum"
                    className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Discuter sur le Forum</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Report Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pourquoi Signaler un Bug ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Votre contribution est essentielle pour créer la meilleure plateforme UX possible
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center"
            >
              <div className="p-6 bg-blue-100 rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Améliorez l'Expérience</h3>
              <p className="text-gray-600">
                Chaque bug signalé nous aide à créer une plateforme plus stable et agréable à utiliser pour tous.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="p-6 bg-green-100 rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Target className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Impact Direct</h3>
              <p className="text-gray-600">
                Vos retours influencent directement nos priorités de développement et nos prochaines fonctionnalités.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <div className="p-6 bg-purple-100 rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Communauté Solidaire</h3>
              <p className="text-gray-600">
                Rejoignez une communauté engagée qui participe activement à l'évolution de la plateforme.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Merci de Faire Partie de l'Aventure !
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Votre patience et vos retours constructifs nous aident à créer une plateforme exceptionnelle 
              pour la communauté UX. Ensemble, nous construisons l'avenir du recrutement UX !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://uxtalents.featurebase.app/en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Bug className="w-5 h-5" />
                Signaler un Bug Maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a 
                href="/forum" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
                Rejoindre le Forum
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
