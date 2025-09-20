import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { buildApiUrl } from '../config/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Fonction pour créer automatiquement un profil candidat lors de l'inscription
const createCandidateProfileIfNotExists = async (user) => {
  try {
    console.log('🔄 [SIGNUP_CREATE] Vérification du profil candidat pour:', user.email)
    
    // Vérifier si le profil existe déjà
    const response = await fetch(buildApiUrl(`/api/candidates/profile/${encodeURIComponent(user.email)}`))
    
    if (response.ok) {
      console.log('✅ [SIGNUP_CREATE] Profil candidat existe déjà')
      return
    }
    
    if (response.status === 404) {
      console.log('🆕 [SIGNUP_CREATE] Création automatique du profil candidat...')
      
      // Créer le profil candidat avec statut 'new'
      const candidateData = {
        name: user.user_metadata?.first_name && user.user_metadata?.last_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user.email?.split('@')[0] || 'Nouveau Candidat',
        email: user.email,
        bio: 'Profil créé automatiquement lors de l\'inscription.',
        title: '',
        location: '',
        remote: 'hybrid',
        skills: [],
        portfolio: '',
        linkedin: '',
        github: '',
        dailyRate: null,
        annualSalary: null,
        status: 'pending' // Statut pour les nouveaux profils (en attente de validation)
      }
      
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      
      if (!token) {
        console.error('❌ [SIGNUP_CREATE] Token d\'authentification manquant')
        return
      }
      
      const createResponse = await fetch(buildApiUrl('/api/candidates'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(candidateData)
      })
      
      if (createResponse.ok) {
        console.log('✅ [SIGNUP_CREATE] Profil candidat créé avec succès avec statut "pending"')
      } else {
        console.error('❌ [SIGNUP_CREATE] Erreur lors de la création:', await createResponse.text())
      }
    }
  } catch (error) {
    console.error('❌ [SIGNUP_CREATE] Erreur inattendue:', error)
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Générer un ID utilisateur unique s'il n'existe pas
    if (!localStorage.getItem('userId')) {
      const userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }

    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      })
      
      if (error) throw error
      
      // Si l'inscription est réussie et que c'est un candidat, créer automatiquement le profil
      if (data?.user && userData?.role === 'candidate') {
        console.log('🆕 [SIGNUP] Création automatique du profil candidat après inscription réussie')
        await createCandidateProfileIfNotExists(data.user)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    // 2FA/confirmation email désactivée temporairement: considérer les emails comme confirmés
    isEmailConfirmed: true
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
