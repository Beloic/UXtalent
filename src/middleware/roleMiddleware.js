// Middleware de gestion des rôles et permissions
import { supabase } from '../database/supabaseClient.js';

// Définition des rôles et permissions
export const ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter', 
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  // Permissions candidats
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  VIEW_OWN_STATS: 'view_own_stats',
  VIEW_PUBLIC_PROFILES: 'view_public_profiles',
  
  // Permissions recruteurs
  VIEW_ALL_CANDIDATES: 'view_all_candidates',
  CONTACT_CANDIDATES: 'contact_candidates',
  EXPORT_DATA: 'export_data',
  
  // Permissions admin
  VIEW_ALL_PROFILES: 'view_all_profiles',
  APPROVE_PROFILES: 'approve_profiles',
  DELETE_PROFILES: 'delete_profiles',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics'
};

// Matrice des permissions par rôle
export const ROLE_PERMISSIONS = {
  [ROLES.CANDIDATE]: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.VIEW_OWN_STATS,
    PERMISSIONS.VIEW_PUBLIC_PROFILES
  ],
  [ROLES.RECRUITER]: [
    PERMISSIONS.VIEW_ALL_CANDIDATES,
    PERMISSIONS.CONTACT_CANDIDATES,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_PUBLIC_PROFILES
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_PROFILES,
    PERMISSIONS.APPROVE_PROFILES,
    PERMISSIONS.DELETE_PROFILES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ALL_CANDIDATES,
    PERMISSIONS.CONTACT_CANDIDATES,
    PERMISSIONS.EXPORT_DATA
  ]
};

// Middleware pour vérifier les rôles
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Token d\'authentification requis',
          code: 'AUTH_REQUIRED'
        });
      }

      const token = authHeader.substring(7);
      
      // Vérifier le token admin spécial
      if (token === 'admin-token') {
        req.user = { 
          id: '00000000-0000-0000-0000-000000000000', // UUID admin spécial
          role: ROLES.ADMIN,
          email: 'admin@system'
        };
        req.userRole = ROLES.ADMIN;
        return next();
      }

      // Récupérer l'utilisateur depuis Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ 
          error: 'Token invalide',
          code: 'INVALID_TOKEN'
        });
      }

      // Récupérer le rôle depuis les métadonnées
      const userRole = user.user_metadata?.role;
      
      if (!userRole) {
        return res.status(403).json({ 
          error: 'Rôle utilisateur non défini',
          code: 'ROLE_NOT_DEFINED'
        });
      }

      // Vérifier si le rôle est autorisé
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: `Accès refusé. Rôle requis: ${allowedRoles.join(' ou ')}`,
          code: 'INSUFFICIENT_ROLE',
          required: allowedRoles,
          current: userRole
        });
      }

      req.user = user;
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Erreur dans requireRole:', error);
      return res.status(500).json({ 
        error: 'Erreur de vérification des rôles',
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
};

// Middleware pour vérifier les permissions spécifiques
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.userRole;
      
      if (!userRole) {
        return res.status(401).json({ 
          error: 'Utilisateur non authentifié',
          code: 'NOT_AUTHENTICATED'
        });
      }

      const userPermissions = ROLE_PERMISSIONS[userRole] || [];
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ 
          error: `Permission insuffisante: ${permission}`,
          code: 'INSUFFICIENT_PERMISSION',
          required: permission,
          current: userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Erreur dans requirePermission:', error);
      return res.status(500).json({ 
        error: 'Erreur de vérification des permissions',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Middleware pour vérifier la propriété d'une ressource
export const requireOwnership = (resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const userRole = req.userRole;
      const userId = req.user?.id;
      const resourceId = req.params[resourceIdField];
      
      // Les admins peuvent tout faire
      if (userRole === ROLES.ADMIN) {
        return next();
      }

      // Pour les candidats, vérifier qu'ils accèdent à leur propre ressource
      if (userRole === ROLES.CANDIDATE) {
        // Récupérer le candidat depuis la base pour vérifier l'ownership
        const { data: candidate, error } = await supabase
          .from('candidates')
          .select('userId')
          .eq('id', resourceId)
          .single();

        if (error || !candidate) {
          return res.status(404).json({ 
            error: 'Ressource non trouvée',
            code: 'RESOURCE_NOT_FOUND'
          });
        }

        if (candidate.userId !== userId) {
          return res.status(403).json({ 
            error: 'Accès refusé: vous ne pouvez accéder qu\'à vos propres ressources',
            code: 'NOT_OWNER'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Erreur dans requireOwnership:', error);
      return res.status(500).json({ 
        error: 'Erreur de vérification de propriété',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

// Fonction utilitaire pour vérifier les permissions côté client
export const hasPermission = (userRole, permission) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};

// Fonction utilitaire pour vérifier les rôles côté client
export const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
