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
    navigator.clipboard.writeText('https://uxtalents.featurebase.app/en/roadmap');
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

        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* How to Report */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-4xl mx-auto"
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
                href="https://uxtalents.featurebase.app/en/roadmap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                Accéder à la Roadmap
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              </div>
            </motion.div>
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

    </div>
  );
}
