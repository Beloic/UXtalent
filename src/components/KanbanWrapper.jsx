import React from 'react';
import CandidateKanban from './CandidateKanban';
import { useKanbanData } from '../hooks/useKanbanData';

/**
 * Wrapper pour le composant Kanban qui utilise le hook useKanbanData
 * pour une gestion optimiste des données
 */
const KanbanWrapper = ({ 
  // Props pour compatibilité avec l'ancien système
  candidates, 
  onUpdateStatus, 
  onToggleFavorite, 
  favorites, 
  onRefreshCandidates, 
  appointments = [],
  // Props spécifiques au wrapper
  onError = null,
  onSuccess = null
}) => {
  const {
    kanbanData,
    isLoading,
    error,
    lastUpdated,
    loadKanbanData,
    moveCandidate,
    updateNotes,
    addToFavorites,
    removeFromFavorites,
    clearError
  } = useKanbanData({
    autoLoad: true,
    onError: onError || ((err) => console.error('Erreur Kanban:', err)),
    onSuccess: onSuccess || ((data) => console.log('Données Kanban chargées:', data))
  });

  // Fonction pour gérer les changements de données Kanban
  const handleKanbanDataChange = (newData) => {
    // Cette fonction peut être utilisée pour des mises à jour manuelles si nécessaire
    console.log('Données Kanban mises à jour:', newData);
  };

  // Fonction pour gérer le déplacement des candidats
  const handleMoveCandidate = async (candidateId, fromColumn, toColumn, toIndex) => {
    try {
      await moveCandidate(candidateId, fromColumn, toColumn, toIndex);
    } catch (err) {
      console.error('Erreur lors du déplacement:', err);
    }
  };

  // Fonction pour gérer la mise à jour des notes
  const handleUpdateNotes = async (candidateId, notes) => {
    try {
      await updateNotes(candidateId, notes);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des notes:', err);
      throw err; // Re-throw pour que le modal puisse gérer l'erreur
    }
  };

  // Fonction pour gérer les favoris
  const handleToggleFavorite = async (candidateId, isFavorited) => {
    try {
      if (isFavorited) {
        await removeFromFavorites(candidateId);
      } else {
        await addToFavorites(candidateId);
      }
    } catch (err) {
      console.error('Erreur lors de la modification des favoris:', err);
    }
  };

  // Fonction pour recharger les données
  const handleRefresh = async () => {
    try {
      await loadKanbanData();
    } catch (err) {
      console.error('Erreur lors du rechargement:', err);
    }
  };

  // Afficher un indicateur de chargement si les données ne sont pas encore chargées
  if (isLoading && !kanbanData) {
    return (
      <div className="p-6 w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données Kanban...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error && !kanbanData) {
    return (
      <div className="p-6 w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Indicateur de dernière mise à jour */}
      {lastUpdated && (
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm z-10">
          Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
        </div>
      )}

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute top-2 left-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded z-10">
          <div className="flex items-center gap-2">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Composant Kanban */}
      <CandidateKanban
        // Props pour compatibilité avec l'ancien système
        candidates={candidates}
        onUpdateStatus={onUpdateStatus}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
        onRefreshCandidates={onRefreshCandidates}
        appointments={appointments}
        
        // Nouvelles props pour la gestion centralisée
        kanbanData={kanbanData}
        onKanbanDataChange={handleKanbanDataChange}
        
        // Props pour les nouvelles fonctions
        onMoveCandidate={handleMoveCandidate}
        onUpdateNotes={handleUpdateNotes}
        onToggleFavoriteNew={handleToggleFavorite}
        onRefresh={handleRefresh}
        
        // État de chargement
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default KanbanWrapper;
