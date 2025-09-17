import { buildApiUrl } from '../config/api';
import { supabase } from '../lib/supabase';

/**
 * Service API pour les actions Kanban
 * Centralise toutes les interactions avec les endpoints Kanban
 */

/**
 * Récupérer les données complètes du Kanban
 * @returns {Promise<Object>} Données du Kanban avec candidats, favoris et rendez-vous
 */
export async function getKanbanData() {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(buildApiUrl('/api/recruiter/kanban/data'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la récupération des données Kanban');
    }

    const data = await response.json();
    return data.data; // Retourner directement les données
  } catch (error) {
    console.error('Erreur lors de la récupération des données Kanban:', error);
    throw error;
  }
}

/**
 * Déplacer un candidat dans le Kanban
 * @param {string|number} candidateId - ID du candidat
 * @param {string} fromColumn - Colonne source
 * @param {string} toColumn - Colonne destination
 * @param {number} toIndex - Index de destination (optionnel)
 * @returns {Promise<Object>} Résultat du déplacement
 */
export async function moveCandidateInKanban(candidateId, fromColumn, toColumn, toIndex = null) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(buildApiUrl('/api/recruiter/kanban/move-candidate'), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidateId,
        fromColumn,
        toColumn,
        toIndex
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors du déplacement du candidat');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors du déplacement du candidat:', error);
    throw error;
  }
}

/**
 * Mettre à jour les notes d'un candidat
 * @param {string|number} candidateId - ID du candidat
 * @param {string} notes - Notes à sauvegarder
 * @returns {Promise<Object>} Résultat de la sauvegarde
 */
export async function updateCandidateNotes(candidateId, notes) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(buildApiUrl(`/api/candidates/${candidateId}/notes`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notes })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde des notes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notes:', error);
    throw error;
  }
}

/**
 * Ajouter un candidat aux favoris
 * @param {string|number} candidateId - ID du candidat
 * @returns {Promise<Object>} Résultat de l'ajout
 */
export async function addToFavorites(candidateId) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(buildApiUrl(`/api/recruiter/favorites/${candidateId}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de l\'ajout aux favoris');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    throw error;
  }
}

/**
 * Retirer un candidat des favoris
 * @param {string|number} candidateId - ID du candidat
 * @returns {Promise<Object>} Résultat de la suppression
 */
export async function removeFromFavorites(candidateId) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(buildApiUrl(`/api/recruiter/favorites/${candidateId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la suppression des favoris');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error);
    throw error;
  }
}

/**
 * Vérifier si un candidat est en favori
 * @param {string|number} candidateId - ID du candidat
 * @returns {Promise<boolean>} True si le candidat est en favori
 */
export async function checkIfFavorited(candidateId) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      return false;
    }

    const response = await fetch(buildApiUrl(`/api/recruiter/favorites/${candidateId}/check`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isFavorited || false;
  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error);
    return false;
  }
}

/**
 * Obtenir les transitions autorisées pour un candidat
 * @param {string|number} candidateId - ID du candidat
 * @returns {Promise<Object>} Transitions autorisées
 */
export async function getCandidateTransitions(candidateId) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(buildApiUrl(`/api/recruiter/kanban/candidate/${candidateId}/transitions`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la récupération des transitions');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des transitions:', error);
    throw error;
  }
}

/**
 * Valider une transition de statut avant de l'effectuer
 * @param {string|number} candidateId - ID du candidat
 * @param {string} targetStatus - Statut cible
 * @returns {Promise<boolean>} True si la transition est autorisée
 */
export async function validateTransition(candidateId, targetStatus) {
  try {
    const transitions = await getCandidateTransitions(candidateId);
    const targetTransition = transitions.availableTransitions.find(t => t.status === targetStatus);
    return targetTransition ? targetTransition.allowed : false;
  } catch (error) {
    console.error('Erreur lors de la validation de la transition:', error);
    return false;
  }
}
