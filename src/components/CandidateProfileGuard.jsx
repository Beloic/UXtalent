import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
        // Vérifier si le candidat a déjà un profil dans la base de données
        const response = await fetch('http://localhost:3001/api/candidates', {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Chercher un profil avec l'userId correspondant
          const userProfile = data.candidates?.find(candidate => candidate.userId === user.id);
          setHasProfile(!!userProfile);
        } else if (response.status === 404) {
          // Si 404, cela signifie qu'il n'y a pas encore de profils dans la base
          setHasProfile(false);
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du profil:', error);
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
