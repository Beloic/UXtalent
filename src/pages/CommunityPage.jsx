import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Users, Heart, MessageSquare, ExternalLink, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            Version Alpha en Développement
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rejoignez notre Communauté
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            UX Talents est actuellement en version alpha. Votre aide est précieuse pour améliorer la plateforme !
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Alpha Version Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Version Alpha</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Nous développons activement UX Talents et testons de nouvelles fonctionnalités. 
                Cette version alpha nous permet d'itérer rapidement et d'améliorer l'expérience utilisateur.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Ce que cela signifie :</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fonctionnalités en cours de développement
                  </li>
                  <li className="flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Possibles bugs et instabilités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Améliorations continues
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Bug Reporting */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <Bug className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Signaler un Bug</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Vous avez trouvé un bug ou une fonctionnalité qui ne fonctionne pas comme attendu ? 
                Nous serions ravis de le corriger !
              </p>
              
              <div className="bg-red-50 p-4 rounded-xl">
                <h3 className="font-semibold text-red-900 mb-3">Comment signaler :</h3>
                <ol className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    Cliquez sur le bouton ci-dessous
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    Créez une nouvelle carte dans notre tableau Trello
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    Décrivez le problème en détail
                  </li>
                </ol>
              </div>
              
              <a 
                href="https://trello.com/b/t3LYLAKl/backlog-ux-talent" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5" />
                Accéder au Tableau de Bugs
              </a>
            </div>
          </motion.div>
        </div>

        {/* Community Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Pourquoi Participer ?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contribuez à l'Évolution</h3>
              <p className="text-gray-600 text-sm">
                Aidez-nous à créer la meilleure plateforme UX possible en signalant les problèmes
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Communauté Active</h3>
              <p className="text-gray-600 text-sm">
                Rejoignez une communauté engagée dans l'amélioration continue de la plateforme
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Impact Direct</h3>
              <p className="text-gray-600 text-sm">
                Vos retours influencent directement les priorités de développement
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Merci de Faire Partie de l'Aventure !</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Votre patience et vos retours constructifs nous aident à créer une plateforme exceptionnelle 
            pour la communauté UX. Ensemble, nous construisons l'avenir du recrutement UX !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://trello.com/b/t3LYLAKl/backlog-ux-talent" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              <Bug className="w-5 h-5" />
              Signaler un Bug
            </a>
            
            <a 
              href="/forum" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              <MessageSquare className="w-5 h-5" />
              Rejoindre le Forum
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
