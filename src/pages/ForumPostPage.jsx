import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Heart, Reply, Clock, Users, Tag, Edit, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getForumPost, addForumReply, likePost, likeReply, updateForumReply, deleteForumReply } from '../services/forumApi';
import { buildApiUrl } from '../config/api';

export default function ForumPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [message, setMessage] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likedReplies, setLikedReplies] = useState(new Set());
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  // Fonction pour convertir un email en ID numérique (même logique que backend)
  const emailToUserId = (email) => {
    const normalized = (email || '').toLowerCase().trim();
    if (!normalized) return 0;
    const userIdHash = normalized.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(userIdHash) % 10000; // ID entre 0 et 9999
  };

  // Fonction pour vérifier si l'utilisateur a liké un post
  const hasUserLikedPost = (post) => {
    if (!user || !post.liked_by) return false;
    const userId = emailToUserId(user.email || 'anonymous');
    return Array.isArray(post.liked_by) && post.liked_by.includes(userId);
  };

  // Fonction pour vérifier si l'utilisateur a liké une réponse
  const hasUserLikedReply = (reply) => {
    if (!user || !reply.liked_by) return false;
    const userId = emailToUserId(user.email || 'anonymous');
    return Array.isArray(reply.liked_by) && reply.liked_by.includes(userId);
  };

  // Fonction utilitaire pour formater les dates
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleLikePost = async () => {
    if (!user) {
      setMessage('Vous devez être connecté pour liker un post');
      return;
    }

    try {
      const userId = user.email || 'anonymous';
      const response = await fetch(buildApiUrl(`/api/forum/posts/${id}/like`), {
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
          if (result.isLiked) {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
          return newSet;
        });

        // Mettre à jour le post avec les nouvelles données
        setPost(prev => ({
          ...prev,
          likes: result.likes,
          liked_by: result.isLiked 
            ? [...(prev.liked_by || []), emailToUserId(userId)]
            : (prev.liked_by || []).filter(id => id !== emailToUserId(userId))
        }));
      }
    } catch (error) {
      setMessage('Erreur lors du like');
    }
  };

  const handleLikeReply = async (replyId) => {
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
          if (result.isLiked) {
            newSet.add(replyId);
          } else {
            newSet.delete(replyId);
          }
          return newSet;
        });

        // Mettre à jour la réponse dans le post
        setPost(prev => ({
          ...prev,
          replies: prev.replies.map(reply => 
            reply.id === replyId 
              ? { 
                  ...reply, 
                  likes: result.likes,
                  liked_by: result.isLiked 
                    ? [...(reply.liked_by || []), emailToUserId(userId)]
                    : (reply.liked_by || []).filter(id => id !== emailToUserId(userId))
                }
              : reply
          )
        }));
      }
    } catch (error) {
      setMessage('Erreur lors du like de la réponse');
    }
  };

  useEffect(() => {
    loadPost();
    // Incrémenter les vues quand la page se charge
    incrementViews();
  }, [id]);

  const incrementViews = async () => {
    try {
      await fetch(buildApiUrl(`/api/forum/posts/${id}/view`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
    }
  };

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const postData = await getForumPost(id);
        // S'assurer que replies est un tableau
        if (!Array.isArray(postData.replies)) {
          postData.replies = [];
        }
      setPost(postData);
    } catch (error) {
      setMessage('Erreur lors du chargement du post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Vous devez être connecté pour répondre');
      return;
    }

    if (!newReply.trim()) {
      setMessage('Veuillez saisir une réponse');
      return;
    }

    try {
      setIsSubmitting(true);
      await addForumReply(id, newReply);
      setNewReply('');
      setMessage('Réponse ajoutée avec succès !');
      
      // Recharger le post pour avoir les nouvelles réponses
      await loadPost();
    } catch (error) {
      setMessage(error.message || 'Erreur lors de l\'ajout de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReply = (reply) => {
    setEditingReply(reply.id);
    setEditReplyContent(reply.content);
  };

  const handleCancelEdit = () => {
    setEditingReply(null);
    setEditReplyContent('');
  };

  const handleSaveEdit = async (replyId) => {
    if (!editReplyContent.trim()) {
      setMessage('Le contenu de la réponse ne peut pas être vide');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateForumReply(id, replyId, editReplyContent);
      setMessage('Réponse modifiée avec succès !');
      
      // Recharger le post pour avoir les modifications
      await loadPost();
      setEditingReply(null);
      setEditReplyContent('');
    } catch (error) {
      setMessage(error.message || 'Erreur lors de la modification de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteForumReply(id, replyId);
      setMessage('Réponse supprimée avec succès !');
      
      // Recharger le post pour avoir les modifications
      await loadPost();
    } catch (error) {
      setMessage(error.message || 'Erreur lors de la suppression de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReplyOwner = (reply) => {
    if (!user || !reply) {
      console.log('isReplyOwner: user ou reply manquant', { user: !!user, reply: !!reply });
      return false;
    }
    
    const currentUserId = emailToUserId(user.email || 'anonymous');
    const replyAuthorId = parseInt(reply.author_id); // Convertir en nombre
    const isOwner = currentUserId === replyAuthorId;
    
    console.log('isReplyOwner debug:', {
      userEmail: user.email,
      currentUserId,
      replyAuthorId,
      isOwner,
      reply: reply
    });
    
    return isOwner;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement du post...</h1>
          <p className="text-gray-600">Récupération des détails de la discussion</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post non trouvé</h1>
          <p className="text-gray-600 mb-6">Cette discussion n'existe pas ou a été supprimée.</p>
          <Link 
            to="/my-profile/forum" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/my-profile/forum" 
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au forum
            </Link>
          </div>
        </div>

        {/* Message de notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl shadow-lg"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {post.author_avatar || post.authorAvatar || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-700">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">par {post.author}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(post.created_at || post.createdAt)}
                </span>
                {post.isPinned && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    📌 Épinglé
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {post.title} - Forum UX Talent
              </h1>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats du post */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Reply className="w-4 h-4" />
              {Array.isArray(post.replies) ? post.replies.length : 0} réponses
            </div>
            <button
              onClick={handleLikePost}
              className={`flex items-center gap-1 transition-colors hover:scale-105 ${
                hasUserLikedPost(post) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart 
                className={`w-4 h-4 ${
                  hasUserLikedPost(post) ? 'fill-current' : ''
                }`} 
              />
              {post.likes || 0} likes
            </button>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {post.views} vues
            </div>
          </div>
        </motion.div>

        {/* Formulaire de réponse */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter une réponse
            </h3>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <textarea
                rows={4}
                placeholder="Partagez votre point de vue ou posez une question..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publication...' : 'Publier la réponse'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Liste des réponses */}
        <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Réponses ({Array.isArray(post?.replies) ? post.replies.length : 0})
        </h3>


        {!post || !post.replies || !Array.isArray(post.replies) || post.replies.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune réponse</h4>
              <p className="text-gray-600">
                {user ? 'Soyez le premier à répondre à cette discussion !' : 'Connectez-vous pour répondre à cette discussion.'}
              </p>
            </div>
          ) : (
            Array.isArray(post.replies) && post.replies.map((reply, index) => {
              // Vérifier que reply est un objet valide
              if (!reply || typeof reply !== 'object') {
                return null;
              }
              
              
              return (
                <motion.div
                  key={reply.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {reply.author_avatar || reply.authorAvatar || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{reply.author || 'Utilisateur'}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reply.created_at || reply.createdAt ? formatTimeAgo(reply.created_at || reply.createdAt) : 'Récemment'}
                          </span>
                        </div>
                        {isReplyOwner(reply) && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReply(reply)}
                              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Modifier la réponse"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReply(reply.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer la réponse"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {console.log('Rendering buttons for reply:', reply.id, 'isOwner:', isReplyOwner(reply))}
                      </div>
                      {editingReply === reply.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(reply.id)}
                              disabled={isSubmitting}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSubmitting}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {reply.content || 'Contenu non disponible'}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleLikeReply(reply.id)}
                          className={`flex items-center gap-1 transition-colors hover:scale-105 ${
                            hasUserLikedReply(reply) 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              hasUserLikedReply(reply) ? 'fill-current' : ''
                            }`} 
                          />
                          {reply.likes || 0} likes
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
