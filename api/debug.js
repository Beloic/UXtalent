export default function handler(req, res) {
  res.status(200).json({
    message: 'Debug API',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasViteSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      supabaseUrlLength: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'default').length,
      supabaseKeyLength: (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'default').length
    }
  });
}
