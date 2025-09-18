import { createClient } from '@supabase/supabase-js';
import { getCandidatePlan, setCandidatePlan } from '../cache/planCache.js';

// Configuration Supabase - Détection de l'environnement
const isServer = typeof window === 'undefined';

// Configuration pour le frontend (Vite)
const supabaseUrl = isServer 
  ? (process.env.VITE_SUPABASE_URL || 'https://ktfdrwpvofxuktnunukv.supabase.co')
  : (import.meta.env.VITE_SUPABASE_URL || 'https://ktfdrwpvofxuktnunukv.supabase.co');

const supabaseKey = isServer
  ? (process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTU4NDAsImV4cCI6MjA3MzE3MTg0MH0.v6886_P_zJuTv-fsZZRydSaVfQ0qLqY56SQJgWePpY8')
  : (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTU4NDAsImV4cCI6MjA3MzE3MTg0MH0.v6886_P_zJuTv-fsZZRydSaVfQ0qLqY56SQJgWePpY8');

// Clé de service pour contourner les politiques RLS (chiffrée)
const supabaseServiceKey = isServer
  ? (process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c')
  : (import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c');

// Client Supabase (anonyme pour le frontend)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Client Supabase avec service role (pour le serveur)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ===== CANDIDATES =====

export const loadCandidates = async () => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
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
            console.log(`📸 Photo URL construite pour ${candidate.name}:`, data.publicUrl);
            return data.publicUrl;
          } catch (error) {
            console.error(`❌ Erreur construction URL photo pour ${candidate.name}:`, error);
            return null;
          }
        })()
        // yearsOfExperience sera extrait depuis la bio
      };
    });
    
    return mappedData;
  } catch (error) {
    console.error('Erreur lors du chargement des candidats:', error);
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
    console.error('Erreur lors du chargement des statistiques des candidats:', error);
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
    
    console.log('🆕 [SUPABASE] Création candidat avec statut:', { 
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
    console.error('Erreur lors de l\'ajout du candidat:', error);
    throw error;
  }
};

export const updateCandidate = async (id, candidateData) => {
  try {
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
    
    console.log('🔄 Mise à jour candidat:', { id, dbData });
    
    const { data, error } = await supabase
      .from('candidates')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
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
    
    console.log('✅ Candidat mis à jour:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du candidat:', error);
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
    console.error('Erreur lors de la suppression du candidat:', error);
    throw error;
  }
};

// Mettre à jour le plan d'un candidat
export const updateCandidatePlan = async (id, planType, durationMonths = 1) => {
  try {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    const updateData = {
      plan_type: planType,
      plan_start_date: now.toISOString(),
      plan_end_date: endDate.toISOString(),
      is_featured: planType !== 'free', // Premium et Pro sont automatiquement mis en avant
      featured_until: planType !== 'free' ? endDate.toISOString() : null
    };
    
    console.log('🔄 Mise à jour du plan candidat:', { id, updateData });
    
    const { data, error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }
    
    console.log('📊 Données retournées par Supabase:', data);
    
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
    
    console.log('✅ Plan candidat mis à jour:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du plan candidat:', error);
    throw error;
  }
};

// ===== FORUM =====

export const loadForumData = async () => {
  try {
    // Récupérer les posts et réponses directement depuis les tables
    const [postsResult, repliesResult] = await Promise.all([
      supabase.from('forum_posts').select('*'),
      supabase.from('forum_replies').select('*')
    ]);
    
    if (postsResult.error) throw postsResult.error;
    if (repliesResult.error) throw repliesResult.error;
    
    return {
      posts: postsResult.data || [],
      replies: repliesResult.data || []
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données du forum:', error);
    return { posts: [], replies: [] };
  }
};

export const getForumStats = async () => {
  try {
    // Récupérer les statistiques directement depuis les tables
    const [postsResult, repliesResult, candidatesResult] = await Promise.all([
      supabase.from('forum_posts').select('id', { count: 'exact' }),
      supabase.from('forum_replies').select('id', { count: 'exact' }),
      supabase.from('candidates').select('id', { count: 'exact' })
    ]);
    
    return {
      totalPosts: postsResult.count || 0,
      totalReplies: repliesResult.count || 0,
      totalUsers: candidatesResult.count || 0
    };
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques du forum:', error);
    return { totalPosts: 0, totalReplies: 0, totalUsers: 0 };
  }
};

export const getCategories = async () => {
  try {
    // Récupérer les catégories directement depuis les posts
    const { data, error } = await supabase
      .from('forum_posts')
      .select('category');
    
    if (error) throw error;
    
    // Compter les occurrences de chaque catégorie
    const categoryCount = {};
    data.forEach(post => {
      categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    return [];
  }
};

export const getPosts = async (category = null, search = null, page = 1, limit = 10) => {
  try {
    let query = supabase
      .from('forum_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query.range(from, to);
    
    if (error) throw error;
    
    // Récupérer le nombre de réponses pour chaque post et s'assurer que les vues sont initialisées
    const processedPosts = await Promise.all((data || []).map(async (post) => {
      try {
        const { count: repliesCount } = await supabase
          .from('forum_replies')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // S'assurer que les vues sont initialisées (pas null) ou simuler si la colonne n'existe pas
        const views = post.hasOwnProperty('views') ? 
          (post.views !== null && post.views !== undefined ? post.views : 0) : 0;
        
        return {
          ...post,
          replies_count: repliesCount || 0,
          views: views
        };
      } catch (error) {
        console.error(`Erreur lors du comptage des réponses pour le post ${post.id}:`, error);
        return {
          ...post,
          replies_count: 0,
          views: post.hasOwnProperty('views') ? 
            (post.views !== null && post.views !== undefined ? post.views : 0) : 0
        };
      }
    }));
    
    const totalPages = Math.ceil((count || 0) / limit);
    
    return {
      posts: processedPosts,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Erreur lors du chargement des posts:', error);
    return { posts: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
};

export const getPostById = async (id) => {
  try {
    // Récupérer le post
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (postError) throw postError;
    
    // Récupérer les réponses
    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    
    if (repliesError) throw repliesError;
    
    return {
      ...post,
      replies: replies || []
    };
  } catch (error) {
    console.error('Erreur lors du chargement du post:', error);
    return null;
  }
};

export const addPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([postData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du post:', error);
    throw error;
  }
};

export const updatePost = async (id, postData) => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error);
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    throw error;
  }
};

export const addReply = async (replyData) => {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert([replyData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse:', error);
    throw error;
  }
};

export const deleteReply = async (id) => {
  try {
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la réponse:', error);
    throw error;
  }
};

export const togglePostLike = async (postId, userId) => {
  try {
    // Convertir l'userId en nombre pour éviter les erreurs de type
    const numericUserId = typeof userId === 'string' ? 
      Math.abs(userId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 10000 : 
      userId;
    
    // Récupérer le post actuel
    const { data: post, error: fetchError } = await supabase
      .from('forum_posts')
      .select('likes, liked_by')
      .eq('id', postId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Vérifier si l'utilisateur a déjà liké
    const likedBy = post.liked_by || [];
    const hasLiked = likedBy.includes(numericUserId);
    
    let newLikes, newLikedBy;
    
    if (hasLiked) {
      // Retirer le like
      newLikes = Math.max(0, post.likes - 1);
      newLikedBy = likedBy.filter(id => id !== numericUserId);
    } else {
      // Ajouter le like
      newLikes = post.likes + 1;
      newLikedBy = [...likedBy, numericUserId];
    }
    
    // Mettre à jour le post
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ 
        likes: newLikes,
        liked_by: newLikedBy
      })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      likes: newLikes,
      liked: !hasLiked,
      likedBy: newLikedBy
    };
  } catch (error) {
    console.error('Erreur lors du like du post:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const toggleReplyLike = async (replyId, userId) => {
  try {
    // Convertir l'userId en nombre pour éviter les erreurs de type
    const numericUserId = typeof userId === 'string' ? 
      Math.abs(userId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 10000 : 
      userId;
    
    // Récupérer la réponse actuelle
    const { data: reply, error: fetchError } = await supabase
      .from('forum_replies')
      .select('likes, liked_by')
      .eq('id', replyId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Vérifier si l'utilisateur a déjà liké
    const likedBy = reply.liked_by || [];
    const hasLiked = likedBy.includes(numericUserId);
    
    let newLikes, newLikedBy;
    
    if (hasLiked) {
      // Retirer le like
      newLikes = Math.max(0, reply.likes - 1);
      newLikedBy = likedBy.filter(id => id !== numericUserId);
    } else {
      // Ajouter le like
      newLikes = reply.likes + 1;
      newLikedBy = [...likedBy, numericUserId];
    }
    
    // Mettre à jour la réponse
    const { data, error } = await supabase
      .from('forum_replies')
      .update({ 
        likes: newLikes,
        liked_by: newLikedBy
      })
      .eq('id', replyId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      likes: newLikes,
      liked: !hasLiked,
      likedBy: newLikedBy
    };
  } catch (error) {
    console.error('Erreur lors du like de la réponse:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const incrementPostViews = async (postId) => {
  try {
    // Essayer de récupérer le post avec le champ views
    const { data: post, error: fetchError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération du post:', fetchError);
      throw fetchError;
    }

    // Si la colonne views n'existe pas, on simule l'incrémentation
    if (!post.hasOwnProperty('views')) {
      console.log(`Colonne views inexistante pour le post ${postId}, simulation de l'incrémentation`);
      return { success: true, views: 1 };
    }

    // Gérer les valeurs null/undefined
    const currentViews = (post.views !== null && post.views !== undefined) ? post.views : 0;
    const newViews = currentViews + 1;

    console.log(`Post ${postId}: vues actuelles=${currentViews}, nouvelles vues=${newViews}`);

    // Mettre à jour le nombre de vues
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ views: newViews })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour des vues:', error);
      throw error;
    }

    return { success: true, views: data.views };
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    return { success: false, error: error.message };
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
    console.error('Erreur lors de l\'enregistrement de la métrique:', error);
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
    console.error('Erreur lors de l\'enregistrement de l\'erreur:', error);
  }
};

export const getAllMetrics = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_metrics');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des métriques:', error);
    return {
      requests: { total: 0, byMethod: {}, byRoute: {}, byStatus: {} },
      performance: { averageResponseTime: 0 },
      errors: { total: 0 },
      lastUpdated: new Date().toISOString()
    };
  }
};

export const resetMetrics = async () => {
  try {
    const { data, error } = await supabase
      .rpc('reset_metrics');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des métriques:', error);
    throw error;
  }
};

// ===== MIGRATION DES DONNÉES =====
// Fonction supprimée - utilisation directe de Supabase uniquement

// ===== TRACKING PROFIL =====

// Enregistrer une vue de profil (sans email, juste les visites)
export const trackProfileView = async (candidateId) => {
  try {
    const { data, error } = await supabase
      .from('profile_tracking')
      .insert({
        candidate_id: candidateId,
        viewed_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors du tracking de la vue de profil:', error);
    throw error;
  }
};

// Récupérer les statistiques de vues pour un candidat
export const getProfileViewsStats = async (candidateId) => {
  try {
    const { count, error } = await supabase
      .from('profile_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId);

    if (error) throw error;
    
    return [{ total_views: count || 0 }];
  } catch (error) {
    console.error('Erreur lors de la récupération des stats de vues de profil:', error);
    return [{ total_views: 0 }];
  }
};

// Récupérer les vues par période pour un candidat
export const getProfileViewsByPeriod = async (candidateId, period = 'week', offset = 0) => {
  try {
    let startDate, endDate, groupBy, dateFormat;
    
    const now = new Date();
    
    switch (period) {
      case 'week':
        // Semaine (7 jours)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (6 + offset * 7));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        groupBy = 'day';
        dateFormat = { weekday: 'short', month: 'short', day: 'numeric' };
        break;
        
      case 'month':
        // Mois (30 jours)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (29 + offset * 30));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 29);
        groupBy = 'day';
        dateFormat = { month: 'short', day: 'numeric' };
        break;
        
      case 'year':
        // Année (12 mois)
        startDate = new Date(now.getFullYear() - offset, 0, 1);
        endDate = new Date(now.getFullYear() - offset, 11, 31);
        groupBy = 'month';
        dateFormat = { month: 'short' };
        break;
        
      default:
        throw new Error('Période non supportée');
    }

    const { data, error } = await supabase
      .from('profile_tracking')
      .select('viewed_at')
      .eq('candidate_id', candidateId)
      .gte('viewed_at', startDate.toISOString())
      .lte('viewed_at', endDate.toISOString())
      .order('viewed_at', { ascending: true });

    if (error) throw error;

    // Grouper les données selon la période
    const groupedViews = {};
    
    if (groupBy === 'day') {
      // Initialiser tous les jours de la période avec 0 vues
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        groupedViews[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Compter les vues par jour
      data?.forEach(view => {
        const dateStr = view.viewed_at.split('T')[0];
        if (groupedViews.hasOwnProperty(dateStr)) {
          groupedViews[dateStr]++;
        }
      });
    } else if (groupBy === 'month') {
      // Initialiser tous les mois de l'année avec 0 vues
      for (let month = 0; month < 12; month++) {
        const date = new Date(startDate.getFullYear(), month, 1);
        const monthStr = date.toISOString().substring(0, 7); // YYYY-MM
        groupedViews[monthStr] = 0;
      }
      
      // Compter les vues par mois
      data?.forEach(view => {
        const monthStr = view.viewed_at.substring(0, 7); // YYYY-MM
        if (groupedViews.hasOwnProperty(monthStr)) {
          groupedViews[monthStr]++;
        }
      });
    }

    // Convertir en format pour le graphique
    return Object.entries(groupedViews).map(([date, views]) => ({
      date: new Date(date + (groupBy === 'month' ? '-01' : '')).toLocaleDateString('fr-FR', dateFormat),
      views,
      fullDate: date
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des vues par période:', error);
    return [];
  }
};

// Fonction de compatibilité pour l'ancienne API
export const getProfileViewsByDay = async (candidateId) => {
  return getProfileViewsByPeriod(candidateId, 'week', 0);
};

// Récupérer les vues du jour pour un candidat
export const getProfileViewsToday = async (candidateId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const { count, error } = await supabase
      .from('profile_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', candidateId)
      .gte('viewed_at', startOfDay.toISOString())
      .lt('viewed_at', endOfDay.toISOString());

    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération des vues du jour:', error);
    return 0;
  }
};

// Fonction simplifiée pour les contacts (toujours 0)
export const getRecruiterContactsStats = async () => {
  return [{ total_contacts: 0 }];
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
    console.error('Erreur lors de l\'ajout aux favoris:', error);
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
    console.error('Erreur lors de la suppression des favoris:', error);
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
    console.error('Erreur lors de la récupération des favoris:', error);
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
    console.error('Erreur lors de la vérification des favoris:', error);
    return false;
  }
};
