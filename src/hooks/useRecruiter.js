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
    if (!isAuthenticated || !isRecruiter || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await fetchRecruiterProfile();
      setRecruiter(profile);

      const recruiterStats = await fetchRecruiterStats(profile.id);
      setStats(recruiterStats);

      const recruiterPermissions = await fetchRecruiterPermissions(profile.id);
      setPermissions(recruiterPermissions);

    } catch (err) {
      console.error("Failed to load recruiter data:", err);
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