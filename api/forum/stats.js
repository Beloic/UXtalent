import { supabase } from '../_supabase.js';

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
      const [postsResult, repliesResult, candidatesResult] = await Promise.all([
        supabase.from('forum_posts').select('id', { count: 'exact' }),
        supabase.from('forum_replies').select('id', { count: 'exact' }),
        supabase.from('candidates').select('id', { count: 'exact' })
      ]);

      res.status(200).json({
        totalPosts: postsResult.count || 0,
        totalReplies: repliesResult.count || 0,
        totalUsers: candidatesResult.count || 0
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
