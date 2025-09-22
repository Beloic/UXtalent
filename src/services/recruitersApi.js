import { buildApiUrl } from '../config/api';
import { supabase } from '../lib/supabase';

// Service API pour la gestion des recruteurs
export class RecruitersApiService {
  
  // Récupérer le profil du recruteur connecté
  static async getMyProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters/me'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du profil recruteur:', error);
      throw error;
    }
  }
  
  // Récupérer les statistiques du recruteur connecté
  static async getMyStats(recruiterId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${recruiterId}/stats`), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
  
  // Mettre à jour le profil du recruteur connecté
  static async updateMyProfile(profileData) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters/me'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
  
  // Vérifier les permissions du recruteur connecté
  static async getMyPermissions(recruiterId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${recruiterId}/permissions`), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      throw error;
    }
  }
  
  // Récupérer un recruteur par ID (admin seulement)
  static async getRecruiterById(id) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${id}`), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du recruteur:', error);
      throw error;
    }
  }
  
  // Récupérer tous les recruteurs (admin seulement)
  static async getAllRecruiters() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des recruteurs:', error);
      throw error;
    }
  }
  
  // Créer un nouveau recruteur (admin seulement)
  static async createRecruiter(recruiterData) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recruiterData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du recruteur:', error);
      throw error;
    }
  }
  
  // Mettre à jour un recruteur par ID
  static async updateRecruiter(id, recruiterData) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recruiterData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du recruteur:', error);
      throw error;
    }
  }
  
  // Supprimer un recruteur (admin seulement)
  static async deleteRecruiter(id) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression du recruteur:', error);
      throw error;
    }
  }
  
  // Mettre à jour le plan d'un recruteur (admin seulement)
  static async updateRecruiterPlan(id, planType, subscriptionData = {}) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${id}/plan`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planType,
          subscriptionData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      throw error;
    }
  }
  
  // Annuler l'abonnement d'un recruteur
  static async cancelSubscription(recruiterId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl(`/api/recruiters/${recruiterId}/cancel-subscription`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  }
  
  // Incrémenter le compteur d'offres publiées
  static async incrementJobPosts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters/me/increment-job-posts'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des offres:', error);
      throw error;
    }
  }
  
  // Incrémenter le compteur de candidats contactés
  static async incrementCandidateContacts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(buildApiUrl('/api/recruiters/me/increment-candidate-contacts'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des contacts:', error);
      throw error;
    }
  }
}

// Fonctions simplifiées pour le hook useRecruiter
export const fetchRecruiterProfile = async () => {
  // Utiliser directement l'endpoint /me
  return await RecruitersApiService.getMyProfile();
};

export const fetchRecruiterStats = async (recruiterId) => {
  return await RecruitersApiService.getMyStats(recruiterId);
};

export const fetchRecruiterPermissions = async (recruiterId) => {
  return await RecruitersApiService.getMyPermissions(recruiterId);
};

export const incrementRecruiterJobPosts = async (recruiterId) => {
  return await RecruitersApiService.incrementJobPosts();
};

export const incrementRecruiterCandidateContacts = async (recruiterId) => {
  return await RecruitersApiService.incrementCandidateContacts();
};

// Export des fonctions individuelles pour faciliter l'utilisation
export const {
  getMyProfile,
  getMyStats,
  updateMyProfile,
  getMyPermissions,
  getRecruiterById,
  getAllRecruiters,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
  updateRecruiterPlan,
  incrementJobPosts,
  incrementCandidateContacts
} = RecruitersApiService;
