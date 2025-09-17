import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authenticatedFetch } from '../utils/auth';
import { buildApiUrl } from '../config/api';

export default function CandidateProfileGuard({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated || user?.user_metadata?.role !== 'candidate') {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [CandidateProfileGuard] Vérification du profil candidat...');
        
        // Utiliser le helper d'authentification pour faire l'appel API
        const response = await authenticatedFetch(buildApiUrl('/api/candidates'));

        console.log('📡 [CandidateProfileGuard] Réponse API:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (response.ok) {
          const data = await response.json();
          // Chercher un profil avec l'email correspondant (plus fiable que l'UUID)
          const userProfile = data.candidates?.find(candidate => candidate.email === user.email);
          setHasProfile(!!userProfile);
          console.log('✅ [CandidateProfileGuard] Profil trouvé:', !!userProfile, 'pour email:', user.email);
        } else if (response.status === 404) {
          // Si 404, cela signifie qu'il n'y a pas encore de profils dans la base
          setHasProfile(false);
          console.log('📭 [CandidateProfileGuard] Aucun candidat dans la base (404)');
        } else if (response.status === 401) {
          console.log('🔐 [CandidateProfileGuard] Erreur d\'authentification (401)');
          // Essayer de récupérer les détails de l'erreur
          try {
            const errorData = await response.json();
            console.log('🔍 [CandidateProfileGuard] Détails erreur 401:', errorData);
          } catch (e) {
            console.log('🔍 [CandidateProfileGuard] Impossible de lire les détails de l\'erreur');
          }
          setHasProfile(false);
        } else {
          console.log('❌ [CandidateProfileGuard] Erreur inattendue:', response.status);
          setHasProfile(false);
        }
      } catch (error) {
        console.error('❌ [CandidateProfileGuard] Erreur lors de la vérification du profil:', error);
        
        // Si c'est une erreur d'authentification, afficher un message plus détaillé
        if (error.message.includes('Authentification échouée')) {
          console.log('🔐 [CandidateProfileGuard] Problème d\'authentification détecté');
          // Optionnel : forcer une nouvelle tentative de connexion
          // await supabase.auth.refreshSession();
        }
        
        // En cas d'erreur, on considère qu'il n'y a pas de profil
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre profil...</p>
        </div>
      </div>
    );
  }

  // Si c'est un candidat sans profil, afficher le contenu normal sans aucun message
  // L'utilisateur peut naviguer librement

  return children;
}
