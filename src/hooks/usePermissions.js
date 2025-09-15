import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasRole, ROLES, PERMISSIONS } from '../middleware/roleMiddleware';

// Hook pour gérer les permissions côté client
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Récupérer le rôle de l'utilisateur
  const userRole = user?.user_metadata?.role;
  
  // Fonctions de vérification des permissions
  const can = (permission) => {
    if (!isAuthenticated || !userRole) return false;
    return hasPermission(userRole, permission);
  };
  
  const hasRoleAccess = (allowedRoles) => {
    if (!isAuthenticated || !userRole) return false;
    return hasRole(userRole, allowedRoles);
  };
  
  // Vérifications spécifiques par rôle
  const isCandidate = userRole === ROLES.CANDIDATE;
  const isRecruiter = userRole === ROLES.RECRUITER;
  const isAdmin = userRole === ROLES.ADMIN;
  
  // Permissions spécifiques
  const canViewOwnProfile = can(PERMISSIONS.VIEW_OWN_PROFILE);
  const canEditOwnProfile = can(PERMISSIONS.EDIT_OWN_PROFILE);
  const canViewOwnStats = can(PERMISSIONS.VIEW_OWN_STATS);
  const canViewAllCandidates = can(PERMISSIONS.VIEW_ALL_CANDIDATES);
  const canContactCandidates = can(PERMISSIONS.CONTACT_CANDIDATES);
  const canExportData = can(PERMISSIONS.EXPORT_DATA);
  const canViewAllProfiles = can(PERMISSIONS.VIEW_ALL_PROFILES);
  const canApproveProfiles = can(PERMISSIONS.APPROVE_PROFILES);
  const canDeleteProfiles = can(PERMISSIONS.DELETE_PROFILES);
  const canManageUsers = can(PERMISSIONS.MANAGE_USERS);
  const canViewAnalytics = can(PERMISSIONS.VIEW_ANALYTICS);
  
  return {
    // État de base
    userRole,
    isAuthenticated,
    
    // Rôles
    isCandidate,
    isRecruiter,
    isAdmin,
    
    // Fonctions génériques
    can,
    hasRoleAccess,
    
    // Permissions spécifiques
    canViewOwnProfile,
    canEditOwnProfile,
    canViewOwnStats,
    canViewAllCandidates,
    canContactCandidates,
    canExportData,
    canViewAllProfiles,
    canApproveProfiles,
    canDeleteProfiles,
    canManageUsers,
    canViewAnalytics,
    
    // Constantes exportées pour utilisation directe
    ROLES,
    PERMISSIONS
  };
};

// Hook pour protéger les composants
export const useRequirePermission = (permission) => {
  const { can, isAuthenticated } = usePermissions();
  
  if (!isAuthenticated) {
    return { hasAccess: false, reason: 'NOT_AUTHENTICATED' };
  }
  
  if (!can(permission)) {
    return { hasAccess: false, reason: 'INSUFFICIENT_PERMISSION' };
  }
  
  return { hasAccess: true };
};

// Hook pour protéger les composants par rôle
export const useRequireRole = (allowedRoles) => {
  const { hasRoleAccess, isAuthenticated, userRole } = usePermissions();
  
  if (!isAuthenticated) {
    return { hasAccess: false, reason: 'NOT_AUTHENTICATED' };
  }
  
  if (!hasRoleAccess(allowedRoles)) {
    return { hasAccess: false, reason: 'INSUFFICIENT_ROLE', currentRole: userRole };
  }
  
  return { hasAccess: true };
};
