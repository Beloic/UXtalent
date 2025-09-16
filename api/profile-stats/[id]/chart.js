import { supabase } from '../../_supabase.js';

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      const { period = 'week', offset = 0 } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      let startDate, endDate;
      const now = new Date();
      
      switch (period) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - (6 + offset * 7));
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - (29 + offset * 30));
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 29);
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - offset, 0, 1);
          endDate = new Date(now.getFullYear() - offset, 11, 31);
          break;
        default:
          return res.status(400).json({ error: 'Invalid period' });
      }

      const { data, error } = await supabase
        .from('profile_tracking')
        .select('viewed_at')
        .eq('candidate_id', id)
        .gte('viewed_at', startDate.toISOString())
        .lte('viewed_at', endDate.toISOString())
        .order('viewed_at', { ascending: true });

      if (error) throw error;

      // Grouper les données par jour
      const groupedViews = {};
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        groupedViews[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Compter les vues par jour
      data?.forEach(view => {
        const dateStr = view.viewed_at.split('T')[0];
        if (groupedViews.hasOwnProperty(dateStr)) {
          groupedViews[dateStr]++;
        }
      });

      // Convertir en format pour le graphique
      const result = Object.entries(groupedViews).map(([date, views]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' }),
        views,
        fullDate: date
      }));

      res.status(200).json(result);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
