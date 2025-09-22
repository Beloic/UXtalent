// Script de test simple pour simuler des vues de profil
import { supabase } from './src/lib/supabase.js';

async function simulateSimpleViews() {
  console.log('🎯 Simulation simple de vues de profil...');
  
  // ID de candidat de test (entier)
  const testCandidateId = 1;
  
  try {
    // D'abord, vérifions la structure de la table
    console.log('🔍 Vérification de la structure de la table...');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('profile_tracking')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erreur lors de la vérification de la table:', sampleError);
      return;
    }
    
    console.log('📋 Structure de la table:', sampleData.length > 0 ? Object.keys(sampleData[0]) : 'Table vide');
    
    // Créer des vues simples
    const views = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      views.push({
        candidate_id: testCandidateId,
        viewed_at: date.toISOString()
      });
    }
    
    console.log(`📊 Insertion de ${views.length} vues simples...`);
    
    // Insérer les vues dans la base de données
    const { data, error } = await supabase
      .from('profile_tracking')
      .insert(views);
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return;
    }
    
    console.log('✅ Vues insérées avec succès !');
    
    // Tester l'endpoint des statistiques
    console.log('🔍 Test de l\'endpoint des statistiques...');
    
    const response = await fetch('http://localhost:3001/api/candidates/' + testCandidateId + '/stats');
    const stats = await response.json();
    
    console.log('📈 Statistiques récupérées:', JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
simulateSimpleViews();
