import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react'

export default function ConfirmEmailPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // 2FA/confirmation email désactivée temporairement: rediriger directement
    if (!user) {
      navigate('/login')
      return
    }
    
    // Rediriger selon le rôle après vérification d'email
    if (user?.user_metadata?.role === 'recruiter') {
      navigate('/pricing')
    } else {
      navigate('/my-profile/profile')
    }
  }, [user, navigate])

  const handleResendEmail = async () => {
    // Désactivé temporairement
    setError('La confirmation par e-mail est désactivée pour le moment.')
    setSuccess('')
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      setError('Erreur lors de la déconnexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-blue-600 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmez votre email
          </h1>
          <p className="text-gray-600">
            Nous avons envoyé un email de confirmation à
          </p>
          <p className="text-indigo-600 font-semibold mt-1">
            {user?.email}
          </p>
          {user?.user_metadata?.role && (
            <p className="text-sm text-gray-500 mt-2">
              Rôle: {user.user_metadata.role === 'recruiter' ? 'Recruteur' : 'Candidat'}
            </p>
          )}
        </div>

        {/* Contenu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
        >
          <div className="space-y-6">
            {/* Messages d'erreur/succès */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  <strong>Étapes à suivre :</strong>
                </p>
                <ol className="text-sm text-blue-600 mt-2 space-y-1 text-left">
                  <li>1. Vérifiez votre boîte de réception</li>
                  <li>2. Cliquez sur le lien de confirmation</li>
                  <li>3. Revenez sur cette page</li>
                </ol>
              </div>

              <p className="text-sm text-gray-600">
                Si vous ne recevez pas l'email, vérifiez votre dossier spam ou réessayez.
              </p>
            </div>

            {/* Boutons */}
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Renvoyer l'email
                  </div>
                )}
              </button>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Déconnexion...
                  </div>
                ) : (
                  'Se déconnecter'
                )}
              </button>
            </div>

            {/* Lien de retour */}
            <div className="text-center">
              <Link 
                to="/"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
