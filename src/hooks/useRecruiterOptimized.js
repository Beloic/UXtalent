import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { fetchRecruiterCompleteOptimized, preloadRecruiterData, clearRecruiterCache } from '../services/recruitersApiOptimized';

export const useRecruiterOptimized = () => {
  const { user, isAuthenticated } = useAuth();
  const { isRecruiter } = usePermissions();
  const [recruiter, setRecruiter] = useState(null);
  const [stats, setStats] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  
  // Référence pour éviter les appels multiples
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const loadRecruiterData = useCallback(async () => {
    console.log('🚀 [useRecruiterOptimized] loadRecruiterData appelé');
    console.log('   - isAuthenticated:', isAuthenticated);
    console.log('   - isRecruiter:', isRecruiter);
    console.log('   - user?.id:', user?.id);
    console.log('   - user?.email:', user?.email);

    if (!isAuthenticated || !isRecruiter || !user?.id) {
      console.log('❌ [useRecruiterOptimized] Conditions non remplies, arrêt du chargement');
      setLoading(false);
      return;
    }

    // Éviter les appels multiples
    if (loadingRef.current) {
      console.log('⏳ [useRecruiterOptimized] Chargement déjà en cours, ignoré');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      console.log('📡 [useRecruiterOptimized] Récupération des données complètes...');
      const completeData = await fetchRecruiterCompleteOptimized();
      
      if (!mountedRef.current) return; // Composant démonté
      
      console.log('✅ [useRecruiterOptimized] Données récupérées:', completeData);
      
      setRecruiter(completeData.profile);
      setStats(completeData.stats);
      setPermissions(completeData.permissions);
      setLoadTime(completeData.loadTime || (Date.now() - startTime));
      
      // Précharger les données pour la prochaine fois
      setTimeout(() => {
        preloadRecruiterData();
      }, 1000);

    } catch (err) {
      if (!mountedRef.current) return; // Composant démonté
      
      console.error("❌ [useRecruiterOptimized] Erreur lors du chargement:", err);
      setError(err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [isAuthenticated, isRecruiter, user?.id]);

  // Charger les données au montage
  useEffect(() => {
    mountedRef.current = true;
    loadRecruiterData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadRecruiterData]);

  // Nettoyer le cache au démontage
  useEffect(() => {
    return () => {
      // Ne pas nettoyer le cache global, juste marquer comme démonté
      mountedRef.current = false;
    };
  }, []);

  const getPlanInfo = useCallback(() => {
    if (!recruiter) return null;
    
    return {
      planType: recruiter.plan_type,
      subscriptionStatus: recruiter.subscription_status,
      maxJobPosts: recruiter.max_job_posts,
      maxCandidateContacts: recruiter.max_candidate_contacts,
      maxFeaturedJobs: recruiter.max_featured_jobs,
      status: recruiter.status
    };
  }, [recruiter]);

  const canPostJob = useCallback(() => {
    if (!recruiter || !stats) return false;
    return recruiter.subscription_status === 'active' && 
           recruiter.status !== 'suspended' &&
           stats.remaining_job_posts > 0;
  }, [recruiter, stats]);

  const canContactCandidate = useCallback(() => {
    if (!recruiter || !stats) return false;
    return recruiter.subscription_status === 'active' && 
           recruiter.status !== 'suspended' &&
           stats.remaining_candidate_contacts > 0;
  }, [recruiter, stats]);

  const getRemainingJobPosts = useCallback(() => {
    return stats?.remaining_job_posts || 0;
  }, [stats]);

  const getRemainingCandidateContacts = useCallback(() => {
    return stats?.remaining_candidate_contacts || 0;
  }, [stats]);

  // Fonction pour forcer le rechargement
  const refresh = useCallback(() => {
    clearRecruiterCache();
    loadRecruiterData();
  }, [loadRecruiterData]);

  return {
    // Données
    recruiter,
    stats,
    permissions,
    
    // État
    loading,
    error,
    loadTime,
    
    // Fonctions utilitaires
    getPlanInfo,
    canPostJob,
    canContactCandidate,
    getRemainingJobPosts,
    getRemainingCandidateContacts,
    
    // Actions
    refresh
  };
};
