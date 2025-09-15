import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { AlertCircle, Lock, UserX } from 'lucide-react';

// Composant pour protéger l'accès basé sur les rôles
export const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  fallback = null,
  showError = true 
}) => {
  const { hasRoleAccess, isAuthenticated, userRole } = usePermissions();
  
  // Si pas d'authentification
  if (!isAuthenticated) {
    if (fallback) return fallback;
    if (!showError) return null;
    
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-500">
            Vous devez être connecté pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }
  
  // Si rôle insuffisant
  if (!hasRoleAccess(allowedRoles)) {
    if (fallback) return fallback;
    if (!showError) return null;
    
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
        <div className="text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Accès refusé
          </h3>
          <p className="text-red-600 mb-2">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <p className="text-sm text-red-500">
            Rôle requis: {allowedRoles.join(' ou ')} | Votre rôle: {userRole || 'Non défini'}
          </p>
        </div>
      </div>
    );
  }
  
  return children;
};

// Composant pour protéger l'accès basé sur les permissions
export const PermissionGuard = ({ 
  children, 
  permission, 
  fallback = null,
  showError = true 
}) => {
  const { can, isAuthenticated, userRole } = usePermissions();
  
  // Si pas d'authentification
  if (!isAuthenticated) {
    if (fallback) return fallback;
    if (!showError) return null;
    
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-500">
            Vous devez être connecté pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }
  
  // Si permission insuffisante
  if (!can(permission)) {
    if (fallback) return fallback;
    if (!showError) return null;
    
    return (
      <div className="flex items-center justify-center p-8 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">
            Permission insuffisante
          </h3>
          <p className="text-yellow-600 mb-2">
            Vous n'avez pas la permission "{permission}" pour accéder à cette section.
          </p>
          <p className="text-sm text-yellow-500">
            Votre rôle: {userRole || 'Non défini'}
          </p>
        </div>
      </div>
    );
  }
  
  return children;
};

// Composant pour afficher du contenu conditionnel basé sur les rôles
export const RoleBasedContent = ({ 
  candidate = null,
  recruiter = null,
  admin = null,
  fallback = null 
}) => {
  const { isCandidate, isRecruiter, isAdmin } = usePermissions();
  
  if (isCandidate && candidate) return candidate;
  if (isRecruiter && recruiter) return recruiter;
  if (isAdmin && admin) return admin;
  
  return fallback;
};

// Composant pour afficher du contenu conditionnel basé sur les permissions
export const PermissionBasedContent = ({ 
  children, 
  permission, 
  fallback = null 
}) => {
  const { can } = usePermissions();
  
  if (can(permission)) {
    return children;
  }
  
  return fallback;
};

// Composant pour masquer/afficher des éléments selon les permissions
export const ConditionalRender = ({ 
  children, 
  permission = null, 
  role = null, 
  authenticated = null 
}) => {
  const { can, hasRoleAccess, isAuthenticated } = usePermissions();
  
  // Vérifier l'authentification si spécifiée
  if (authenticated !== null && isAuthenticated !== authenticated) {
    return null;
  }
  
  // Vérifier le rôle si spécifié
  if (role && !hasRoleAccess(Array.isArray(role) ? role : [role])) {
    return null;
  }
  
  // Vérifier la permission si spécifiée
  if (permission && !can(permission)) {
    return null;
  }
  
  return children;
};
