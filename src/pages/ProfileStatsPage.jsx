import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Users, MessageSquare, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    profileViews: 0,
    profileViewsToday: 0,
    recruiterContacts: 0,
    forumPosts: 0,
    forumReplies: 0,
    profileCompleteness: 0,
    lastActivity: null,
    joinDate: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileStats();
    }
  }, [user]);

  const loadProfileStats = async () => {
    try {
      setIsLoading(true);
      
      // Simuler des données de statistiques (à remplacer par de vraies données API)
      const mockStats = {
        profileViews: Math.floor(Math.random() * 150) + 20,
        profileViewsToday: Math.floor(Math.random() * 8) + 1,
        recruiterContacts: Math.floor(Math.random() * 25) + 3,
        forumPosts: Math.floor(Math.random() * 10) + 1,
        forumReplies: Math.floor(Math.random() * 30) + 5,
        profileCompleteness: Math.floor(Math.random() * 30) + 70,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement de vos statistiques...</h1>
          <p className="text-gray-600">Récupération de vos données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/my-profile" 
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au profil
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-purple-600 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Statistiques</h1>
              <p className="text-gray-600">Suivez la performance de votre profil</p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques principales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
                <p className="text-sm text-gray-600">Vues du profil</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% ce mois
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Eye className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.profileViewsToday}</p>
                <p className="text-sm text-gray-600">Vues aujourd'hui</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <Calendar className="w-4 h-4 mr-1" />
              Aujourd'hui
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.recruiterContacts}</p>
                <p className="text-sm text-gray-600">Contacts recruteurs</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +3 cette semaine
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.forumPosts}</p>
                <p className="text-sm text-gray-600">Posts forum</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              {stats.forumPosts > 0 ? 'Actif' : 'Aucun post'}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.forumReplies}</p>
                <p className="text-sm text-gray-600">Réponses forum</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +5 ce mois
            </div>
          </div>
        </motion.div>

        {/* Graphiques et détails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Complétude du profil */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complétude du profil</h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm font-bold text-gray-900">{stats.profileCompleteness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.profileCompleteness}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {stats.profileCompleteness >= 90 
                ? 'Excellent ! Votre profil est très complet.'
                : stats.profileCompleteness >= 70
                ? 'Bien ! Quelques améliorations possibles.'
                : 'Améliorez votre profil pour attirer plus de recruteurs.'
              }
            </p>
          </motion.div>

          {/* Activité récente */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Activité récente</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Profil consulté</p>
                  <p className="text-xs text-gray-600">Il y a 2 heures</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouveau contact recruteur</p>
                  <p className="text-xs text-gray-600">Il y a 1 jour</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Réponse au forum</p>
                  <p className="text-xs text-gray-600">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Informations générales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Membre depuis</h4>
              <p className="text-gray-600">
                {stats.joinDate ? stats.joinDate.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Non disponible'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Dernière activité</h4>
              <p className="text-gray-600">
                {stats.lastActivity ? stats.lastActivity.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Non disponible'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
