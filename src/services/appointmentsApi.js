import { supabase } from '../lib/supabase';

const API_BASE_URL = 'https://ux-jobs-pro-backend.onrender.com/api';

// Fonction utilitaire pour obtenir le token d'authentification
const getAuthToken = async () => {
  const session = await supabase.auth.getSession();
  return session.data.session?.access_token;
};

// Charger tous les rendez-vous du recruteur
export const loadAppointments = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token d\'authentification manquant');

    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 503 && errorData.error?.includes('Table appointments non trouvée')) {
        throw new Error('Table appointments non trouvée. Veuillez créer la table dans Supabase.');
      }
      
      throw new Error(errorData.error || 'Erreur lors du chargement des rendez-vous');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement des rendez-vous:', error);
    throw error;
  }
};

// Créer un nouveau rendez-vous
export const createAppointment = async (appointmentData) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token d\'authentification manquant');

    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 503 && errorData.error?.includes('Table appointments non trouvée')) {
        throw new Error('Table appointments non trouvée. Veuillez créer la table dans Supabase.');
      }
      
      throw new Error(errorData.error || 'Erreur lors de la création du rendez-vous');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    throw error;
  }
};

// Mettre à jour un rendez-vous
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token d\'authentification manquant');

    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la mise à jour du rendez-vous');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    throw error;
  }
};

// Supprimer un rendez-vous
export const deleteAppointment = async (appointmentId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token d\'authentification manquant');

    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la suppression du rendez-vous');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    throw error;
  }
};

// Obtenir les rendez-vous d'un candidat
export const getAppointmentsForCandidate = async (candidateId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token d\'authentification manquant');

    const response = await fetch(`${API_BASE_URL}/appointments/candidate/${candidateId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des rendez-vous du candidat');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement des rendez-vous du candidat:', error);
    throw error;
  }
};

// Obtenir le prochain rendez-vous d'un candidat
export const getNextAppointmentForCandidate = async (candidateId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token d\'authentification manquant');

    const response = await fetch(`${API_BASE_URL}/appointments/candidate/${candidateId}/next`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement du prochain rendez-vous');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement du prochain rendez-vous:', error);
    throw error;
  }
};
