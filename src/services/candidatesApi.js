import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authenticatedFetch } from '../utils/auth';
import { buildApiUrl } from '../config/api';


// Hook pour récupérer les candidats avec filtres
export function useCandidates(filters = {}) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construire les paramètres de requête
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.remote && filters.remote.length > 0) {
          filters.remote.forEach(r => params.append('remote', r));
        }
        if (filters.experience && filters.experience.length > 0) {
          filters.experience.forEach(e => params.append('experience', e));
        }
        if (filters.availability && filters.availability.length > 0) {
          filters.availability.forEach(a => params.append('availability', a));
        }
        if (filters.location && filters.location.length > 0) {
          filters.location.forEach(l => params.append('location', l));
        }
        if (filters.salaryRange && filters.salaryRange.length > 0) {
          filters.salaryRange.forEach(s => params.append('salaryRange', s));
        }
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        // Utiliser le helper d'authentification
        const response = await authenticatedFetch(buildApiUrl(`/api/candidates/?${params.toString()}`));
        
        if (!response.ok) {
          if (response.status === 404) {
            // Si 404, cela signifie qu'il n'y a pas encore de candidats dans la base
            setCandidates([]);
            setTotal(0);
            return;
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setCandidates(data.candidates || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des candidats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [filters.search, filters.remote, filters.experience, filters.availability, filters.location, filters.salaryRange, filters.sortBy, authVersion]);

  // Rafraîchir quand la session change (connexion/déconnexion)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setAuthVersion(prev => prev + 1);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { candidates, loading, error, total };
}

// Hook pour récupérer un candidat spécifique
export function useCandidate(id) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);

        // Utiliser le helper d'authentification
        const response = await authenticatedFetch(buildApiUrl(`/api/candidates/${id}/`));
        
        if (!response.ok) {
          if (response.status === 404) {
            // Si 404, le candidat n'existe pas
            setCandidate(null);
            return;
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setCandidate(data);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement du candidat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  return { candidate, loading, error };
}

// Fonction pour ajouter un candidat
export async function addCandidate(candidateData) {
  const response = await authenticatedFetch(buildApiUrl(`/api/candidates/`), {
    method: 'POST',
    body: JSON.stringify(candidateData),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}

// Fonction pour mettre à jour un candidat
export async function updateCandidate(id, candidateData) {
  const response = await authenticatedFetch(buildApiUrl(`/api/candidates/${id}/`), {
    method: 'PUT',
    body: JSON.stringify(candidateData),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}

// Fonction pour supprimer un candidat
export async function deleteCandidate(id) {
  const response = await authenticatedFetch(buildApiUrl(`/api/candidates/${id}/`), {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}

// Fonction pour mettre à jour le plan d'un candidat
export async function updateCandidatePlan(id, planType, durationMonths = 1) {
  const response = await authenticatedFetch(buildApiUrl(`/api/candidates/${id}/plan/`), {
    method: 'PUT',
    body: JSON.stringify({ planType, durationMonths }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}

// Hook pour récupérer les statistiques
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildApiUrl(`/api/stats`));
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
