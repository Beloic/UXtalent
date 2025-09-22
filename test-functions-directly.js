// Script pour tester directement les fonctions de statistiques
import { supabase } from './src/lib/supabase.js';

// Copier les fonctions directement du serveur
async function getProfileViewsStats(candidateId) {
  try {
    const { data, error } = await supabase
      .from('profile_tracking')
      .select('*')
      .eq('candidate_id', candidateId);
    
    if (error) {
      console.error('Erreur lors de la récupération des statistiques de vues:', error);
      return [{ total_views: 0 }];
    }
    
    return [{ total_views: data.length }];
  } catch (error) {
    console.error('Erreur dans getProfileViewsStats:', error);
    return [{ total_views: 0 }];
  }
}

async function getProfileViewsToday(candidateId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data, error } = await supabase
      .from('profile_tracking')
      .select('COUNT(*) as count')
      .eq('candidate_id', candidateId)
      .gte('viewed_at', today.toISOString())
      .lt('viewed_at', tomorrow.toISOString());
    
    if (error) {
      console.error('Erreur lors de la récupération des vues d\'aujourd\'hui:', error);
      return 0;
    }
    
    return data.length > 0 ? parseInt(data[0].count) : 0;
  } catch (error) {
    console.error('Erreur dans getProfileViewsToday:', error);
    return 0;
  }
}

async function getProfileViewsByDay(candidateId) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('profile_tracking')
      .select('viewed_at')
      .eq('candidate_id', candidateId)
      .gte('viewed_at', sevenDaysAgo.toISOString())
      .order('viewed_at', { ascending: true });
    
    if (error) {
      console.error('Erreur lors de la récupération des vues par jour:', error);
      return [];
    }
    
    // Grouper par jour
    const dailyViews = {};
    data.forEach(view => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      dailyViews[date] = (dailyViews[date] || 0) + 1;
    });
    
    // Convertir en format attendu
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        views: dailyViews[dateStr] || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error('Erreur dans getProfileViewsByDay:', error);
    return [];
  }
}

async function testFunctions() {
  console.log('🧪 Test des fonctions de statistiques...');
  
  const candidateId = 1;
  
  try {
    console.log(`\n📊 Test pour le candidat ID: ${candidateId}`);
    
    const [viewsData, viewsTodayData, dailyViewsData] = await Promise.all([
      getProfileViewsStats(candidateId),
      getProfileViewsToday(candidateId),
      getProfileViewsByDay(candidateId)
    ]);
    
    console.log('✅ Résultats:');
    console.log('- Total vues:', viewsData[0]?.total_views || 0);
    console.log('- Vues aujourd\'hui:', viewsTodayData || 0);
    console.log('- Vues par jour:', dailyViewsData);
    
    // Calculer les vues des 7 derniers jours
    const viewsLast7Days = dailyViewsData.reduce((sum, day) => sum + (day.views || 0), 0);
    console.log('- Vues 7 derniers jours:', viewsLast7Days);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testFunctions();
