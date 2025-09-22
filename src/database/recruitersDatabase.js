import { supabaseAdmin } from './supabaseClient.js';

// ===== FONCTIONS POUR LES RECRUTEURS =====

// Récupérer un recruteur par email (OPTIMISÉ)
export const getRecruiterByEmail = async (email) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .select(`
        id,
        email,
        name,
        company,
        phone,
        website,
        plan_type,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        trial_end_date,
        stripe_customer_id,
        stripe_subscription_id,
        payment_method,
        max_job_posts,
        max_candidate_contacts,
        max_featured_jobs,
        status,
        notes,
        created_at,
        updated_at
      `)
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du recruteur:', error);
    return null;
  }
};

// Récupérer un recruteur par ID
export const getRecruiterById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du recruteur:', error);
    return null;
  }
};

// Créer un nouveau recruteur
export const createRecruiter = async (recruiterData) => {
  try {
    const dbData = {
      email: recruiterData.email,
      name: recruiterData.name || null,
      company: recruiterData.company || null,
      phone: recruiterData.phone || null,
      website: recruiterData.website || null,
      plan_type: recruiterData.planType || 'starter',
      subscription_status: recruiterData.subscriptionStatus || 'active',
      subscription_start_date: recruiterData.subscriptionStartDate || null,
      subscription_end_date: recruiterData.subscriptionEndDate || null,
      trial_end_date: recruiterData.trialEndDate || null,
      stripe_customer_id: recruiterData.stripeCustomerId || null,
      stripe_subscription_id: recruiterData.stripeSubscriptionId || null,
      payment_method: recruiterData.paymentMethod || null,
      max_job_posts: recruiterData.maxJobPosts || 5,
      max_candidate_contacts: recruiterData.maxCandidateContacts || 100,
      max_featured_jobs: recruiterData.maxFeaturedJobs || 1,
      status: recruiterData.status || 'active',
      notes: recruiterData.notes || null
    };
    
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .insert([dbData])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la création du recruteur:', error);
    throw error;
  }
};

// Mettre à jour un recruteur
export const updateRecruiter = async (id, recruiterData) => {
  try {
    const updateData = {};
    
    // Mapper les champs camelCase vers snake_case
    if (recruiterData.name !== undefined) updateData.name = recruiterData.name;
    if (recruiterData.company !== undefined) updateData.company = recruiterData.company;
    if (recruiterData.phone !== undefined) updateData.phone = recruiterData.phone;
    if (recruiterData.website !== undefined) updateData.website = recruiterData.website;
    if (recruiterData.planType !== undefined) updateData.plan_type = recruiterData.planType;
    if (recruiterData.subscriptionStatus !== undefined) updateData.subscription_status = recruiterData.subscriptionStatus;
    if (recruiterData.subscriptionStartDate !== undefined) updateData.subscription_start_date = recruiterData.subscriptionStartDate;
    if (recruiterData.subscriptionEndDate !== undefined) updateData.subscription_end_date = recruiterData.subscriptionEndDate;
    if (recruiterData.trialEndDate !== undefined) updateData.trial_end_date = recruiterData.trialEndDate;
    if (recruiterData.stripeCustomerId !== undefined) updateData.stripe_customer_id = recruiterData.stripeCustomerId;
    if (recruiterData.stripeSubscriptionId !== undefined) updateData.stripe_subscription_id = recruiterData.stripeSubscriptionId;
    if (recruiterData.paymentMethod !== undefined) updateData.payment_method = recruiterData.paymentMethod;
    if (recruiterData.maxJobPosts !== undefined) updateData.max_job_posts = recruiterData.maxJobPosts;
    if (recruiterData.maxCandidateContacts !== undefined) updateData.max_candidate_contacts = recruiterData.maxCandidateContacts;
    if (recruiterData.maxFeaturedJobs !== undefined) updateData.max_featured_jobs = recruiterData.maxFeaturedJobs;
    if (recruiterData.status !== undefined) updateData.status = recruiterData.status;
    if (recruiterData.notes !== undefined) updateData.notes = recruiterData.notes;
    if (recruiterData.lastLogin !== undefined) updateData.last_login = recruiterData.lastLogin;
    
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du recruteur:', error);
    throw error;
  }
};

// Supprimer un recruteur
export const deleteRecruiter = async (id) => {
  try {
    const { error } = await supabaseAdmin
      .from('recruiters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du recruteur:', error);
    throw error;
  }
};

// Récupérer tous les recruteurs
export const getAllRecruiters = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des recruteurs:', error);
    return [];
  }
};

// Vérifier si un recruteur peut publier une offre
export const canRecruiterPostJob = async (recruiterId) => {
  try {
    const recruiter = await getRecruiterById(recruiterId);
    if (!recruiter) return false;
    
    // Vérifier si l'abonnement est actif
    if (recruiter.subscription_status !== 'active') return false;
    
    // Vérifier si la date d'expiration n'est pas dépassée
    if (recruiter.subscription_end_date && new Date(recruiter.subscription_end_date) < new Date()) {
      return false;
    }
    
    // Vérifier les quotas
    return recruiter.total_jobs_posted < recruiter.max_job_posts;
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return false;
  }
};

// Vérifier si un recruteur peut contacter un candidat
export const canRecruiterContactCandidate = async (recruiterId) => {
  try {
    const recruiter = await getRecruiterById(recruiterId);
    if (!recruiter) return false;
    
    // Vérifier si l'abonnement est actif
    if (recruiter.subscription_status !== 'active') return false;
    
    // Vérifier si la date d'expiration n'est pas dépassée
    if (recruiter.subscription_end_date && new Date(recruiter.subscription_end_date) < new Date()) {
      return false;
    }
    
    // Vérifier les quotas
    return recruiter.total_candidates_contacted < recruiter.max_candidate_contacts;
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return false;
  }
};

// Incrémenter le compteur d'offres publiées
export const incrementJobPosts = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .update({ 
        total_jobs_posted: supabaseAdmin.raw('total_jobs_posted + 1')
      })
      .eq('id', recruiterId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des offres:', error);
    throw error;
  }
};

// Incrémenter le compteur de candidats contactés
export const incrementCandidateContacts = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .update({ 
        total_candidates_contacted: supabaseAdmin.raw('total_candidates_contacted + 1')
      })
      .eq('id', recruiterId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des contacts:', error);
    throw error;
  }
};

// Mettre à jour le plan d'un recruteur
export const updateRecruiterPlan = async (recruiterId, planType, subscriptionData = {}) => {
  try {
    const updateData = {
      plan_type: planType,
      subscription_status: subscriptionData.status || 'active',
      subscription_start_date: subscriptionData.startDate || new Date().toISOString(),
      subscription_end_date: subscriptionData.endDate || null,
      stripe_customer_id: subscriptionData.stripeCustomerId || null,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId || null,
      payment_method: subscriptionData.paymentMethod || null
    };
    
    // Permettre de modifier le statut de compte (active/suspended/etc.)
    if (subscriptionData.accountStatus !== undefined) {
      updateData.status = subscriptionData.accountStatus;
    }
    
    // Définir les quotas selon le plan
    switch (planType) {
      case 'starter':
        updateData.max_job_posts = 5;
        updateData.max_candidate_contacts = 100;
        updateData.max_featured_jobs = 1;
        break;
      case 'max':
        updateData.max_job_posts = 50;
        updateData.max_candidate_contacts = 1000;
        updateData.max_featured_jobs = 10;
        break;
      case 'premium':
        updateData.max_job_posts = 999999; // Illimité
        updateData.max_candidate_contacts = 999999; // Illimité
        updateData.max_featured_jobs = 999999; // Illimité
        break;
      default:
        // Garder les valeurs existantes pour les plans personnalisés
        break;
    }

    // Si on résilie: quotas à 0 et suspension, quel que soit le plan (on utilise plan_type='custom')
    if ((subscriptionData.status === 'cancelled') || (subscriptionData.accountStatus === 'suspended')) {
      updateData.max_job_posts = 0;
      updateData.max_candidate_contacts = 0;
      updateData.max_featured_jobs = 0;
      if (!updateData.subscription_end_date) {
        updateData.subscription_end_date = new Date().toISOString();
      }
      updateData.subscription_status = subscriptionData.status || 'cancelled';
      updateData.status = subscriptionData.accountStatus || 'suspended';
    }
    
    const { data, error } = await supabaseAdmin
      .from('recruiters')
      .update(updateData)
      .eq('id', recruiterId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du plan:', error);
    throw error;
  }
};

// Récupérer les statistiques d'un recruteur
export const getRecruiterStats = async (recruiterId) => {
  try {
    const recruiter = await getRecruiterById(recruiterId);
    if (!recruiter) return null;
    
    // Récupérer le nombre d'offres actives
    const { data: jobsData, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('recruiter_id', recruiterId)
      .eq('status', 'active');
    
    if (jobsError) throw jobsError;
    
    // Récupérer le nombre de candidats en favoris
    const { data: favoritesData, error: favoritesError } = await supabaseAdmin
      .from('recruiter_favorites')
      .select('id')
      .eq('recruiter_id', recruiterId);
    
    if (favoritesError) throw favoritesError;
    
    return {
      ...recruiter,
      activeJobs: jobsData?.length || 0,
      favoriteCandidates: favoritesData?.length || 0,
      remainingJobPosts: recruiter.max_job_posts - recruiter.total_jobs_posted,
      remainingCandidateContacts: recruiter.max_candidate_contacts - recruiter.total_candidates_contacted
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
};

// Fonction utilitaire pour créer ou mettre à jour un recruteur
export const upsertRecruiter = async (recruiterData) => {
  try {
    // Essayer de récupérer le recruteur existant
    const existingRecruiter = await getRecruiterByEmail(recruiterData.email);
    
    if (existingRecruiter) {
      // Mettre à jour le recruteur existant
      return await updateRecruiter(existingRecruiter.id, recruiterData);
    } else {
      // Créer un nouveau recruteur
      return await createRecruiter(recruiterData);
    }
  } catch (error) {
    console.error('Erreur lors de l\'upsert du recruteur:', error);
    throw error;
  }
};
