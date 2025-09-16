export default async function handler(req, res) {
  try {
    // Test 1: Appel vers un service public
    const publicResponse = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const publicData = await publicResponse.json();
    
    // Test 2: Appel vers Supabase REST API
    const supabaseUrl = process.env.SUPABASE_URL || 'https://khbtdpewrtkrzafrpebn.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYnRkcGV3cnRrcnphZnJwZWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzU2MTksImV4cCI6MjA0MTcxMTYxOX0.7qG1FCZxtM_OHe4H6e_2f_y5aLRLKqhfyR8VCj2mP8g';
    
    let supabaseResult = 'failed';
    try {
      const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      supabaseResult = `status: ${supabaseResponse.status}`;
    } catch (e) {
      supabaseResult = `error: ${e.message}`;
    }
    
    res.status(200).json({
      publicApiWorks: !!publicData.id,
      publicData: publicData.title,
      supabaseTest: supabaseResult,
      networkWorks: true
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      networkWorks: false 
    });
  }
}
