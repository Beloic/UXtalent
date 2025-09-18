// Script: Mettre certains candidats en "pending" dans Supabase
// Usage: node scripts/update-candidates-pending.js "Marie Dubois,Pierre Martin,Sophie Laurent"

import { supabaseAdmin } from '../src/config/supabase.js'

async function run() {
  try {
    const namesArg = process.argv[2] || ''
    const names = namesArg
      .split(',')
      .map(n => n.trim())
      .filter(Boolean)

    if (names.length === 0) {
      console.error('Veuillez fournir une liste de noms séparés par des virgules en argument.')
      process.exit(1)
    }

    console.log('Candidats ciblés:', names)

    // Récupérer les candidats correspondants
    const { data: found, error: findError } = await supabaseAdmin
      .from('candidates')
      .select('id, name, approved, visible, status')
      .in('name', names)

    if (findError) {
      console.error('Erreur lors de la recherche:', findError.message)
      process.exit(1)
    }

    if (!found || found.length === 0) {
      console.log('Aucun candidat trouvé pour les noms fournis.')
      process.exit(0)
    }

    console.log('Trouvés:', found.map(c => `${c.name}#${c.id}`).join(', '))

    const ids = found.map(c => c.id)

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('candidates')
      .update({ approved: false, visible: false, status: 'pending', updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id, name, approved, visible, status')

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError.message)
      process.exit(1)
    }

    console.log('Mises à jour:', updated)
    console.log('Terminé.')
  } catch (e) {
    console.error('Erreur inattendue:', e)
    process.exit(1)
  }
}

run()


