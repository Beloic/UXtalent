import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { RecruitersApiService } from '../services/recruitersApi';

// Hook pour gérer les données du recruteur connecté
export const useRecruiter = () => {
  const { user, isAuthenticated } = useAuth();
  const { isRecruiter } = usePermissions();
  
  const [recruiter, setRecruiter] = useState(null);
  const [stats, setStats] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données du recruteur
  const loadRecruiterData = async () => {
    if (!isAuthenticated || !isRecruiter) {
      setRecruiter(null);
      setStats(null);
      setPermissions(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Charger le profil et les statistiques en parallèle
      const [profileData, statsData, permissionsData] = await Promise.all([
        RecruitersApiService.getMyProfile(),
        RecruitersApiService.getMyStats(),
        RecruitersApiService.getMyPermissions()
      ]);

      setRecruiter(profileData);
      setStats(statsData);
      setPermissions(permissionsData);
    } catch (err) {
      console.error('Erreur lors du chargement des données du recruteur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil du recruteur
  const updateProfile = async (profileData) => {
    if (!isAuthenticated || !isRecruiter) {
      throw new Error('Non autorisé');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRecruiter = await RecruitersApiService.updateMyProfile(profileData);
      setRecruiter(updatedRecruiter);
      return updatedRecruiter;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Incrémenter le compteur d'offres
  const incrementJobPosts = async () => {
    if (!isAuthenticated || !isRecruiter) {
      throw new Error('Non autorisé');
    }

    try {
      const updatedRecruiter = await RecruitersApiService.incrementJobPosts();
      setRecruiter(updatedRecruiter);
      
      // Recharger les statistiques
      const statsData = await RecruitersApiService.getMyStats();
      setStats(statsData);
      
      return updatedRecruiter;
    } catch (err) {
      console.error('Erreur lors de l\'incrémentation des offres:', err);
      setError(err.message);
      throw err;
    }
  };

  // Incrémenter le compteur de contacts
  const incrementCandidateContacts = async () => {
    if (!isAuthenticated || !isRecruiter) {
      throw new Error('Non autorisé');
    }

    try {
      const updatedRecruiter = await RecruitersApiService.incrementCandidateContacts();
      setRecruiter(updatedRecruiter);
      
      // Recharger les statistiques
      const statsData = await RecruitersApiService.getMyStats();
      setStats(statsData);
      
      return updatedRecruiter;
    } catch (err) {
      console.error('Erreur lors de l\'incrémentation des contacts:', err);
      setError(err.message);
      throw err;
    }
  };

  // Recharger toutes les données
  const refresh = () => {
    loadRecruiterData();
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadRecruiterData();
  }, [isAuthenticated, isRecruiter, user?.email]);

  // Fonctions utilitaires
  const canPostJob = () => {
    return permissions?.canPostJob || false;
  };

  const canContactCandidate = () => {
    return permissions?.canContactCandidate || false;
  };

  const getRemainingJobPosts = () => {
    return stats?.remainingJobPosts || 0;
  };

  const getRemainingCandidateContacts = () => {
    return stats?.remainingCandidateContacts || 0;
  };

  const isSubscriptionActive = () => {
    return recruiter?.subscription_status === 'active' && 
           (!recruiter?.subscription_end_date || new Date(recruiter.subscription_end_date) > new Date());
  };

  const getPlanInfo = () => {
    const planType = recruiter?.plan_type || 'starter';
    const planNames = {
      'starter': 'Starter',
      'max': 'Max',
      'premium': 'Premium',
      'custom': 'Sur-mesure'
    };
    
    return {
      type: planType,
      name: planNames[planType] || 'Inconnu',
      isActive: isSubscriptionActive()
    };
  };

  return {
    // Données
    recruiter,
    stats,
    permissions,
    
    // État
    loading,
    error,
    isAuthenticated,
    isRecruiter,
    
    // Actions
    updateProfile,
    incrementJobPosts,
    incrementCandidateContacts,
    refresh,
    
    // Fonctions utilitaires
    canPostJob,
    canContactCandidate,
    getRemainingJobPosts,
    getRemainingCandidateContacts,
    isSubscriptionActive,
    getPlanInfo
  };
};

// Hook pour gérer les recruteurs (admin seulement)
export const useRecruitersAdmin = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin } = usePermissions();
  
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger tous les recruteurs
  const loadRecruiters = async () => {
    if (!isAuthenticated || !isAdmin) {
      setRecruiters([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recruitersData = await RecruitersApiService.getAllRecruiters();
      setRecruiters(recruitersData);
    } catch (err) {
      console.error('Erreur lors du chargement des recruteurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau recruteur
  const createRecruiter = async (recruiterData) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Non autorisé');
    }

    setLoading(true);
    setError(null);

    try {
      const newRecruiter = await RecruitersApiService.createRecruiter(recruiterData);
      setRecruiters(prev => [newRecruiter, ...prev]);
      return newRecruiter;
    } catch (err) {
      console.error('Erreur lors de la création du recruteur:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un recruteur
  const updateRecruiter = async (id, recruiterData) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Non autorisé');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRecruiter = await RecruitersApiService.updateRecruiter(id, recruiterData);
      setRecruiters(prev => prev.map(r => r.id === id ? updatedRecruiter : r));
      return updatedRecruiter;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du recruteur:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un recruteur
  const deleteRecruiter = async (id) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Non autorisé');
    }

    setLoading(true);
    setError(null);

    try {
      await RecruitersApiService.deleteRecruiter(id);
      setRecruiters(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du recruteur:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le plan d'un recruteur
  const updateRecruiterPlan = async (id, planType, subscriptionData = {}) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Non autorisé');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRecruiter = await RecruitersApiService.updateRecruiterPlan(id, planType, subscriptionData);
      setRecruiters(prev => prev.map(r => r.id === id ? updatedRecruiter : r));
      return updatedRecruiter;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du plan:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Charger les recruteurs au montage du composant
  useEffect(() => {
    loadRecruiters();
  }, [isAuthenticated, isAdmin]);

  return {
    // Données
    recruiters,
    
    // État
    loading,
    error,
    isAuthenticated,
    isAdmin,
    
    // Actions
    loadRecruiters,
    createRecruiter,
    updateRecruiter,
    deleteRecruiter,
    updateRecruiterPlan
  };
};
