import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { fetchRecruiterProfile } from '../services/recruitersApi';

export const useRecruiter = () => {
  const { user, isAuthenticated } = useAuth();
  const { isRecruiter } = usePermissions();
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecruiterData = useCallback(async () => {
    if (!isAuthenticated || !isRecruiter || !user?.id) {
      console.log('🔍 [RECRUITER] Utilisateur non authentifié ou non recruteur:', { isAuthenticated, isRecruiter, userId: user?.id });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [RECRUITER] Chargement du profil recruteur...');
      const profile = await fetchRecruiterProfile();
      setRecruiter(profile);

      console.log('✅ [RECRUITER] Données chargées avec succès');

    } catch (err) {
      console.error('❌ [RECRUITER] Erreur lors du chargement:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isRecruiter, user?.id]);

  useEffect(() => {
    loadRecruiterData();
  }, [loadRecruiterData]);

  const getPlanInfo = useCallback(() => {
    if (!recruiter) {
      return { name: 'N/A', maxJobPosts: 0, maxCandidateContacts: 0, maxFeaturedJobs: 0 };
    }
    
    // Map plan_type to display name and limits
    switch (recruiter.plan_type) {
      case 'starter':
        return { name: 'Starter', maxJobPosts: 5, maxCandidateContacts: 100, maxFeaturedJobs: 1 };
      case 'max':
        return { name: 'Max', maxJobPosts: 50, maxCandidateContacts: 1000, maxFeaturedJobs: 5 };
      case 'premium':
        return { name: 'Premium', maxJobPosts: 200, maxCandidateContacts: 5000, maxFeaturedJobs: 20 };
      default:
        return { name: 'Gratuit', maxJobPosts: 0, maxCandidateContacts: 0, maxFeaturedJobs: 0 };
    }
  }, [recruiter]);



  const canPostJob = useCallback(() => {
    // Utiliser le système d'abonnement au lieu des permissions
    return recruiter?.subscription_status === 'active' && recruiter?.status !== 'suspended';
  }, [recruiter]);

  const canContactCandidate = useCallback(() => {
    // Utiliser le système d'abonnement au lieu des permissions
    return recruiter?.subscription_status === 'active' && recruiter?.status !== 'suspended';
  }, [recruiter]);


  return {
    recruiter,
    loading,
    error,
    getPlanInfo,
    canPostJob,
    canContactCandidate,
    refreshRecruiterData: loadRecruiterData,
  };
};