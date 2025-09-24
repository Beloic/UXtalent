import { supabase } from '../lib/supabase';
import { buildApiUrl } from '../config/api';

// Obtenir le token d'authentification
const getAuthToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
    
    if (!session) {
      console.log('Aucune session active');
      return null;
    }
    
    if (!session.access_token) {
      console.log('Token d\'accès manquant');
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Erreur dans getAuthToken:', error);
    return null;
  }
};

// Récupérer les posts du forum
export const getForumPosts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await fetch(buildApiUrl(`/api/forum/posts?${params.toString()}`));
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('API Forum non disponible. Vérifiez que le serveur est démarré.');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Retourner des données vides en cas d'erreur
    return { posts: [], total: 0, page: 1, totalPages: 1 };
  }
};

// Récupérer un post spécifique avec ses réponses
export const getForumPost = async (postId) => {
  try {
    const response = await fetch(buildApiUrl(`/api/forum/posts/${postId}`));
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post non trouvé');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Créer un nouveau post
export const createForumPost = async (postData) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Vous devez être connecté pour créer un post');
    }
    
    const response = await fetch(buildApiUrl(`/api/forum/posts`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un post
export const updateForumPost = async (postId, postData) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Vous devez être connecté pour modifier un post');
    }
    
    const response = await fetch(buildApiUrl(`/api/forum/posts/${postId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Supprimer un post
export const deleteForumPost = async (postId) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Vous devez être connecté pour supprimer un post');
    }
    
    const response = await fetch(buildApiUrl(`/api/forum/posts/${postId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Ajouter une réponse à un post
export const addForumReply = async (postId, content) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Vous devez être connecté pour répondre à un post');
    }
    
    const response = await fetch(buildApiUrl(`/api/forum/posts/${postId}/replies`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Récupérer les catégories
export const getForumCategories = async () => {
  try {
    const response = await fetch(buildApiUrl(`/api/forum/categories`));
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('API Forum non disponible. Vérifiez que le serveur est démarré.');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Retourner des catégories par défaut en cas d'erreur
    return [
      { name: "UX Design", count: 0, color: "bg-blue-100 text-blue-700" },
      { name: "UI Design", count: 0, color: "bg-purple-100 text-purple-700" },
      { name: "Outils", count: 0, color: "bg-green-100 text-green-700" },
      { name: "Design System", count: 0, color: "bg-orange-100 text-orange-700" },
      { name: "User Research", count: 0, color: "bg-pink-100 text-pink-700" },
      { name: "Carrière", count: 0, color: "bg-indigo-100 text-indigo-700" }
    ];
  }
};

// Récupérer les statistiques du forum
export const getForumStats = async () => {
  try {
    const response = await fetch(buildApiUrl(`/api/forum/stats`));
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('API Forum non disponible. Vérifiez que le serveur est démarré.');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Retourner des statistiques par défaut en cas d'erreur
    return { totalPosts: 0, totalReplies: 0, totalUsers: 0 };
  }
};

// Like/Unlike un post
export const likePost = async (postId) => {
  try {
    const userId = localStorage.getItem('userId') || 'anonymous';
    
    const response = await fetch(buildApiUrl(`/api/forum/posts/${postId}/like`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Erreur lors du like du post');
    }
  } catch (error) {
    throw error;
  }
};

// Like/Unlike une réponse
export const likeReply = async (replyId) => {
  try {
    const userId = localStorage.getItem('userId') || 'anonymous';
    
    const response = await fetch(buildApiUrl(`/api/forum/replies/${replyId}/like`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Erreur lors du like de la réponse');
    }
  } catch (error) {
    throw error;
  }
};

// Modifier une réponse
export const updateForumReply = async (postId, replyId, content) => {
  try {
    console.log('Tentative de modification de réponse', { postId, replyId, contentLength: content?.length });
    
    const token = await getAuthToken();
    console.log('Token récupéré:', token ? 'présent' : 'absent');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour modifier une réponse');
    }
    
    const url = buildApiUrl(`/api/forum/posts/${postId}/replies/${replyId}`);
    console.log('URL de modification:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    
    console.log('Réponse reçue:', { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur de modification:', errorData);
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Modification réussie:', result);
    return result;
  } catch (error) {
    console.error('Erreur dans updateForumReply:', error);
    throw error;
  }
};

// Supprimer une réponse
export const deleteForumReply = async (postId, replyId) => {
  try {
    console.log('Tentative de suppression de réponse', { postId, replyId });
    
    const token = await getAuthToken();
    console.log('Token récupéré:', token ? 'présent' : 'absent');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour supprimer une réponse');
    }
    
    const url = buildApiUrl(`/api/forum/posts/${postId}/replies/${replyId}`);
    console.log('URL de suppression:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Réponse reçue:', { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur de suppression:', errorData);
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Suppression réussie:', result);
    return result;
  } catch (error) {
    console.error('Erreur dans deleteForumReply:', error);
    throw error;
  }
};
