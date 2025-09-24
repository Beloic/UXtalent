import 'dotenv/config'
import { supabaseAdmin } from '../src/lib/supabase.js'
import { updateRecruiterPlan } from '../src/database/recruitersDatabase.js'

async function main() {
  try {
    if (!supabaseAdmin) {
      console.error('supabaseAdmin non configuré. Vérifiez SUPABASE_SERVICE_KEY')
      process.exit(1)
    }

    const testEmail = process.env.TEST_RECRUITER_EMAIL || 'recruteur.max.test+uxjobs@example.com'
    const testPassword = process.env.TEST_RECRUITER_PASSWORD || 'UxJobsPro!Test123'

    // 1) Créer utilisateur Auth s'il n'existe pas
    let userId
    // Supabase n'a pas de getUserByEmail côté admin facilement; on liste par email via auth.admin.listUsers
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listError) throw listError
    const existing = listData.users.find(u => u.email?.toLowerCase() === testEmail.toLowerCase())
    if (existing) {
      userId = existing.id
      console.log('Utilisateur déjà existant:', testEmail, userId)
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { role: 'recruiter' }
      })
      if (createError) throw createError
      userId = created.user.id
      console.log('Utilisateur créé:', testEmail, userId)
    }

    // 2) Créer ou mettre à jour le profil recruteur dans table recruiters
    const { data: profileCheck, error: profileCheckError } = await supabaseAdmin
      .from('recruiters')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows
      throw profileCheckError
    }

    let recruiterId
    if (!profileCheck) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('recruiters')
        .insert({
          email: testEmail,
          name: 'Recruteur Test Max',
          company: 'UX Jobs Pro (Test)',
          status: 'active',
          plan_type: 'max',
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString()
        })
        .select('*')
        .single()
      if (insertError) throw insertError
      recruiterId = inserted.id
      console.log('Profil recruteur créé:', recruiterId)
    } else {
      recruiterId = profileCheck.id
      console.log('Profil recruteur existant:', recruiterId)
      // Normaliser au plan Max actif
      const { error: updError } = await supabaseAdmin
        .from('recruiters')
        .update({
          plan_type: 'max',
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: null,
          status: 'active'
        })
        .eq('id', recruiterId)
      if (updError) throw updError
    }

    // 3) Optionnel: aligner quotas via helper si disponible
    try {
      if (typeof updateRecruiterPlan === 'function') {
        await updateRecruiterPlan(recruiterId, 'max', { status: 'active' })
      }
    } catch (e) {
      console.warn('updateRecruiterPlan a échoué (ignoré):', e.message)
    }

    console.log('\nIdentifiants de connexion test:')
    console.log('Email:', testEmail)
    console.log('Mot de passe:', testPassword)
    console.log('\n✅ Compte recruteur Test (Max) prêt.')
  } catch (error) {
    console.error('Erreur seed recruteur max:', error)
    process.exit(1)
  }
}

main()


