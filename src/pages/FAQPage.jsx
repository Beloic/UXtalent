import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Users, Shield, Clock, Mail } from 'lucide-react';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "Général",
      icon: <HelpCircle className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      questions: [
        {
          question: "Qu'est-ce que UX Talent ?",
          answer: "UX Talent est une plateforme sélective qui connecte les meilleurs designers UX/UI avec des entreprises qui valorisent le design. Nous proposons un vivier de talents vérifié et validé par une équipe de designers seniors."
        },
        {
          question: "Comment fonctionne la plateforme ?",
          answer: "Notre processus se déroule en 3 étapes : 1) Candidature en ligne, 2) Évaluation du portfolio, 3) Intégration au pool de talents. Une fois intégré, vous accédez aux opportunités sélectionnées par notre équipe."
        },
        {
          question: "Quelle est la différence avec les autres plateformes ?",
          answer: "UX Talent se distingue par sa sélectivité. Contrairement aux plateformes généralistes, nous ne retenons que les meilleurs profils après une évaluation rigoureuse par des designers seniors. Cela garantit une qualité élevée pour les entreprises et des opportunités premium pour les candidats."
        }
      ]
    },
    {
      category: "Candidats",
      icon: <Users className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      questions: [
        {
          question: "Comment postuler pour rejoindre le pool de talents ?",
          answer: "Cliquez sur 'Proposer mon profil' sur la page d'accueil, créez votre compte et remplissez votre profil détaillé. Notre équipe évaluera votre candidature sous 7 jours ouvrés."
        },
        {
          question: "Quels sont les critères de sélection ?",
          answer: "Nous évaluons 4 critères principaux : la qualité de votre portfolio, votre expérience pertinente, votre motivation et passion pour le design, et votre potentiel d'évolution. Nous recherchons des profils avec une expertise solide."
        },
        {
          question: "Combien de temps faut-il pour être sélectionné ?",
          answer: "Le processus complet prend généralement 1-2 semaines. Vous recevrez une réponse sous 7 jours ouvrés après votre candidature. En cas de sélection, vous serez directement intégré au pool de talents."
        },
        {
          question: "Que se passe-t-il si ma candidature est refusée ?",
          answer: "Si votre candidature n'est pas retenue, vous recevrez un feedback détaillé expliquant les raisons. Vous pourrez postuler à nouveau après avoir amélioré votre profil, généralement après 6 mois."
        },
        {
          question: "L'inscription est-elle gratuite ?",
          answer: "Oui, l'inscription et la candidature sont entièrement gratuites. Il n'y a aucun frais d'inscription ou de commission sur les placements réussis."
        }
      ]
    },
    {
      category: "Entreprises",
      icon: <Shield className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      questions: [
        {
          question: "Comment les entreprises peuvent-elles accéder aux talents ?",
          answer: "Les entreprises partenaires ont accès à notre base de talents vérifiés. Elles peuvent consulter les profils, contacter directement les candidats et bénéficier d'un accompagnement personnalisé dans leur recherche."
        },
        {
          question: "Combien d'entreprises sont partenaires ?",
          answer: "Nous travaillons actuellement avec 12 entreprises partenaires, principalement des startups et scale-ups qui valorisent le design. Nous sélectionnons nos partenaires pour garantir des opportunités de qualité."
        },
        {
          question: "Comment devenir une entreprise partenaire ?",
          answer: "Contactez-nous à hello@loicbernard.com pour discuter d'un partenariat. Nous évaluons chaque demande selon nos critères de qualité et d'alignement avec notre mission."
        }
      ]
    },
    {
      category: "Processus",
      icon: <Clock className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      questions: [
        {
          question: "Quel est le délai de réponse ?",
          answer: "Nous nous engageons à vous répondre sous 7 jours ouvrés maximum après réception de votre candidature. En cas de sélection, vous serez directement intégré au pool de talents."
        },
        {
          question: "Comment se déroule l'évaluation du portfolio ?",
          answer: "Notre équipe de designers seniors examine attentivement votre portfolio, vos projets et votre expérience. Nous évaluons la qualité de vos réalisations, votre processus de design et votre capacité à résoudre des problèmes UX/UI complexes."
        },
        {
          question: "Puis-je modifier mon profil après validation ?",
          answer: "Oui, vous pouvez mettre à jour votre profil à tout moment depuis votre espace personnel. Nous vous encourageons à le maintenir à jour pour maximiser vos chances de placement."
        },
        {
          question: "Que se passe-t-il après l'intégration au pool ?",
          answer: "Une fois intégré, vous recevrez des notifications sur les opportunités correspondant à votre profil. Vous pouvez également accéder au forum communautaire et bénéficier de notre accompagnement personnalisé."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-gray-600">
              Trouvez les réponses à vos questions sur UX Talent
            </p>
          </div>

          {/* FAQ par catégorie */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* En-tête de catégorie */}
                <div className={`${category.bgColor} p-4 border-b border-gray-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`${category.color}`}>
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.category}
                    </h2>
                  </div>
                </div>

                {/* Questions */}
                <div className="divide-y divide-gray-200">
                  {category.questions.map((item, questionIndex) => {
                    const globalIndex = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openItems[globalIndex];

                    return (
                      <div key={questionIndex} className="p-4">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {item.question}
                          </h3>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 pb-2">
                                <p className="text-gray-600 leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-blue-50 rounded-xl p-8 text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider. N'hésitez pas à nous contacter 
              pour toute question supplémentaire.
            </p>
            <a
              href="mailto:hello@loicbernard.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Nous contacter
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
