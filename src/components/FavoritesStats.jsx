import React from 'react';
import { Heart, Users, TrendingUp } from 'lucide-react';

/**
 * Composant pour afficher les statistiques des favoris
 */
const FavoritesStats = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { total, byStatus } = stats;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-gray-800">Favoris</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total</span>
          <span className="font-bold text-lg text-gray-800">{total}</span>
        </div>
        
        {Object.keys(byStatus).length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500 mb-2">Par statut</div>
            <div className="space-y-1">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{status}</span>
                  <span className="text-sm font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesStats;
