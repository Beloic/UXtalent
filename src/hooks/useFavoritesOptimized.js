import { useState, useEffect, useCallback } from 'react';
import { addToFavorites, removeFromFavorites, checkIfFavorited } from '../services/kanbanApi';

/**
 * Hook personnalisé pour gérer les favoris de manière optimisée
 * Évite les rechargements complets en gérant l'état local
 */
export function useFavoritesOptimized() {
  const [favorites, setFavorites] = useState([]);
  const [favoritesSet, setFavoritesSet] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mettre à jour le Set des favoris quand la liste change
  useEffect(() => {
    setFavoritesSet(new Set(favorites.map(fav => fav.id)));
  }, [favorites]);

  // Vérifier si un candidat est en favori
  const isFavorited = useCallback((candidateId) => {
    return favoritesSet.has(candidateId);
  }, [favoritesSet]);

  // Ajouter un candidat aux favoris avec mise à jour optimiste
  const addToFavoritesOptimistic = useCallback(async (candidate) => {
    const candidateId = candidate.id;
    
    // Vérifier si déjà en favori
    if (isFavorited(candidateId)) {
      return { success: true, message: 'Candidat déjà en favori' };
    }

    // Mise à jour optimiste immédiate
    setFavorites(prevFavorites => [...prevFavorites, candidate]);
    setIsLoading(true);
    setError(null);

    try {
      // Appel API en arrière-plan
      const result = await addToFavorites(candidateId);
      
      console.log('Candidat ajouté aux favoris:', result);
      return { success: true, message: 'Candidat ajouté aux favoris' };
    } catch (err) {
      console.error('Erreur lors de l\'ajout aux favoris:', err);
      
      // En cas d'erreur, retirer le candidat des favoris locaux
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== candidateId));
      setError('Erreur lors de l\'ajout aux favoris');
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isFavorited]);

  // Retirer un candidat des favoris avec mise à jour optimiste
  const removeFromFavoritesOptimistic = useCallback(async (candidateId) => {
    // Vérifier si le candidat est en favori
    if (!isFavorited(candidateId)) {
      return { success: true, message: 'Candidat n\'était pas en favori' };
    }

    // Mise à jour optimiste immédiate
    setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== candidateId));
    setIsLoading(true);
    setError(null);

    try {
      // Appel API en arrière-plan
      const result = await removeFromFavorites(candidateId);
      
      console.log('Candidat retiré des favoris:', result);
      return { success: true, message: 'Candidat retiré des favoris' };
    } catch (err) {
      console.error('Erreur lors de la suppression des favoris:', err);
      
      // En cas d'erreur, recharger les favoris pour restaurer l'état correct
      // Note: Dans un vrai système, on pourrait recharger seulement ce candidat
      setError('Erreur lors de la suppression des favoris');
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isFavorited]);

  // Toggle favori avec mise à jour optimiste
  const toggleFavorite = useCallback(async (candidate) => {
    const candidateId = candidate.id;
    
    if (isFavorited(candidateId)) {
      return await removeFromFavoritesOptimistic(candidateId);
    } else {
      return await addToFavoritesOptimistic(candidate);
    }
  }, [isFavorited, addToFavoritesOptimistic, removeFromFavoritesOptimistic]);

  // Synchroniser les favoris avec le serveur (pour vérifier la cohérence)
  const syncFavorites = useCallback(async (candidateIds) => {
    try {
      setIsLoading(true);
      setError(null);

      const favoritesStatus = await Promise.all(
        candidateIds.map(async (candidateId) => {
          const isFav = await checkIfFavorited(candidateId);
          return { candidateId, isFavorited: isFav };
        })
      );

      // Mettre à jour l'état local selon les données du serveur
      const serverFavorites = favoritesStatus
        .filter(status => status.isFavorited)
        .map(status => status.candidateId);

      setFavoritesSet(new Set(serverFavorites));
      
      console.log('Favoris synchronisés avec le serveur');
      return serverFavorites;
    } catch (err) {
      console.error('Erreur lors de la synchronisation des favoris:', err);
      setError('Erreur lors de la synchronisation des favoris');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les favoris depuis une source externe (ex: données Kanban)
  const loadFavorites = useCallback((favoritesData) => {
    if (Array.isArray(favoritesData)) {
      setFavorites(favoritesData);
      setError(null);
    }
  }, []);

  // Obtenir les statistiques des favoris
  const getFavoritesStats = useCallback(() => {
    return {
      total: favorites.length,
      byStatus: favorites.reduce((acc, fav) => {
        const status = fav.status || 'À contacter';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    };
  }, [favorites]);

  return {
    // État
    favorites,
    favoritesSet,
    isLoading,
    error,
    
    // Actions
    addToFavorites: addToFavoritesOptimistic,
    removeFromFavorites: removeFromFavoritesOptimistic,
    toggleFavorite,
    syncFavorites,
    loadFavorites,
    
    // Utilitaires
    isFavorited,
    getFavoritesStats,
    clearError: () => setError(null)
  };
}
