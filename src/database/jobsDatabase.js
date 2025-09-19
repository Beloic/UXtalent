import { supabaseAdmin } from './supabaseClient.js';

// ===== JOBS =====

export const loadJobs = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = (data || []).map(job => ({
      ...job,
      postedAt: job.created_at,
      updatedAt: job.updated_at,
      viewsCount: job.views_count || 0,
      applicationsCount: job.applications_count || 0,
      recruiterId: job.recruiter_id
    }));
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du chargement des offres:', error);
    return [];
  }
};

export const getJobById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();
    
    if (error) throw error;
    
    if (data) {
      // Incrémenter le compteur de vues
      await incrementJobViews(id);
      
      // Mapper les noms de colonnes
      return {
        ...data,
        postedAt: data.created_at,
        updatedAt: data.updated_at,
        viewsCount: data.views_count || 0,
        applicationsCount: data.applications_count || 0,
        recruiterId: data.recruiter_id
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'offre:', error);
    return null;
  }
};

export const createJob = async (jobData, recruiterId) => {
  try {
    // Convertir les noms de colonnes de camelCase vers snake_case pour Supabase
    const dbData = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      remote: jobData.remote,
      type: jobData.type,
      seniority: jobData.seniority,
      salary: jobData.salary || null,
      description: jobData.description,
      requirements: jobData.requirements || null,
      benefits: jobData.benefits || null,
      tags: jobData.tags || [],
      recruiter_id: recruiterId,
      status: 'active', // Publication immédiate sans validation
      views_count: 0,
      applications_count: 0
    };
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert([dbData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data,
      postedAt: data.created_at,
      updatedAt: data.updated_at,
      viewsCount: data.views_count || 0,
      applicationsCount: data.applications_count || 0,
      recruiterId: data.recruiter_id
    };
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    throw error;
  }
};

export const updateJob = async (id, jobData, recruiterId) => {
  try {
    // Convertir les noms de colonnes de camelCase vers snake_case pour Supabase
    const dbData = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      remote: jobData.remote,
      type: jobData.type,
      seniority: jobData.seniority,
      salary: jobData.salary || null,
      description: jobData.description,
      requirements: jobData.requirements || null,
      benefits: jobData.benefits || null,
      tags: jobData.tags || []
    };
    
    // Si c'est l'admin (UUID spécial), permettre la modification sans vérifier la propriété
    const isAdmin = recruiterId === '00000000-0000-0000-0000-000000000000';
    
    let query = supabaseAdmin
      .from('jobs')
      .update(dbData)
      .eq('id', id);
    
    // Pour les recruteurs normaux, vérifier la propriété
    if (!isAdmin) {
      query = query.eq('recruiter_id', recruiterId);
    }
    
    const { data, error } = await query.select();
    
    if (error) throw error;
    
    // Vérifier qu'au moins une ligne a été mise à jour
    if (!data || data.length === 0) {
      throw new Error('Aucune offre trouvée avec cet ID ou vous n\'avez pas les permissions pour la modifier');
    }
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data[0],
      postedAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      viewsCount: data[0].views_count || 0,
      applicationsCount: data[0].applications_count || 0,
      recruiterId: data[0].recruiter_id
    };
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    throw error;
  }
};

export const deleteJob = async (id, recruiterId) => {
  try {
    // Si c'est l'admin (UUID spécial), permettre la suppression sans vérifier la propriété
    const isAdmin = recruiterId === '00000000-0000-0000-0000-000000000000';
    
    let query = supabaseAdmin
      .from('jobs')
      .delete() // Vraie suppression
      .eq('id', id);
    
    // Pour les recruteurs normaux, vérifier la propriété
    if (!isAdmin) {
      query = query.eq('recruiter_id', recruiterId);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    throw error;
  }
};

export const getRecruiterJobs = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = (data || []).map(job => ({
      ...job,
      postedAt: job.created_at,
      updatedAt: job.updated_at,
      viewsCount: job.views_count || 0,
      applicationsCount: job.applications_count || 0,
      recruiterId: job.recruiter_id
    }));
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du chargement des offres du recruteur:', error);
    return [];
  }
};

export const incrementJobViews = async (jobId) => {
  try {
    // Récupérer la valeur actuelle
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('jobs')
      .select('views_count')
      .eq('id', jobId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Incrémenter la valeur
    const { error } = await supabaseAdmin
      .from('jobs')
      .update({ views_count: (job.views_count || 0) + 1 })
      .eq('id', jobId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    return false;
  }
};

export const incrementJobApplications = async (jobId) => {
  try {
    // Récupérer la valeur actuelle
    const { data: currentJob, error: fetchError } = await supabaseAdmin
      .from('jobs')
      .select('applications_count')
      .eq('id', jobId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Incrémenter la valeur
    const { error } = await supabaseAdmin
      .from('jobs')
      .update({ applications_count: (currentJob?.applications_count || 0) + 1 })
      .eq('id', jobId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des candidatures:', error);
    return false;
  }
};

export const getJobStats = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('status');
    
    if (error) throw error;
    
    const stats = {
      total: data?.length || 0,
      active: data?.filter(job => job.status === 'active').length || 0,
      pending: data?.filter(job => job.status === 'pending_approval').length || 0,
      rejected: data?.filter(job => job.status === 'rejected').length || 0,
      paused: data?.filter(job => job.status === 'paused').length || 0
    };
    
    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques des offres:', error);
    return { total: 0, active: 0, pending: 0, rejected: 0, paused: 0 };
  }
};

// Nouvelles fonctions pour la validation des offres

export const getPendingJobs = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = (data || []).map(job => ({
      ...job,
      postedAt: job.created_at,
      updatedAt: job.updated_at,
      viewsCount: job.views_count || 0,
      applicationsCount: job.applications_count || 0,
      recruiterId: job.recruiter_id
    }));
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du chargement des offres en attente:', error);
    return [];
  }
};

export const approveJob = async (jobId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update({ 
        status: 'active',
        approved_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data,
      postedAt: data.created_at,
      updatedAt: data.updated_at,
      viewsCount: data.views_count || 0,
      applicationsCount: data.applications_count || 0,
      recruiterId: data.recruiter_id
    };
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de l\'approbation de l\'offre:', error);
    throw error;
  }
};

export const rejectJob = async (jobId, reason = null) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data,
      postedAt: data.created_at,
      updatedAt: data.updated_at,
      viewsCount: data.views_count || 0,
      applicationsCount: data.applications_count || 0,
      recruiterId: data.recruiter_id
    };
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du rejet de l\'offre:', error);
    throw error;
  }
};

export const pauseJob = async (jobId, recruiterId) => {
  try {
    // Si c'est l'admin (UUID spécial), permettre la mise en pause sans vérifier la propriété
    const isAdmin = recruiterId === '00000000-0000-0000-0000-000000000000';
    
    let query = supabaseAdmin
      .from('jobs')
      .update({ 
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    // Pour les recruteurs normaux, vérifier la propriété
    if (!isAdmin) {
      query = query.eq('recruiter_id', recruiterId);
    }
    
    const { data, error } = await query.select();
    
    if (error) throw error;
    
    // Vérifier qu'au moins une ligne a été mise à jour
    if (!data || data.length === 0) {
      throw new Error('Aucune offre trouvée avec cet ID ou vous n\'avez pas les permissions pour la mettre en pause');
    }
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data[0],
      postedAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      viewsCount: data[0].views_count || 0,
      applicationsCount: data[0].applications_count || 0,
      recruiterId: data[0].recruiter_id
    };
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de la mise en pause de l\'offre:', error);
    throw error;
  }
};

export const resumeJob = async (jobId, recruiterId) => {
  try {
    // Si c'est l'admin (UUID spécial), permettre la reprise sans vérifier la propriété
    const isAdmin = recruiterId === '00000000-0000-0000-0000-000000000000';
    
    let query = supabaseAdmin
      .from('jobs')
      .update({ 
        status: 'active',
        resumed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    // Pour les recruteurs normaux, vérifier la propriété
    if (!isAdmin) {
      query = query.eq('recruiter_id', recruiterId);
    }
    
    const { data, error } = await query.select();
    
    if (error) throw error;
    
    // Vérifier qu'au moins une ligne a été mise à jour
    if (!data || data.length === 0) {
      throw new Error('Aucune offre trouvée avec cet ID ou vous n\'avez pas les permissions pour la reprendre');
    }
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data[0],
      postedAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      viewsCount: data[0].views_count || 0,
      applicationsCount: data[0].applications_count || 0,
      recruiterId: data[0].recruiter_id
    };
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de la reprise de l\'offre:', error);
    throw error;
  }
};

export const getAllJobsForAdmin = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = (data || []).map(job => ({
      ...job,
      postedAt: job.created_at,
      updatedAt: job.updated_at,
      viewsCount: job.views_count || 0,
      applicationsCount: job.applications_count || 0,
      recruiterId: job.recruiter_id
    }));
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du chargement de toutes les offres:', error);
    return [];
  }
};

// Fonction spécifique pour l'admin qui récupère toutes les offres (pas seulement les actives)
export const loadAllJobsForAdmin = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = (data || []).map(job => ({
      ...job,
      postedAt: job.created_at,
      updatedAt: job.updated_at,
      viewsCount: job.views_count || 0,
      applicationsCount: job.applications_count || 0,
      recruiterId: job.recruiter_id
    }));
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du chargement de toutes les offres pour l\'admin:', error);
    return [];
  }
};
