#!/usr/bin/env node

/**
 * Script pour créer un profil candidat
 * Usage: node create-candidate-profile.js <email> <nom>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCandidateProfile(email, name) {
  try {
    console.log(`🔄 Création du profil candidat pour ${email}...`);
    
    const candidateData = {
      email: email,
      name: name,
      title: 'UX Designer', // À personnaliser
      location: 'Paris, France', // À personnaliser
      remote: 'hybrid',
      experience: 'Mid',
      skills: ['Figma', 'Adobe XD', 'Prototypage', 'Recherche utilisateur'],
      bio: 'UX Designer passionné par la création d\'expériences utilisateur exceptionnelles.',
      portfolio: '',
      linkedin: '',
      salary: '',
      languages: ['Français', 'Anglais'],
      photo: '',
      status: 'approved', // Approuvé directement pour les tests
      plan_type: 'free'
    };

    const { data, error } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      return false;
    }

    console.log('✅ Profil candidat créé avec succès:', data);
    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node create-candidate-profile.js <email> <nom>');
  console.log('Exemple: node create-candidate-profile.js test@example.com "Jean Dupont"');
  process.exit(1);
}

const [email, name] = args;

createCandidateProfile(email, name)
  .then(success => {
    if (success) {
      console.log('🎉 Profil candidat créé ! Vous pouvez maintenant postuler aux offres.');
    } else {
      console.log('❌ Échec de la création du profil candidat.');
    }
    process.exit(success ? 0 : 1);
  });
