import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader } from 'lucide-react'

export default function ProtectedRoute({ children, requireEmailConfirmation = false }) {
  const { user, loading, isEmailConfirmed } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireEmailConfirmation && !isEmailConfirmed) {
    // Rediriger vers une page de confirmation d'email
    return <Navigate to="/confirm-email" replace />
  }

  return children
}
