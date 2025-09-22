import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { fetchRecruiterProfile, fetchRecruiterStats, fetchRecruiterPermissions } from '../services/recruitersApi';

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
    console.log('🔍 [getPlanInfo] recruiter:', recruiter);
    console.log('🔍 [getPlanInfo] recruiter.plan_type:', recruiter?.plan_type);
    
    if (!recruiter) {
      console.log('❌ [getPlanInfo] Pas de données recruteur, retour plan par défaut');
      return { name: 'N/A' };
    }
    
    // Map plan_type to display name (sans limitations)
    switch (recruiter.plan_type) {
      case 'starter':
        console.log('✅ [getPlanInfo] Plan Starter détecté');
        return { name: 'Starter' };
      case 'max':
        console.log('✅ [getPlanInfo] Plan Max détecté');
        return { name: 'Max' };
      case 'premium':
        console.log('✅ [getPlanInfo] Plan Premium détecté');
        return { name: 'Premium' };
      default:
        console.log('⚠️ [getPlanInfo] Plan inconnu:', recruiter.plan_type, 'retour plan gratuit');
        return { name: 'Gratuit' };
    }
  }, [recruiter]);

  // Fonctions de quotas supprimées - plus de limitations

  const canPostJob = useCallback(() => {
    return permissions?.canPostJob || false;
  }, [permissions]);

  const canContactCandidate = useCallback(() => {
    return permissions?.canContactCandidate || false;
  }, [permissions]);

  // Fonctions d'incrémentation des quotas supprimées - plus de limitations

  return {
    recruiter,
    stats,
    permissions,
    loading,
    error,
    getPlanInfo,
    canPostJob,
    canContactCandidate,
    refreshRecruiterData: loadRecruiterData,
  };
};