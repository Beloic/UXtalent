import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTU4NDAsImV4cCI6MjA3MzE3MTg0MH0.v6886_P_zJuTv-fsZZRydSaVfQ0qLqY56SQJgWePpY8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ajouter un nouveau post
export const addPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        title: postData.title,
        content: postData.content,
        author: postData.author,
        author_id: postData.author_id,
        author_avatar: postData.author_avatar,
        category: postData.category,
        tags: postData.tags || []
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du post:', error);
    throw error;
  }
};

// Mettre à jour un post
export const updatePost = async (postId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error);
    throw error;
  }
};

// Supprimer un post
export const deletePost = async (postId) => {
  try {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    throw error;
  }
};

// Ajouter une réponse
export const addReply = async (replyData) => {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert([{
        post_id: replyData.postId || replyData.post_id,
        content: replyData.content,
        author: replyData.author,
        author_id: replyData.author_id,
        author_avatar: replyData.author_avatar
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse:', error);
    throw error;
  }
};

// Supprimer une réponse
export const deleteReply = async (postId, replyId) => {
  try {
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', replyId)
      .eq('post_id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la réponse:', error);
    throw error;
  }
};

// Obtenir les posts avec filtres
export const getPosts = async (filters = {}) => {
  try {
    let query = supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      posts: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    throw error;
  }
};

// Obtenir un post par ID avec ses réponses
export const getPostById = async (postId) => {
  try {
    // Récupérer le post
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError) throw postError;

    // Incrémenter les vues
    await supabase
      .from('forum_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', postId);

    // Récupérer les réponses
    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return {
      ...post,
      replies: replies || []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    throw error;
  }
};

// Obtenir les statistiques du forum
export const getForumStats = async () => {
  try {
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('id');

    if (postsError) throw postsError;

    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('id');

    if (repliesError) throw repliesError;

    const { data: users, error: usersError } = await supabase
      .from('forum_posts')
      .select('author_id')
      .not('author_id', 'is', null);

    if (usersError) throw usersError;

    const uniqueUsers = new Set(users.map(u => u.author_id)).size;

    return {
      totalPosts: posts?.length || 0,
      totalReplies: replies?.length || 0,
      totalUsers: uniqueUsers
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Obtenir les catégories
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

// Like/Unlike un post
export const togglePostLike = async (postId, userId) => {
  try {
    // Vérifier si l'utilisateur a déjà liké
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Supprimer le like
      await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Décrémenter le compteur
      const { data: post } = await supabase
        .from('forum_posts')
        .select('likes')
        .eq('id', postId)
        .single();

      await supabase
        .from('forum_posts')
        .update({ likes: Math.max((post?.likes || 0) - 1, 0) })
        .eq('id', postId);

      return { success: true, likes: Math.max((post?.likes || 0) - 1, 0), isLiked: false };
    } else {
      // Ajouter le like
      await supabase
        .from('forum_post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      // Incrémenter le compteur
      const { data: post } = await supabase
        .from('forum_posts')
        .select('likes')
        .eq('id', postId)
        .single();

      await supabase
        .from('forum_posts')
        .update({ likes: (post?.likes || 0) + 1 })
        .eq('id', postId);

      return { success: true, likes: (post?.likes || 0) + 1, isLiked: true };
    }
  } catch (error) {
    console.error('Erreur lors du like du post:', error);
    throw error;
  }
};

// Like/Unlike une réponse
export const toggleReplyLike = async (replyId, userId) => {
  try {
    // Vérifier si l'utilisateur a déjà liké
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_reply_likes')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Supprimer le like
      await supabase
        .from('forum_reply_likes')
        .delete()
        .eq('reply_id', replyId)
        .eq('user_id', userId);

      // Décrémenter le compteur
      const { data: reply } = await supabase
        .from('forum_replies')
        .select('likes')
        .eq('id', replyId)
        .single();

      await supabase
        .from('forum_replies')
        .update({ likes: Math.max((reply?.likes || 0) - 1, 0) })
        .eq('id', replyId);

      return { success: true, likes: Math.max((reply?.likes || 0) - 1, 0), isLiked: false };
    } else {
      // Ajouter le like
      await supabase
        .from('forum_reply_likes')
        .insert([{ reply_id: replyId, user_id: userId }]);

      // Incrémenter le compteur
      const { data: reply } = await supabase
        .from('forum_replies')
        .select('likes')
        .eq('id', replyId)
        .single();

      await supabase
        .from('forum_replies')
        .update({ likes: (reply?.likes || 0) + 1 })
        .eq('id', replyId);

      return { success: true, likes: (reply?.likes || 0) + 1, isLiked: true };
    }
  } catch (error) {
    console.error('Erreur lors du like de la réponse:', error);
    throw error;
  }
};

// Incrémenter les vues d'un post
export const incrementPostViews = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ views: supabase.raw('views + 1') })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    throw error;
  }
};
