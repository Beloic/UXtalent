import { supabase, supabaseAdmin } from './supabaseClient.js';

// ===== FONCTIONS POUR LES RECHERCHES DE RECRUTEURS =====

// Récupérer toutes les recherches d'un recruteur
export const getRecruiterSearches = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_searches')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des recherches:', error);
    return [];
  }
};

// Créer une nouvelle recherche
export const createRecruiterSearch = async (searchData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_searches')
      .insert([searchData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la recherche:', error);
    throw error;
  }
};

// Mettre à jour une recherche
export const updateRecruiterSearch = async (searchId, searchData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_searches')
      .update(searchData)
      .eq('id', searchId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la recherche:', error);
    throw error;
  }
};

// Supprimer une recherche
export const deleteRecruiterSearch = async (searchId) => {
  try {
    const { error } = await supabaseAdmin
      .from('recruiter_searches')
      .delete()
      .eq('id', searchId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la recherche:', error);
    throw error;
  }
};

// Récupérer une recherche spécifique
export const getRecruiterSearchById = async (searchId, recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_searches')
      .select('*')
      .eq('id', searchId)
      .eq('recruiter_id', recruiterId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la recherche:', error);
    return null;
  }
};

// ===== FONCTIONS POUR LES ENTREPRISES DE RECRUTEURS =====

// Récupérer l'entreprise d'un recruteur
export const getRecruiterCompany = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_companies')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    return null;
  }
};

// Créer ou mettre à jour l'entreprise d'un recruteur
export const upsertRecruiterCompany = async (companyData, authenticatedUserId) => {
  try {
    // SÉCURITÉ : Vérifier que l'utilisateur authentifié correspond au recruiter_id
    if (companyData.recruiter_id !== authenticatedUserId) {
      throw new Error('Accès non autorisé : vous ne pouvez modifier que votre propre entreprise');
    }

    // Vérifier d'abord si l'entreprise existe
    const { data: existingCompany, error: checkError } = await supabaseAdmin
      .from('recruiter_companies')
      .select('*')
      .eq('recruiter_id', companyData.recruiter_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;
    if (existingCompany) {
      // Mettre à jour l'entreprise existante
      const { data, error } = await supabaseAdmin
        .from('recruiter_companies')
        .update(companyData)
        .eq('recruiter_id', companyData.recruiter_id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Créer une nouvelle entreprise
      const { data, error } = await supabaseAdmin
        .from('recruiter_companies')
        .insert(companyData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'entreprise:', error);
    throw error;
  }
};

// Supprimer l'entreprise d'un recruteur
export const deleteRecruiterCompany = async (recruiterId) => {
  try {
    const { error } = await supabaseAdmin
      .from('recruiter_companies')
      .delete()
      .eq('recruiter_id', recruiterId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entreprise:', error);
    throw error;
  }
};

// ===== FONCTIONS UTILITAIRES =====

// Récupérer les statistiques des recherches d'un recruteur
export const getRecruiterSearchStats = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiter_searches')
      .select('status')
      .eq('recruiter_id', recruiterId);
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      active: data.filter(s => s.status === 'active').length,
      paused: data.filter(s => s.status === 'paused').length,
      completed: data.filter(s => s.status === 'completed').length,
      archived: data.filter(s => s.status === 'archived').length
    };
    
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return { total: 0, active: 0, paused: 0, completed: 0, archived: 0 };
  }
};

// Rechercher des candidats basés sur les critères d'une recherche
export const searchCandidatesByCriteria = async (searchCriteria) => {
  try {
    let query = supabase
      .from('candidates')
      .select('*')
      .eq('status', 'approved');
    
    // Filtrage par type de profil
    if (searchCriteria.profile_type) {
      query = query.ilike('title', `%${searchCriteria.profile_type}%`);
    }
    
    // Filtrage par niveau d'expérience
    if (searchCriteria.experience_level) {
      query = query.eq('experience', searchCriteria.experience_level);
    }
    
    // Filtrage par préférence de travail à distance
    if (searchCriteria.remote_preference) {
      query = query.eq('remote', searchCriteria.remote_preference);
    }
    
    // Filtrage par localisation
    if (searchCriteria.location_preference) {
      query = query.ilike('location', `%${searchCriteria.location_preference}%`);
    }
    
    // Filtrage par disponibilité
    if (searchCriteria.availability_preference) {
      query = query.eq('availability', searchCriteria.availability_preference);
    }
    
    // Filtrage par compétences (si spécifiées)
    if (searchCriteria.required_skills && searchCriteria.required_skills.length > 0) {
      query = query.overlaps('skills', searchCriteria.required_skills);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Trier par plan : Pro en premier, puis Premium, puis Free
    const sortedCandidates = (data || []).sort((a, b) => {
      const planPriority = { 'pro': 3, 'premium': 2, 'free': 1 };
      const aPriority = planPriority[a.plan_type] || 1;
      const bPriority = planPriority[b.plan_type] || 1;
      
      // Si même plan, trier par date de création (plus récent en premier)
      if (aPriority === bPriority) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      
      return bPriority - aPriority;
    });
    
    return sortedCandidates;
  } catch (error) {
    console.error('Erreur lors de la recherche de candidats:', error);
    return [];
  }
};
