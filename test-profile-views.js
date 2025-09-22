// Script de test pour simuler des vues de profil
import { supabase } from './src/lib/supabase.js';

async function simulateProfileViews() {
  console.log('🎯 Simulation de vues de profil...');
  
  // ID de candidat de test (remplacez par un vrai ID si vous en avez un)
  const testCandidateId = '550e8400-e29b-41d4-a716-446655440000';
  
  try {
    // Simuler des vues sur les 7 derniers jours
    const views = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Générer entre 1 et 5 vues par jour
      const viewsCount = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < viewsCount; j++) {
        const viewTime = new Date(date);
        viewTime.setHours(Math.floor(Math.random() * 24));
        viewTime.setMinutes(Math.floor(Math.random() * 60));
        
        views.push({
          candidate_id: testCandidateId,
          viewer_ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          viewed_at: viewTime.toISOString(),
          referrer_url: 'https://ux-jobs-pro.com/candidates'
        });
      }
    }
    
    console.log(`📊 Insertion de ${views.length} vues simulées...`);
    
    // Insérer les vues dans la base de données
    const { data, error } = await supabase
      .from('profile_tracking')
      .insert(views);
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return;
    }
    
    console.log('✅ Vues simulées insérées avec succès !');
    
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
simulateProfileViews();
