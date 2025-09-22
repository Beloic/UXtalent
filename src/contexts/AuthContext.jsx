import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { buildApiUrl } from '../config/api'
import { createRecruiter, getRecruiterByEmail } from '../database/recruitersDatabase.js'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Fonction pour créer automatiquement un profil recruteur lors de l'inscription
const createRecruiterProfileIfNotExists = async (user) => {
  try {
    
    // Vérifier si le profil existe déjà
    const existingProfile = await getRecruiterByEmail(user.email)
    
    if (existingProfile) {
      return
    }
    
    
    // Créer le profil recruteur avec les données par défaut
    const recruiterData = {
      email: user.email,
      name: user.user_metadata?.first_name && user.user_metadata?.last_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user.email?.split('@')[0] || 'Nouveau Recruteur',
      company: user.user_metadata?.company || '',
      phone: user.user_metadata?.phone || '',
      website: user.user_metadata?.website || '',
      planType: 'starter', // Plan par défaut
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      maxJobPosts: 5,
      maxCandidateContacts: 100,
      maxFeaturedJobs: 1,
      status: 'active',
      notes: 'Profil créé automatiquement lors de l\'inscription.'
    }
    
    const newRecruiter = await createRecruiter(recruiterData)
    
  } catch (error) {
    // Ne pas faire échouer l'inscription si la création du profil échoue
  }
}

// Fonction pour créer automatiquement un profil candidat lors de l'inscription
const createCandidateProfileIfNotExists = async (user) => {
  try {
    
    // Vérifier si le profil existe déjà en utilisant l'admin client
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('candidates')
      .select('id')
      .eq('email', user.email)
      .single()
    
    if (existingProfile) {
      return
    }
    
    if (checkError && checkError.code === 'PGRST116') {
      // Profil n'existe pas, on peut le créer
      
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
        daily_rate: null,
        annual_salary: null,
        status: 'new' // Statut pour les nouveaux profils (pas encore envoyé pour validation)
      }
      
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('candidates')
        .insert([candidateData])
        .select()
        .single()
      
      if (createError) {
      } else {
      }
    } else if (checkError) {
    }
  } catch (error) {
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
      
      // Si l'inscription est réussie, créer automatiquement le profil selon le rôle
      if (data?.user) {
        if (userData?.role === 'candidate') {
          await createCandidateProfileIfNotExists(data.user)
        } else if (userData?.role === 'recruiter') {
          await createRecruiterProfileIfNotExists(data.user)
        }
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
