// Base de données Supabase - Fonctions métier
// Importe les clients depuis le fichier centralisé pour éviter les instances multiples
import { supabase, supabaseAdmin } from '../lib/supabase.js';
import { getCandidatePlan, setCandidatePlan, clearCandidatePlan } from '../cache/planCache.js';

// ===== CANDIDATES =====

export const loadCandidates = async () => {
  try {
    // Optimisation : sélectionner seulement les colonnes nécessaires
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id,
        name,
        email,
        title,
        bio,
        skills,
        location,
        remote,
        portfolio,
        linkedin,
        github,
        daily_rate,
        annual_salary,
        photo,
        plan_type,
        plan_start_date,
        plan_end_date,
        is_featured,
        featured_until,
        notes,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = (data || []).map(candidate => {
      // Vérifier si le candidat a un plan en cache
      const cachedPlan = getCandidatePlan(candidate.id);
      
      return {
        ...candidate,
        createdAt: candidate.created_at,
        updatedAt: candidate.updated_at,
        dailyRate: candidate.daily_rate,
        annualSalary: candidate.annual_salary,
        // Utiliser le cache si disponible, sinon les données de la base
        planType: cachedPlan ? cachedPlan.planType : (candidate.plan_type || 'free'),
        planStartDate: candidate.plan_start_date,
        planEndDate: candidate.plan_end_date,
        isFeatured: cachedPlan ? cachedPlan.isFeatured : (candidate.is_featured || false),
        featuredUntil: candidate.featured_until,
        // Ajouter le champ notes
        notes: candidate.notes || '',
        // Mapper la photo de profil avec URL complète depuis Supabase Storage
        profilePhoto: (() => {
          if (!candidate.photo) return null;
          
          // Si c'est déjà une URL complète, la retourner telle quelle
          if (candidate.photo.startsWith('http')) {
            return candidate.photo;
          }
          
          // Sinon, construire l'URL depuis Supabase Storage
          try {
            const { data } = supabase.storage.from('profile-photos').getPublicUrl(candidate.photo);
            return data.publicUrl;
          } catch (error) {
            return null;
          }
        })()
        // yearsOfExperience sera extrait depuis la bio
      };
    });
    
    // Trier par plan : Pro en premier, puis Premium, puis Free
    const sortedCandidates = mappedData.sort((a, b) => {
      const planPriority = { 'pro': 3, 'premium': 2, 'free': 1 };
      const aPriority = planPriority[a.planType] || 1;
      const bPriority = planPriority[b.planType] || 1;
      
      // Si même plan, trier par date de création (plus récent en premier)
      if (aPriority === bPriority) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      
      return bPriority - aPriority;
    });
    
    return sortedCandidates;
  } catch (error) {
    return [];
  }
};

export const getCandidateStats = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_candidate_stats');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return { total: 0, approved: 0, pending: 0, rejected: 0 };
  }
};

export const addCandidate = async (candidateData) => {
  try {
    // Convertir les noms de colonnes de camelCase vers snake_case pour Supabase
    const dbData = {
      ...candidateData,
      daily_rate: candidateData.dailyRate,
      annual_salary: candidateData.annualSalary,
      // S'assurer que les nouveaux candidats sont en attente par défaut
      status: candidateData.status || 'pending'
    };
    
    // Supprimer les propriétés camelCase pour éviter les conflits
    delete dbData.dailyRate;
    delete dbData.annualSalary;
    delete dbData.yearsOfExperience; // Ignorer car la colonne n'existe pas encore
    
      status: dbData.status 
    });
    
    const { data, error } = await supabase
      .from('candidates')
      .insert([dbData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dailyRate: data.daily_rate,
      annualSalary: data.annual_salary
      // yearsOfExperience sera extrait depuis la bio
    };
    
    return mappedData;
  } catch (error) {
    throw error;
  }
};

export const updateCandidate = async (id, candidateData) => {
  try {
    // Récupérer le candidat actuel pour vérifier son statut
    const { data: currentCandidate, error: fetchError } = await supabase
      .from('candidates')
      .select('status')
      .eq('id', id)
      .single();
    
    if (fetchError) {
    }
    
    // Convertir les noms de colonnes de camelCase vers snake_case pour Supabase
    const dbData = { ...candidateData };
    // Supprimer les champs non supportés par le schéma Supabase (évite les erreurs 500)
    delete dbData.phone;
    
    // Convertir les champs de rémunération si ils existent
    if (candidateData.dailyRate !== undefined) {
      dbData.daily_rate = candidateData.dailyRate;
      delete dbData.dailyRate;
    }
    if (candidateData.annualSalary !== undefined) {
      dbData.annual_salary = candidateData.annualSalary;
      delete dbData.annualSalary;
    }
    // Ignorer yearsOfExperience car la colonne n'existe pas encore en base
    if (candidateData.yearsOfExperience !== undefined) {
      delete dbData.yearsOfExperience;
    }
    
    // Logique spéciale pour les candidats rejetés : remettre en attente après modification
    if (currentCandidate?.status === 'rejected' && candidateData.status === 'pending') {
      dbData.status = 'pending'; // Remettre en attente
    }
    
    
    const { data, error } = await supabase
      .from('candidates')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dailyRate: data.daily_rate,
      annualSalary: data.annual_salary,
      planType: data.plan_type || 'free',
      planStartDate: data.plan_start_date,
      planEndDate: data.plan_end_date,
      isFeatured: data.is_featured || false,
      featuredUntil: data.featured_until
    };
    
    return mappedData;
  } catch (error) {
    throw error;
  }
};

export const deleteCandidate = async (id) => {
  try {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Mettre à jour le plan d'un candidat
export const updateCandidatePlan = async (id, planType, durationMonths = 1) => {
  try {
      id: id,
      planType: planType,
      durationMonths: durationMonths,
      idType: typeof id
    });
    
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    const updateData = {
      plan_type: planType,
      plan_start_date: now.toISOString(),
      plan_end_date: planType === 'free' ? null : endDate.toISOString(), // Pas de date de fin pour le plan gratuit
      is_featured: planType !== 'free', // Premium et Pro sont automatiquement mis en avant
      featured_until: planType !== 'free' ? endDate.toISOString() : null
    };
    
      id: id,
      updateData: updateData,
      now: now.toISOString(),
      endDate: endDate.toISOString()
    });
    
    
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();
    
      hasData: !!data,
      hasError: !!error,
      data: data,
      error: error
    });
    
    if (error) {
      throw error;
    }
    
    
    
    // Vider le cache existant avant de mettre à jour
    clearCandidatePlan(id);
    
    // Mettre en cache le nouveau plan
    setCandidatePlan(id, planType);
    
    
    // Mapper les noms de colonnes de snake_case vers camelCase
    const mappedData = {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dailyRate: data.daily_rate,
      annualSalary: data.annual_salary,
      planType: planType, // Utiliser le plan demandé
      planStartDate: data.plan_start_date,
      planEndDate: data.plan_end_date,
      isFeatured: planType !== 'free', // Utiliser le plan demandé
      featuredUntil: data.featured_until
    };
    
      candidateId: id,
      newPlan: planType,
      mappedData: mappedData
    });
    
    return mappedData;
  } catch (error) {
    throw error;
  }
};

// ===== MÉTRIQUES =====

export const recordMetric = async (method, route, statusCode, responseTime) => {
  try {
    const { error } = await supabase
      .from('server_metrics')
      .insert({
        method,
        route,
        status_code: statusCode,
        duration: responseTime
      });
    
    if (error) throw error;
  } catch (error) {
  }
};

export const recordError = async (errorType, route, data) => {
  try {
    const { error } = await supabase
      .from('server_metrics')
      .insert({
        method: 'ERROR',
        route,
        status_code: 500,
        duration: 0
      });
    
    if (error) throw error;
  } catch (error) {
  }
};

// ===== FAVORIS RECRUTEURS =====

// Ajouter un candidat aux favoris d'un recruteur
export const addToFavorites = async (recruiterId, candidateId) => {
  try {
    // Vérifier si le favori existe déjà (idempotence)
    const { data: existingFavorite, error: existsError } = await supabase
      .from('recruiter_favorites')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .single();

    // PGRST116 = aucune ligne, donc on peut insérer
    if (existsError && existsError.code !== 'PGRST116') {
      throw existsError;
    }

    if (existingFavorite) {
      return existingFavorite; // Déjà en favori, ne pas échouer
    }

    const { data, error } = await supabase
      .from('recruiter_favorites')
      .insert({
        recruiter_id: recruiterId,
        candidate_id: candidateId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    // Gérer le cas de doublon (course possible): renvoyer l'existant au lieu d'échouer
    if (error && (error.code === '23505' || (typeof error.message === 'string' && error.message.includes('duplicate key')))) {
      try {
        const { data: existing } = await supabase
          .from('recruiter_favorites')
          .select('*')
          .eq('recruiter_id', recruiterId)
          .eq('candidate_id', candidateId)
          .single();
        if (existing) return existing;
      } catch (_) {
        // ignorer et rethrow plus bas
      }
    }
    throw error;
  }
};

// Retirer un candidat des favoris d'un recruteur
export const removeFromFavorites = async (recruiterId, candidateId) => {
  try {
    const { error } = await supabase
      .from('recruiter_favorites')
      .delete()
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Récupérer les favoris d'un recruteur avec les détails des candidats
export const getRecruiterFavorites = async (recruiterId) => {
  try {
    const { data, error } = await supabase
      .from('recruiter_favorites')
      .select(`
        *,
        candidates (
          id,
          name,
          email,
          title,
          location,
          remote,
          bio,
          skills,
          portfolio,
          linkedin,
          github,
          photo,
          daily_rate,
          annual_salary,
          experience,
          plan_type,
          created_at,
          updated_at
        )
      `)
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapper les données pour correspondre au format attendu
    const mappedData = (data || []).map(favorite => {
      const candidate = favorite.candidates;
      return {
        ...candidate,
        createdAt: candidate.created_at,
        updatedAt: candidate.updated_at,
        dailyRate: candidate.daily_rate,
        annualSalary: candidate.annual_salary,
        planType: candidate.plan_type || 'free',
        favoriteId: favorite.id,
        favoritedAt: favorite.created_at
      };
    });
    
    return mappedData;
  } catch (error) {
    return [];
  }
};

// Vérifier si un candidat est dans les favoris d'un recruteur
export const isCandidateFavorited = async (recruiterId, candidateId) => {
  try {
    const { data, error } = await supabase
      .from('recruiter_favorites')
      .select('id')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return !!data;
  } catch (error) {
    return false;
  }
};
