#!/usr/bin/env node

/**
 * Script pour créer un profil candidat manquant pour un utilisateur existant dans Auth
 * Usage: node create-missing-candidate-profile.js <email>
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ktfdrwpvofxuktnunukv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY manquante dans les variables d\'environnement')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createMissingCandidateProfile(email) {
  try {
    console.log(`🔍 Recherche de l'utilisateur ${email} dans Auth...`)
    
    // 1. Vérifier que l'utilisateur existe dans Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs Auth:', authError)
      return
    }
    
    const user = authUsers.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ Utilisateur ${email} non trouvé dans Supabase Auth`)
      return
    }
    
    console.log(`✅ Utilisateur trouvé dans Auth:`, {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      role: user.user_metadata?.role
    })
    
    // 2. Vérifier si le profil candidat existe déjà
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('candidates')
      .select('id, email')
      .eq('email', email)
      .single()
    
    if (existingProfile) {
      console.log(`✅ Profil candidat existe déjà pour ${email}:`, existingProfile)
      return
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification du profil:', checkError)
      return
    }
    
    // 3. Créer le profil candidat
    console.log(`🆕 Création du profil candidat pour ${email}...`)
    
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
      console.error('❌ Erreur lors de la création du profil:', createError)
      return
    }
    
    console.log(`✅ Profil candidat créé avec succès:`, {
      id: newProfile.id,
      name: newProfile.name,
      email: newProfile.email,
      status: newProfile.status
    })
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: node create-missing-candidate-profile.js <email>')
  console.error('   Exemple: node create-missing-candidate-profile.js cyril@penguinscrossing.com')
  process.exit(1)
}

// Valider le format email basique
if (!email.includes('@') || !email.includes('.')) {
  console.error('❌ Format d\'email invalide')
  process.exit(1)
}

console.log(`🚀 Début de la création du profil candidat pour: ${email}`)
createMissingCandidateProfile(email)
  .then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
