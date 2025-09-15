import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, MapPin } from 'lucide-react';

export default function PrivacyPage() {
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-xl text-gray-600">
              Protection et traitement de vos données personnelles
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Dernière mise à jour : Janvier 2025
            </div>
          </div>

          {/* Responsable du traitement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-green-600" />
              Responsable du traitement
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Responsable</h3>
                  <p className="text-gray-600">Loic Bernard</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adresse
                  </h3>
                  <p className="text-gray-600">Montpellier, France</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact
                  </h3>
                  <p className="text-gray-600">hello@loicbernard.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plateforme</h3>
                  <p className="text-gray-600">UX Talent</p>
                </div>
              </div>
            </div>
          </section>

          {/* Données collectées */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-green-600" />
              Données collectées
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4">
                Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme 
                et à la mise en relation entre designers et entreprises.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données d'inscription</h3>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Nom et prénom</li>
                    <li>• Adresse e-mail</li>
                    <li>• Mot de passe (chiffré)</li>
                    <li>• Type de profil (candidat/recruteur)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données de profil (candidats)</h3>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Informations professionnelles</li>
                    <li>• Portfolio et projets</li>
                    <li>• Compétences et expériences</li>
                    <li>• Photo de profil (optionnelle)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données techniques</h3>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Adresse IP</li>
                    <li>• Cookies de session</li>
                    <li>• Logs de connexion</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Finalités du traitement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Finalités du traitement
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Gestion des comptes :</strong> Création, authentification et gestion des profils utilisateurs
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Mise en relation :</strong> Faciliter la connexion entre designers et entreprises
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Communication :</strong> Envoi d'informations sur les opportunités et la plateforme
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Amélioration du service :</strong> Analyse des statistiques d'usage pour optimiser la plateforme
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Base légale */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Base légale du traitement
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Consentement</h3>
                  <p className="text-gray-600">
                    Vous avez donné votre consentement explicite lors de l'inscription pour 
                    le traitement de vos données personnelles.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exécution du contrat</h3>
                  <p className="text-gray-600">
                    Le traitement est nécessaire à l'exécution du contrat de service 
                    entre vous et UX Talent.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Intérêt légitime</h3>
                  <p className="text-gray-600">
                    Nous avons un intérêt légitime à améliorer nos services et à 
                    maintenir la sécurité de la plateforme.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Conservation des données */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Conservation des données
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comptes actifs</h3>
                  <p className="text-gray-600">
                    Vos données sont conservées tant que votre compte est actif et 
                    que vous utilisez nos services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Suppression de compte</h3>
                  <p className="text-gray-600">
                    En cas de suppression de votre compte, vos données personnelles 
                    sont supprimées dans un délai de 30 jours, sauf obligation légale 
                    de conservation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données techniques</h3>
                  <p className="text-gray-600">
                    Les logs de connexion sont conservés 12 mois maximum pour des 
                    raisons de sécurité.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Vos droits */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-green-600" />
              Vos droits
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Droit d'accès</h3>
                    <p className="text-gray-600 text-sm">Consulter vos données personnelles</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Droit de rectification</h3>
                    <p className="text-gray-600 text-sm">Corriger vos données inexactes</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Droit d'effacement</h3>
                    <p className="text-gray-600 text-sm">Supprimer vos données</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Droit à la portabilité</h3>
                    <p className="text-gray-600 text-sm">Récupérer vos données</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Droit d'opposition</h3>
                    <p className="text-gray-600 text-sm">Vous opposer au traitement</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Droit de limitation</h3>
                    <p className="text-gray-600 text-sm">Limiter le traitement</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>Pour exercer vos droits :</strong> Contactez-nous à hello@loicbernard.com 
                  en précisant votre demande. Nous vous répondrons dans un délai de 30 jours.
                </p>
              </div>
            </div>
          </section>

          {/* Sécurité */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sécurité des données
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Chiffrement :</strong> Toutes les données sensibles sont chiffrées en transit et au repos
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Accès sécurisé :</strong> Authentification forte et contrôles d'accès stricts
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Sauvegarde :</strong> Sauvegardes régulières et sécurisées de vos données
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    <strong>Formation :</strong> Notre équipe est formée aux bonnes pratiques de sécurité
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cookies et technologies similaires
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4">
                Nous utilisons des cookies essentiels au fonctionnement de la plateforme :
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies de session</h3>
                  <p className="text-gray-600 text-sm">Nécessaires à l'authentification et à la navigation</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies de préférences</h3>
                  <p className="text-gray-600 text-sm">Mémorisation de vos préférences d'interface</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies analytiques</h3>
                  <p className="text-gray-600 text-sm">Analyse anonyme de l'usage de la plateforme</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-green-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact et réclamations
            </h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant cette politique de confidentialité ou pour 
              exercer vos droits, contactez-nous :
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Mail className="w-5 h-5" />
                <a href="mailto:hello@loicbernard.com" className="font-semibold hover:underline">
                  hello@loicbernard.com
                </a>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-gray-600 text-sm">
                <strong>Autorité de contrôle :</strong> Vous pouvez également adresser une réclamation 
                à la CNIL (Commission Nationale de l'Informatique et des Libertés) si vous estimez 
                que vos droits ne sont pas respectés.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
