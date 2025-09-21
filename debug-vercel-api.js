import fetch from 'node-fetch';

async function debugVercelAPI() {
  console.log('🔍 Diagnostic complet de l\'API Vercel...\n');

  const testUrls = [
    'https://uxtalent.vercel.app/api/candidates/profile/be.loic23%2B1%40gmail.com',
    'https://uxtalent.vercel.app/api/candidates',
    'https://uxtalent.vercel.app/api/stripe/webhook'
  ];

  for (const url of testUrls) {
    console.log(`📡 Test: ${url}`);
    try {
      const response = await fetch(url, { method: 'GET' });
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Response length: ${text.length} chars`);
      console.log(`   Starts with: ${text.substring(0, 50)}...`);
      
      if (contentType?.includes('application/json')) {
        console.log('   ✅ JSON détecté');
        try {
          const json = JSON.parse(text);
          console.log('   📄 JSON valide:', Object.keys(json));
        } catch (e) {
          console.log('   ❌ JSON invalide');
        }
      } else if (contentType?.includes('text/html')) {
        console.log('   ❌ HTML retourné au lieu de JSON');
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    console.log('');
  }

  // Test de l'endpoint spécifique avec différentes méthodes
  console.log('🧪 Test des méthodes HTTP...');
  const testUrl = 'https://uxtalent.vercel.app/api/candidates/profile/be.loic23%2B1%40gmail.com';
  
  const methods = ['GET', 'POST', 'PUT', 'OPTIONS'];
  for (const method of methods) {
    try {
      const response = await fetch(testUrl, { method });
      console.log(`   ${method}: ${response.status} - ${response.headers.get('content-type')}`);
    } catch (error) {
      console.log(`   ${method}: Erreur - ${error.message}`);
    }
  }
}

debugVercelAPI();
