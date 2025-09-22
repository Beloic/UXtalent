import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Clock, TrendingUp, Heart, Reply, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getForumPosts, getForumCategories, getForumStats, createForumPost } from '../services/forumApi';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likedReplies, setLikedReplies] = useState(new Set());

  // Charger les données du forum
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setMessage(''); // Effacer les messages d'erreur précédents
        
        const [postsData, statsData] = await Promise.all([
          getForumPosts({ 
            category: selectedCategory || undefined, 
            search: searchTerm || undefined 
          }),
          getForumStats()
        ]);
        
        const allPosts = postsData.posts || [];
        setPosts(allPosts);
        setStats(statsData || {});
        
        // Calculer les catégories dynamiquement à partir des posts
        // Définir toutes les catégories disponibles (toujours visibles)
        const allAvailableCategories = [
          'Design',
          'Carrière', 
          'UX',
          'Développement',
          'Outils'
        ];
        
        // Calculer les compteurs pour chaque catégorie
        const categoryCounts = {};
        allPosts.forEach(post => {
          if (post.category) {
            categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
          }
        });
        
        // Créer les catégories avec leurs couleurs (toutes les catégories sont toujours affichées)
        const dynamicCategories = allAvailableCategories.map((name, index) => {
          const colors = [
            'bg-blue-100 text-blue-700',
            'bg-green-100 text-green-700', 
            'bg-purple-100 text-purple-700',
            'bg-orange-100 text-orange-700',
            'bg-pink-100 text-pink-700'
          ];
          return {
            name,
            count: categoryCounts[name] || 0, // 0 si pas de posts dans cette catégorie
            color: colors[index % colors.length]
          };
        });
        
        setCategories(dynamicCategories);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setMessage(`Erreur lors du chargement des données du forum: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, searchTerm, refreshTrigger]);

  // Réinitialiser la page quand on change de catégorie ou de recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);


  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Vous devez être connecté pour créer un post');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      setMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdPost = await createForumPost(newPost);
      
      setMessage('Post créé avec succès !');
      setNewPost({ title: '', content: '', category: '', tags: [] });
      setShowNewPostForm(false);
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
      
      // Recharger les données
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      setMessage(error.message || 'Erreur lors de la création du post');
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}j`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}sem`;
  };

  // Fonction pour liker/unliker un post
  const handleLikePost = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setMessage('Vous devez être connecté pour liker un post');
      return;
    }

    try {
      const userId = user.email || 'anonymous';
      const response = await fetch(buildApiUrl(`/api/forum/posts/${postId}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour l'état local
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (result.liked) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });

        // Mettre à jour le post dans la liste
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: result.likes }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  // Fonction pour liker/unliker une réponse
  const handleLikeReply = async (replyId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setMessage('Vous devez être connecté pour liker une réponse');
      return;
    }

    try {
      const userId = user.email || 'anonymous';
      const response = await fetch(buildApiUrl(`/api/forum/replies/${replyId}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour l'état local
        setLikedReplies(prev => {
          const newSet = new Set(prev);
          if (result.liked) {
            newSet.add(replyId);
          } else {
            newSet.delete(replyId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Erreur lors du like de la réponse:', error);
    }
  };

  // Calculer la pagination
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  // Fonctions de pagination
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
            </div>
            {user && (
              <button
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouveau post
              </button>
            )}
          </div>
        </div>

        {/* Message de notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-2xl shadow-lg border ${
                message.includes('succès') || message.includes('créé')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Catégories
              </h3>
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer border-2 ${
                    selectedCategory === '' 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' 
                      : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedCategory('')}
                >
                  <span className="text-gray-700 font-medium">Toutes les catégories</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">
                    {stats.totalPosts || 0}
                  </span>
                </motion.div>
                {categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer border-2 ${
                      selectedCategory === category.name 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' 
                        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <span className="text-gray-700 font-medium">{category.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${category.color}`}>
                      {category.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Statistiques
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discussions</span>
                  <span className="font-semibold text-gray-900">{stats.totalPosts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Réponses</span>
                  <span className="font-semibold text-gray-900">{stats.totalReplies || 0}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les discussions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Effacer
                </button>
              </div>
            </div>

            {/* Formulaire de nouveau post */}
            <AnimatePresence>
              {showNewPostForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Créer une nouvelle discussion
                  </h3>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titre de votre discussion..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <textarea
                      rows={4}
                      placeholder="Décrivez votre question ou partagez votre expérience..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                        disabled={categories.length === 0}
                      >
                        <option value="">{categories.length === 0 ? 'Chargement des catégories...' : 'Choisir une catégorie'}</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewPostForm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || categories.length === 0}
                          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Publication...' : categories.length === 0 ? 'Chargement...' : 'Publier'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des discussions */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des discussions...</h3>
                  <p className="text-gray-600">Récupération des posts du forum</p>
                </div>
              ) : currentPosts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'Aucun résultat trouvé' : 'Aucune discussion'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? `Aucune discussion ne correspond à "${searchTerm}"`
                      : 'Les discussions apparaîtront ici une fois créées'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all duration-200"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                currentPosts.map((post, index) => (
                  <Link to={`/forum/${post.id}`}>
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer mb-4"
                    >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {post.author_avatar || post.authorAvatar || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${categories.find(c => c.name === post.category)?.color || 'bg-gray-100 text-gray-700'}`}>
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">par {post.author}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(post.created_at || post.createdAt)}
                          </span>
                          {post.isPinned && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                              📌 Épinglé
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Reply className="w-4 h-4" />
                            {post.replies_count || post.replies || 0} réponses
                          </div>
                          <button 
                            onClick={(e) => handleLikePost(post.id, e)}
                            className={`flex items-center gap-1 transition-colors hover:scale-105 ${
                              likedPosts.has(post.id) 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                likedPosts.has(post.id) ? 'fill-current' : ''
                              }`} 
                            />
                            {post.likes || 0} likes
                          </button>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {post.views_count || post.views || 0} vues
                          </div>
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages} • {posts.length} discussions au total
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    
                    {/* Afficher les numéros de page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
