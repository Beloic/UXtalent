import { useState, useEffect, useCallback } from 'react';
import { getKanbanData, moveCandidateInKanban, updateCandidateNotes, addToFavorites, removeFromFavorites, validateTransition } from '../services/kanbanApi';

/**
 * Hook personnalisé pour gérer les données Kanban avec mises à jour optimistes
 * @param {Object} options - Options de configuration
 * @returns {Object} État et fonctions de gestion des données Kanban
 */
export function useKanbanData(options = {}) {
  const {
    autoLoad = true,
    onError = null,
    onSuccess = null
  } = options;

  const [kanbanData, setKanbanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Charger les données Kanban
  const loadKanbanData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getKanbanData();
      setKanbanData(data);
      setLastUpdated(new Date());
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des données Kanban:', err);
      setError(err.message);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onError, onSuccess]);

  // Mise à jour optimiste des données locales
  const updateLocalData = useCallback((updater) => {
    setKanbanData(prevData => {
      if (!prevData) return prevData;
      return updater(prevData);
    });
  }, []);

  // Déplacer un candidat avec mise à jour optimiste et validation
  const moveCandidate = useCallback(async (candidateId, fromColumn, toColumn, toIndex = null) => {
    // Validation simplifiée - permettre toutes les transitions pour le moment
    console.log(`🔄 Déplacement candidat ${candidateId} de "${fromColumn}" vers "${toColumn}"`);

    // Mise à jour optimiste immédiate
    updateLocalData(prevData => {
      if (!prevData || !prevData.kanbanData) return prevData;

      const newData = { ...prevData };
      const kanbanData = { ...newData.kanbanData };

      // Retirer le candidat de la colonne source
      if (kanbanData[fromColumn]) {
        kanbanData[fromColumn] = kanbanData[fromColumn].filter(c => c.id !== candidateId);
      }

      // Ajouter le candidat à la colonne destination
      if (kanbanData[toColumn]) {
        const candidate = prevData.candidates.find(c => c.id === candidateId);
        if (candidate) {
          const updatedCandidate = { ...candidate, status: toColumn };
          
          if (toIndex !== null && toIndex >= 0) {
            kanbanData[toColumn].splice(toIndex, 0, updatedCandidate);
          } else {
            kanbanData[toColumn].push(updatedCandidate);
          }
        }
      }

      // Mettre à jour le candidat dans la liste principale
      const updatedCandidates = newData.candidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: toColumn }
          : candidate
      );

      return {
        ...newData,
        candidates: updatedCandidates,
        kanbanData: kanbanData
      };
    });

    try {
      // Appel API en arrière-plan
      const result = await moveCandidateInKanban(candidateId, fromColumn, toColumn, toIndex);
      
      // Recharger les données pour s'assurer de la cohérence
      await loadKanbanData();
      
      return result;
    } catch (err) {
      console.error('Erreur lors du déplacement du candidat:', err);
      
      // En cas d'erreur, recharger les données pour restaurer l'état correct
      await loadKanbanData();
      
      throw err;
    }
  }, [updateLocalData, loadKanbanData]);

  // Mettre à jour les notes avec mise à jour optimiste
  const updateNotes = useCallback(async (candidateId, notes) => {
    // Mise à jour optimiste immédiate
    updateLocalData(prevData => {
      if (!prevData) return prevData;

      const newData = { ...prevData };
      
      // Mettre à jour le candidat dans la liste principale
      const updatedCandidates = newData.candidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, notes: notes }
          : candidate
      );

      // Mettre à jour le candidat dans toutes les colonnes Kanban
      const updatedKanbanData = {};
      Object.keys(newData.kanbanData).forEach(columnName => {
        updatedKanbanData[columnName] = newData.kanbanData[columnName].map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, notes: notes }
            : candidate
        );
      });

      return {
        ...newData,
        candidates: updatedCandidates,
        kanbanData: updatedKanbanData
      };
    });

    try {
      // Appel API en arrière-plan
      const result = await updateCandidateNotes(candidateId, notes);
      
      return result;
    } catch (err) {
      console.error('Erreur lors de la mise à jour des notes:', err);
      
      // En cas d'erreur, recharger les données pour restaurer l'état correct
      await loadKanbanData();
      
      throw err;
    }
  }, [updateLocalData, loadKanbanData]);

  // Ajouter aux favoris avec mise à jour optimiste
  const addToFavoritesOptimistic = useCallback(async (candidateId) => {
    // Trouver le candidat à ajouter
    const candidate = kanbanData?.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Mise à jour optimiste immédiate
    updateLocalData(prevData => {
      if (!prevData) return prevData;

      const newData = { ...prevData };
      
      // Vérifier si déjà en favori
      const isAlreadyFavorite = newData.favorites.some(fav => fav.id === candidateId);
      if (isAlreadyFavorite) return prevData;

      // Ajouter aux favoris
      const updatedFavorites = [...newData.favorites, candidate];

      return {
        ...newData,
        favorites: updatedFavorites
      };
    });

    try {
      // Appel API en arrière-plan
      const result = await addToFavorites(candidateId);
      
      return result;
    } catch (err) {
      console.error('Erreur lors de l\'ajout aux favoris:', err);
      
      // En cas d'erreur, recharger les données pour restaurer l'état correct
      await loadKanbanData();
      
      throw err;
    }
  }, [kanbanData, updateLocalData, loadKanbanData]);

  // Retirer des favoris avec mise à jour optimiste
  const removeFromFavoritesOptimistic = useCallback(async (candidateId) => {
    // Mise à jour optimiste immédiate
    updateLocalData(prevData => {
      if (!prevData) return prevData;

      const newData = { ...prevData };
      
      // Retirer des favoris
      const updatedFavorites = newData.favorites.filter(fav => fav.id !== candidateId);

      return {
        ...newData,
        favorites: updatedFavorites
      };
    });

    try {
      // Appel API en arrière-plan
      const result = await removeFromFavorites(candidateId);
      
      return result;
    } catch (err) {
      console.error('Erreur lors de la suppression des favoris:', err);
      
      // En cas d'erreur, recharger les données pour restaurer l'état correct
      await loadKanbanData();
      
      throw err;
    }
  }, [updateLocalData, loadKanbanData]);

  // Charger les données au montage si autoLoad est activé
  useEffect(() => {
    if (autoLoad) {
      loadKanbanData();
    }
  }, [autoLoad, loadKanbanData]);

  return {
    // État
    kanbanData,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    loadKanbanData,
    moveCandidate,
    updateNotes,
    addToFavorites: addToFavoritesOptimistic,
    removeFromFavorites: removeFromFavoritesOptimistic,
    
    // Utilitaires
    updateLocalData,
    clearError: () => setError(null)
  };
}
