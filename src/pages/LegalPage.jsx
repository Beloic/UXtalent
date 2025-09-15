import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Mail, MapPin } from 'lucide-react';

export default function LegalPage() {
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
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mentions légales
            </h1>
            <p className="text-xl text-gray-600">
              Informations légales concernant la plateforme UX Talent
            </p>
          </div>

          {/* Éditeur */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Éditeur du site
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Raison sociale</h3>
                  <p className="text-gray-600">UX Talent</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Directeur de publication</h3>
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
              </div>
            </div>
          </section>

          {/* Hébergement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Hébergement
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4">
                Le site UX Talent est hébergé par des services d'hébergement web professionnels 
                garantissant la sécurité et la disponibilité des données.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Type d'hébergement</h3>
                  <p className="text-gray-600">Cloud computing sécurisé</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Localisation</h3>
                  <p className="text-gray-600">Europe (RGPD compliant)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Propriété intellectuelle
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) 
                est la propriété exclusive de UX Talent et de Loic Bernard.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    Toute reproduction, distribution, modification, adaptation, retransmission 
                    ou publication de ces éléments est strictement interdite sans l'accord exprès 
                    par écrit de UX Talent.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">
                    Les marques et logos reproduits sur ce site sont déposés par les sociétés 
                    qui en sont propriétaires.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Responsabilité */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Limitation de responsabilité
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Les informations contenues sur ce site sont aussi précises que possible et 
                  le site remis à jour à différentes périodes de l'année, mais peut toutefois 
                  contenir des inexactitudes ou des omissions.
                </p>
                <p className="text-gray-600">
                  Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, 
                  merci de bien vouloir le signaler par email, à l'adresse hello@loicbernard.com, 
                  en décrivant le problème de la manière la plus précise possible.
                </p>
                <p className="text-gray-600">
                  UX Talent ne pourra être tenu responsable des dommages directs et indirects 
                  causés au matériel de l'utilisateur, lors de l'accès au site UX Talent.
                </p>
              </div>
            </div>
          </section>

          {/* Droit applicable */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Droit applicable
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600 mb-4">
                Le présent site est soumis au droit français. En cas de litige, les tribunaux 
                français seront seuls compétents.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Loi applicable</h3>
                  <p className="text-gray-600">Droit français</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tribunaux compétents</h3>
                  <p className="text-gray-600">Tribunaux de Montpellier</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-indigo-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact
            </h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <div className="flex items-center gap-2 text-blue-600">
              <Mail className="w-5 h-5" />
              <a href="mailto:hello@loicbernard.com" className="font-semibold hover:underline">
                hello@loicbernard.com
              </a>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
