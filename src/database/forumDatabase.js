import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORUM_DATA_FILE = path.join(__dirname, '../../data/forum.json');

// Initialiser les données du forum si le fichier n'existe pas
const initializeForumData = () => {
  if (!fs.existsSync(FORUM_DATA_FILE)) {
    const initialData = {
      posts: [],
      replies: [],
      categories: [
        { name: "UX Design", count: 0, color: "bg-blue-100 text-blue-700", description: "Expérience utilisateur et design thinking" },
        { name: "UI Design", count: 0, color: "bg-purple-100 text-purple-700", description: "Interface utilisateur et design visuel" },
        { name: "Outils", count: 0, color: "bg-green-100 text-green-700", description: "Outils et logiciels de design" },
        { name: "Design System", count: 0, color: "bg-orange-100 text-orange-700", description: "Systèmes de design et composants" },
        { name: "User Research", count: 0, color: "bg-pink-100 text-pink-700", description: "Recherche utilisateur et tests" },
        { name: "Carrière", count: 0, color: "bg-indigo-100 text-indigo-700", description: "Conseils carrière et opportunités" }
      ],
      stats: {
        totalPosts: 0,
        totalReplies: 0,
        totalUsers: 0
      }
    };
    
    fs.writeFileSync(FORUM_DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

// Charger les données du forum
export const loadForumData = () => {
  initializeForumData();
  try {
    const data = fs.readFileSync(FORUM_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du chargement des données du forum:', error);
    return { posts: [], replies: [], categories: [], stats: { totalPosts: 0, totalReplies: 0, totalUsers: 0 } };
  }
};

// Sauvegarder les données du forum
export const saveForumData = (data) => {
  try {
    fs.writeFileSync(FORUM_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données du forum:', error);
    return false;
  }
};

// Ajouter un nouveau post
export const addPost = (postData) => {
  const data = loadForumData();
  const newPost = {
    id: data.posts.length > 0 ? Math.max(...data.posts.map(p => p.id)) + 1 : 1,
    ...postData,
    likes: 0,
    replies: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
    tags: postData.tags || []
  };
  
  data.posts.unshift(newPost); // Ajouter au début
  data.stats.totalPosts = data.posts.length;
  
  if (saveForumData(data)) {
    return newPost;
  }
  throw new Error('Erreur lors de la création du post');
};

// Mettre à jour un post
export const updatePost = (postId, updateData) => {
  const data = loadForumData();
  const postIndex = data.posts.findIndex(p => p.id === parseInt(postId));
  
  if (postIndex === -1) {
    throw new Error('Post non trouvé');
  }
  
  data.posts[postIndex] = {
    ...data.posts[postIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  if (saveForumData(data)) {
    return data.posts[postIndex];
  }
  throw new Error('Erreur lors de la mise à jour du post');
};

// Ajouter une réponse
export const addReply = (replyData) => {
  const data = loadForumData();
  const newReply = {
    id: data.replies.length > 0 ? Math.max(...data.replies.map(r => r.id)) + 1 : 1,
    ...replyData,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.replies.push(newReply);
  
  // Mettre à jour le compteur de réponses du post
  const postIndex = data.posts.findIndex(p => p.id === replyData.postId);
  if (postIndex !== -1) {
    data.posts[postIndex].replies += 1;
    data.posts[postIndex].updatedAt = new Date().toISOString();
  }
  
  data.stats.totalReplies = data.replies.length;
  
  if (saveForumData(data)) {
    return newReply;
  }
  throw new Error('Erreur lors de la création de la réponse');
};

// Obtenir les statistiques du forum
export const getForumStats = () => {
  const data = loadForumData();
  return data.stats;
};

// Obtenir les catégories
export const getCategories = () => {
  const data = loadForumData();
  return data.categories;
};

// Obtenir les posts avec filtres
export const getPosts = (filters = {}) => {
  const data = loadForumData();
  let posts = [...data.posts];
  
  // Filtrer par catégorie
  if (filters.category) {
    posts = posts.filter(p => p.category === filters.category);
  }
  
  // Filtrer par recherche
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.content.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Trier par date (plus récent en premier)
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    posts: posts.slice(startIndex, endIndex),
    total: posts.length,
    page,
    totalPages: Math.ceil(posts.length / limit)
  };
};

// Obtenir un post par ID avec ses réponses
export const getPostById = (postId) => {
  const data = loadForumData();
  const post = data.posts.find(p => p.id === parseInt(postId));
  
  if (!post) {
    return null;
  }
  
  // Incrémenter les vues
  post.views += 1;
  updatePost(postId, { views: post.views });
  
  // Récupérer les réponses
  const replies = data.replies
    .filter(r => r.postId === parseInt(postId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  return {
    ...post,
    replies
  };
};

// Supprimer un post
export const deletePost = (postId) => {
  const data = loadForumData();
  const postIndex = data.posts.findIndex(p => p.id === parseInt(postId));
  
  if (postIndex === -1) {
    return false;
  }
  
  // Supprimer le post
  data.posts.splice(postIndex, 1);
  
  // Supprimer toutes les réponses associées
  data.replies = data.replies.filter(r => r.postId !== parseInt(postId));
  
  // Mettre à jour les statistiques
  data.stats.totalPosts = Math.max(0, data.stats.totalPosts - 1);
  data.stats.totalReplies = data.replies.length;
  
  // Mettre à jour les compteurs de catégories
  const deletedPost = data.posts.find(p => p.id === parseInt(postId));
  if (deletedPost) {
    const category = data.categories.find(c => c.name === deletedPost.category);
    if (category) {
      category.count = Math.max(0, category.count - 1);
    }
  }
  
  saveForumData(data);
  return true;
};

// Supprimer une réponse
export const deleteReply = (postId, replyId) => {
  const data = loadForumData();
  const replyIndex = data.replies.findIndex(r => r.id === parseInt(replyId) && r.postId === parseInt(postId));
  
  if (replyIndex === -1) {
    return false;
  }
  
  // Supprimer la réponse
  data.replies.splice(replyIndex, 1);
  
  // Mettre à jour les statistiques
  data.stats.totalReplies = data.replies.length;
  
  saveForumData(data);
  return true;
};

// Like/Unlike un post
export const togglePostLike = (postId, userId) => {
  const data = loadForumData();
  const post = data.posts.find(p => p.id === postId);
  
  if (!post) {
    return { success: false, error: 'Post non trouvé' };
  }
  
  // Initialiser le champ likedBy s'il n'existe pas
  if (!post.likedBy) {
    post.likedBy = [];
  }
  
  const userIndex = post.likedBy.indexOf(userId);
  
  if (userIndex === -1) {
    // L'utilisateur n'a pas encore liké, ajouter le like
    post.likedBy.push(userId);
    post.likes += 1;
  } else {
    // L'utilisateur a déjà liké, retirer le like
    post.likedBy.splice(userIndex, 1);
    post.likes -= 1;
  }
  
  saveForumData(data);
  return { 
    success: true, 
    likes: post.likes, 
    isLiked: post.likedBy.includes(userId) 
  };
};

// Like/Unlike une réponse
export const toggleReplyLike = (replyId, userId) => {
  const data = loadForumData();
  const reply = data.replies.find(r => r.id === replyId);
  
  if (!reply) {
    return { success: false, error: 'Réponse non trouvée' };
  }
  
  // Initialiser le champ likedBy s'il n'existe pas
  if (!reply.likedBy) {
    reply.likedBy = [];
  }
  
  const userIndex = reply.likedBy.indexOf(userId);
  
  if (userIndex === -1) {
    // L'utilisateur n'a pas encore liké, ajouter le like
    reply.likedBy.push(userId);
    reply.likes += 1;
  } else {
    // L'utilisateur a déjà liké, retirer le like
    reply.likedBy.splice(userIndex, 1);
    reply.likes -= 1;
  }
  
  saveForumData(data);
  return { 
    success: true, 
    likes: reply.likes, 
    isLiked: reply.likedBy.includes(userId) 
  };
};
