import React, { useState, useEffect } from 'react';
import { Heart, HeartOff, Loader2, Check, X } from 'lucide-react';
import { useFavoritesOptimized } from '../hooks/useFavoritesOptimized';

/**
 * Composant pour gérer les favoris avec interface optimisée
 */
const FavoritesManager = ({ 
  candidate, 
  onToggle = null,
  showStats = false,
  size = 'default' // 'small', 'default', 'large'
}) => {
  const {
    favorites,
    isLoading,
    error,
    isFavorited,
    toggleFavorite,
    getFavoritesStats,
    clearError
  } = useFavoritesOptimized();

  const [isToggling, setIsToggling] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // Charger les favoris depuis les données Kanban si disponibles
  useEffect(() => {
    if (candidate && candidate.favorites) {
      // Note: Dans un vrai système, on chargerait les favoris depuis les données Kanban
      // loadFavorites(candidate.favorites);
    }
  }, [candidate]);

  const handleToggle = async () => {
    if (!candidate || isToggling) return;

    setIsToggling(true);
    setLastAction(null);

    try {
      const result = await toggleFavorite(candidate);
      setLastAction({
        type: 'success',
        message: result.message
      });

      // Appeler la fonction de callback si fournie
      if (onToggle) {
        onToggle(candidate.id, !isFavorited(candidate.id));
      }

      // Effacer le message après 3 secondes
      setTimeout(() => setLastAction(null), 3000);
    } catch (err) {
      setLastAction({
        type: 'error',
        message: err.message || 'Erreur lors de la modification des favoris'
      });

      // Effacer le message après 5 secondes
      setTimeout(() => setLastAction(null), 5000);
    } finally {
      setIsToggling(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "flex items-center gap-2 transition-all duration-200 rounded-lg";
    const sizeClasses = {
      small: "px-2 py-1 text-xs",
      default: "px-3 py-2 text-sm",
      large: "px-4 py-3 text-base"
    };

    const stateClasses = isFavorited(candidate?.id) 
      ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200";

    const loadingClasses = isToggling ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm";

    return `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${loadingClasses}`;
  };

  const getIconSize = () => {
    const sizes = {
      small: "w-3 h-3",
      default: "w-4 h-4",
      large: "w-5 h-5"
    };
    return sizes[size];
  };

  if (!candidate) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bouton de toggle */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={getButtonClasses()}
        title={isFavorited(candidate.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {isToggling ? (
          <Loader2 className={`${getIconSize()} animate-spin`} />
        ) : isFavorited(candidate.id) ? (
          <Heart className={`${getIconSize()} fill-current`} />
        ) : (
          <HeartOff className={getIconSize()} />
        )}
        
        <span className="hidden sm:inline">
          {isFavorited(candidate.id) ? 'Favori' : 'Ajouter'}
        </span>
      </button>

      {/* Message de feedback */}
      {lastAction && (
        <div className={`absolute top-full left-0 mt-2 px-3 py-2 rounded-lg shadow-lg z-50 ${
          lastAction.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {lastAction.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{lastAction.message}</span>
          </div>
        </div>
      )}

      {/* Statistiques des favoris */}
      {showStats && (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Statistiques des favoris</div>
          <div className="text-sm text-gray-700">
            Total: {getFavoritesStats().total} favoris
          </div>
        </div>
      )}

      {/* Indicateur d'erreur global */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesManager;
