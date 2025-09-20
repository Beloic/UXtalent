async function testApiProfile(email) {
  try {
    console.log(`🔍 Test de l'API /api/candidates/profile/${email}`);
    
    // URL de production
    const url = `https://uxtalent.vercel.app/api/candidates/profile/${encodeURIComponent(email)}`;
    console.log('📡 URL:', url);
    
    const response = await fetch(url);
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données reçues:');
      console.log('   ID:', data.id);
      console.log('   Nom:', data.name);
      console.log('   Email:', data.email);
      console.log('   Statut:', data.status);
      console.log('   Plan:', data.plan);
      console.log('   Créé:', data.created_at);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Tester avec l'email du candidat de test
testApiProfile('be.loic23+24@gmail.com');
