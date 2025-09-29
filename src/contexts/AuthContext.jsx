import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'
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
    console.log('🔍 Vérification/création profil candidat pour:', user.email)
    
    // Utiliser l'API backend au lieu de supabaseAdmin directement
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn('⚠️ Session non disponible pour création profil')
      return
    }
    
    // Appeler l'API backend pour créer/récupérer le profil
    const resp = await fetch(buildApiUrl('/api/candidates/me'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (resp.ok || resp.status === 201) {
      const profile = await resp.json()
      console.log('✅ Profil candidat vérifié/créé via API:', profile?.id)
    } else {
      console.warn('⚠️ Erreur API création profil:', resp.status)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du profil candidat:', error)
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
      // Séparer le rôle des métadonnées pour éviter les problèmes de trigger SQL
      const { role, ...metadataWithoutRole } = userData;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadataWithoutRole, // Pas de rôle dans les métadonnées
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      })
      
      if (error) throw error
      
      // Si l'inscription est réussie, créer automatiquement le profil selon le rôle
      if (data?.user) {
        try {
          if (role === 'candidate') {
            console.log('👤 Création du profil candidat pour:', data.user.email)
            
            // Utiliser directement la méthode locale (plus fiable)
            try {
              await createCandidateProfileIfNotExists(data.user)
              console.log('✅ Profil candidat créé via méthode locale')
            } catch (localError) {
              console.error('❌ Échec création locale:', localError)
              // Le webhook backend créera le profil en arrière-plan
              console.log('🔄 Le webhook backend créera le profil automatiquement')
            }
          } else if (role === 'recruiter') {
            console.log('🏢 Création du profil recruteur pour:', data.user.email)
            // Attendre un peu que la session soit disponible après signUp
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Utiliser l'API backend pour créer le profil recruteur (auto-bootstrap)
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              console.log('🔑 Session disponible, appel API...')
              const resp = await fetch(buildApiUrl('/api/recruiters/me'), {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json'
                }
              })
              if (resp.ok) {
                const profile = await resp.json()
                console.log('✅ Profil recruteur créé via API:', profile?.id)
              } else {
                console.warn('⚠️ Appel /api/recruiters/me non OK pendant inscription:', resp.status)
                const errorText = await resp.text()
                console.log('   Détails:', errorText)
              }
            } else {
              console.warn('⚠️ Session non disponible après signUp')
            }
          }
        } catch (profileError) {
          console.error('❌ Erreur lors de la création du profil:', profileError)
          // Ne pas faire échouer l'inscription si la création du profil échoue
          // L'utilisateur peut toujours se connecter et créer son profil manuellement
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
      
      // Vérifier et créer le profil si nécessaire après connexion
      if (data?.user) {
        try {
          const userRole = data.user.user_metadata?.role
          if (userRole === 'recruiter') {
            console.log('🔍 Vérification du profil recruteur pour:', data.user.email)
            // Utiliser l'API backend pour vérifier/créer le profil (auto-bootstrap)
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              const resp = await fetch(buildApiUrl('/api/recruiters/me'), {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json'
                }
              })
              if (resp.ok) {
                const profile = await resp.json()
                console.log('✅ Profil recruteur vérifié/créé via API:', profile?.id)
              } else {
                console.warn('⚠️ Appel /api/recruiters/me non OK pendant connexion:', resp.status)
              }
            }
          } else {
            // Par défaut, traiter comme un candidat si pas de rôle défini ou si candidat
            console.log('🔍 Vérification/création du profil candidat pour:', data.user.email)
            // Utiliser l'API backend pour vérifier/créer le candidat
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              const resp = await fetch(buildApiUrl('/api/candidates/me'), {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json'
                }
              })
              if (resp.ok || resp.status === 201) {
                const profile = await resp.json()
                console.log('✅ Profil candidat vérifié/créé via API:', profile?.id)
              } else {
                console.warn('⚠️ Appel /api/candidates/me non OK pendant connexion:', resp.status)
              }
            }
          }
        } catch (profileError) {
          console.error('❌ Erreur lors de la vérification/création du profil:', profileError)
          // Ne pas faire échouer la connexion si la création du profil échoue
        }
      }
      
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
