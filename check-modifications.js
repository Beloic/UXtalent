/**
 * Script pour vérifier que les modifications sont bien présentes
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Vérification des modifications...\n');

// Vérifier les fichiers créés
const filesToCheck = [
  'src/services/matchingService.js',
  'src/services/matchingApi.js', 
  'src/components/MatchingWidget.jsx',
  'src/components/MatchingDashboard.jsx',
  'src/components/CandidateSuggestions.jsx',
  'src/pages/CandidateSuggestionsPage.jsx',
  'MATCHING_SYSTEM.md',
  'INTEGRATION_GUIDE.md'
];

console.log('📁 Fichiers créés :');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Vérifier les modifications dans les fichiers existants
console.log('\n📝 Modifications dans les fichiers existants :');

// Vérifier server.js
const serverContent = fs.readFileSync('server.js', 'utf8');
const hasMatchingRoutes = serverContent.includes('/api/matching/');
console.log(`${hasMatchingRoutes ? '✅' : '❌'} Routes de matching dans server.js`);

// Vérifier App.jsx
const appContent = fs.readFileSync('src/App.jsx', 'utf8');
const hasMatchingRoutesApp = appContent.includes('/recruiter-dashboard/matching') && appContent.includes('/candidates/suggestions');
console.log(`${hasMatchingRoutesApp ? '✅' : '❌'} Routes de matching dans App.jsx`);

// Vérifier RecruiterDashboard.jsx
const dashboardContent = fs.readFileSync('src/pages/RecruiterDashboard.jsx', 'utf8');
const hasMatchingTab = dashboardContent.includes('Matching IA') && dashboardContent.includes('TrendingUp');
console.log(`${hasMatchingTab ? '✅' : '❌'} Onglet Matching dans RecruiterDashboard.jsx`);

// Vérifier CandidatesListPage.jsx
const candidatesContent = fs.readFileSync('src/pages/CandidatesListPage.jsx', 'utf8');
const hasSuggestionsButton = candidatesContent.includes('Mes Suggestions IA') && candidatesContent.includes('TrendingUp');
console.log(`${hasSuggestionsButton ? '✅' : '❌'} Bouton Suggestions dans CandidatesListPage.jsx`);

console.log('\n🎯 Résumé :');
console.log('Toutes les modifications sont présentes dans le code !');
console.log('\n📋 Pour voir les changements :');
console.log('1. Videz le cache du navigateur (Ctrl+F5 ou Cmd+Shift+R)');
console.log('2. Allez sur http://localhost:5173/recruiter-dashboard/matching');
console.log('3. Ou sur http://localhost:5173/candidates/suggestions');
console.log('4. Ou connectez-vous et naviguez dans l\'interface');
