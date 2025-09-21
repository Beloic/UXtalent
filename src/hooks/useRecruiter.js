import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { fetchRecruiterProfile, fetchRecruiterStats, fetchRecruiterPermissions, incrementRecruiterJobPosts, incrementRecruiterCandidateContacts } from '../services/recruitersApi';

export const useRecruiter = () => {
  const { user, isAuthenticated } = useAuth();
  const { isRecruiter } = usePermissions();
  const [recruiter, setRecruiter] = useState(null);
  const [stats, setStats] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecruiterData = useCallback(async () => {
    console.log('🔍 [useRecruiter] loadRecruiterData appelé');
    console.log('   - isAuthenticated:', isAuthenticated);
    console.log('   - isRecruiter:', isRecruiter);
    console.log('   - user?.id:', user?.id);
    console.log('   - user?.email:', user?.email);
    console.log('   - user?.user_metadata:', user?.user_metadata);

    if (!isAuthenticated || !isRecruiter || !user?.id) {
      console.log('❌ [useRecruiter] Conditions non remplies, arrêt du chargement');
      setLoading(false);
      return;
    }

    console.log('✅ [useRecruiter] Conditions remplies, démarrage du chargement');
    setLoading(true);
    setError(null);
    try {
      console.log('📡 [useRecruiter] Récupération du profil...');
      const profile = await fetchRecruiterProfile();
      console.log('✅ [useRecruiter] Profil récupéré:', profile);
      setRecruiter(profile);

      console.log('📊 [useRecruiter] Récupération des stats...');
      const recruiterStats = await fetchRecruiterStats(profile.id);
      console.log('✅ [useRecruiter] Stats récupérées:', recruiterStats);
      setStats(recruiterStats);

      console.log('🔐 [useRecruiter] Récupération des permissions...');
      const recruiterPermissions = await fetchRecruiterPermissions(profile.id);
      console.log('✅ [useRecruiter] Permissions récupérées:', recruiterPermissions);
      setPermissions(recruiterPermissions);

    } catch (err) {
      console.error("❌ [useRecruiter] Erreur lors du chargement:", err);
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

  const getRemainingJobPosts = useCallback(() => {
    if (!recruiter) return 0;
    const plan = getPlanInfo();
    return Math.max(0, plan.maxJobPosts - (recruiter.total_job_posts || 0));
  }, [recruiter, getPlanInfo]);

  const getRemainingCandidateContacts = useCallback(() => {
    if (!recruiter) return 0;
    const plan = getPlanInfo();
    return Math.max(0, plan.maxCandidateContacts - (recruiter.total_candidate_contacts || 0));
  }, [recruiter, getPlanInfo]);

  const canPostJob = useCallback(() => {
    return permissions?.canPostJob || false;
  }, [permissions]);

  const canContactCandidate = useCallback(() => {
    return permissions?.canContactCandidate || false;
  }, [permissions]);

  const incrementJobPosts = useCallback(async () => {
    if (!recruiter) return;
    await incrementRecruiterJobPosts(recruiter.id);
    loadRecruiterData(); // Refresh data
  }, [recruiter, loadRecruiterData]);

  const incrementCandidateContacts = useCallback(async () => {
    if (!recruiter) return;
    await incrementRecruiterCandidateContacts(recruiter.id);
    loadRecruiterData(); // Refresh data
  }, [recruiter, loadRecruiterData]);

  return {
    recruiter,
    stats,
    permissions,
    loading,
    error,
    getPlanInfo,
    getRemainingJobPosts,
    getRemainingCandidateContacts,
    canPostJob,
    canContactCandidate,
    incrementJobPosts,
    incrementCandidateContacts,
    refreshRecruiterData: loadRecruiterData,
  };
};