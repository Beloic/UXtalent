#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Générer un email de test unique
const testEmail = `test-candidate-${Date.now()}@example.com`
const testPassword = 'TestPassword123!'

async function testAutoSignup() {
  try {
    console.log('🧪 Test du système d\'inscription automatique')
    console.log('📧 Email de test:', testEmail)
    
    // 1. Créer un compte candidat
    console.log('\n🔵 Étape 1: Inscription candidat...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Candidat',
          role: 'candidate'
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ Erreur inscription:', signUpError)
      return
    }
    
    console.log('✅ Inscription réussie, ID utilisateur:', signUpData.user?.id)
    
    // 2. Attendre que le trigger/webhook fonctionne
    console.log('\n🔵 Étape 2: Attente création profil candidat (5s)...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 3. Vérifier si le profil candidat a été créé
    console.log('\n🔵 Étape 3: Vérification profil candidat...')
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('email', testEmail)
      .single()
    
    if (candidateError) {
      if (candidateError.code === 'PGRST116') {
        console.log('❌ ÉCHEC: Profil candidat non créé automatiquement')
        console.log('   Trigger/webhook n\'a pas fonctionné')
      } else {
        console.error('❌ Erreur lors de la vérification:', candidateError)
      }
    } else {
      console.log('✅ SUCCÈS: Profil candidat créé automatiquement!')
      console.log('   ID candidat:', candidate.id)
      console.log('   Nom:', candidate.name)
      console.log('   Statut:', candidate.status)
    }
    
    // 4. Nettoyer les données de test
    console.log('\n🔵 Étape 4: Nettoyage...')
    
    // Supprimer le candidat
    if (candidate) {
      await supabaseAdmin
        .from('candidates')
        .delete()
        .eq('id', candidate.id)
      console.log('🗑️ Profil candidat supprimé')
    }
    
    // Supprimer l'utilisateur auth
    if (signUpData.user?.id) {
      await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id)
      console.log('🗑️ Utilisateur Auth supprimé')
    }
    
    console.log('\n🎉 Test terminé!')
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
  }
}

// Test de l'endpoint webhook
async function testWebhookEndpoint() {
  try {
    console.log('\n🧪 Test de l\'endpoint webhook...')
    
    const webhookPayload = {
      type: 'INSERT',
      record: {
        email: 'test-webhook@example.com',
        raw_user_meta_data: {
          first_name: 'Test',
          last_name: 'Webhook',
          role: 'candidate'
        }
      }
    }
    
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (webhookSecret) {
      headers['Authorization'] = `Bearer ${webhookSecret}`
    }
    
    const response = await fetch('http://localhost:3001/api/auth/webhook', {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Webhook fonctionne:', result)
    } else {
      console.log('❌ Webhook échec:', response.status, await response.text())
    }
    
  } catch (error) {
    console.error('❌ Erreur test webhook:', error)
  }
}

// Exécuter les tests
console.log('🚀 Début des tests du système d\'inscription automatique\n')

await testAutoSignup()
await testWebhookEndpoint()

console.log('\n✨ Tous les tests terminés!')
