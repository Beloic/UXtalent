import React, { createContext, useContext, useState, useCallback } from 'react';

const ProfileCacheContext = createContext();

export const useProfileCache = () => {
  const context = useContext(ProfileCacheContext);
  if (!context) {
    throw new Error('useProfileCache must be used within a ProfileCacheProvider');
  }
  return context;
};

export const ProfileCacheProvider = ({ children }) => {
  const [profileCache, setProfileCache] = useState({
    data: null,
    lastUpdated: null,
    isLoading: false
  });

  // Fonction pour mettre à jour le cache avec les données du profil
  const updateProfileCache = useCallback((profileData) => {
    setProfileCache({
      data: profileData,
      lastUpdated: Date.now(),
      isLoading: false
    });
  }, []);

  // Fonction pour marquer le cache comme en cours de chargement
  const setCacheLoading = useCallback((loading) => {
    setProfileCache(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  // Fonction pour vérifier si le cache est encore valide (moins de 5 minutes)
  const isCacheValid = useCallback(() => {
    if (!profileCache.lastUpdated) return false;
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes en millisecondes
    return (Date.now() - profileCache.lastUpdated) < fiveMinutes;
  }, [profileCache.lastUpdated]);

  // Fonction pour obtenir les données du cache si elles sont valides
  const getCachedData = useCallback(() => {
    if (isCacheValid() && profileCache.data) {
      return profileCache.data;
    }
    return null;
  }, [profileCache.data, isCacheValid]);

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    setProfileCache({
      data: null,
      lastUpdated: null,
      isLoading: false
    });
  }, []);

  // Fonction pour forcer le rechargement (vider le cache)
  const forceReload = useCallback(() => {
    clearCache();
  }, [clearCache]);

  const value = {
    profileCache,
    updateProfileCache,
    setCacheLoading,
    isCacheValid,
    getCachedData,
    clearCache,
    forceReload
  };

  return (
    <ProfileCacheContext.Provider value={value}>
      {children}
    </ProfileCacheContext.Provider>
  );
};
