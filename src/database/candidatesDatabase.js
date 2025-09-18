import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../../data/candidates.json');

// Charger les candidats depuis le fichier JSON
export function loadCandidates() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des candidats:', error);
  }
  
  // Retourner des données par défaut si le fichier n'existe pas
  console.log('📁 Utilisation des données par défaut (fichier JSON non trouvé)');
  return [
    {
      id: "1",
      name: "Marie Dubois",
      title: "Senior UX Designer",
      location: "Paris, France",
      remote: "hybrid",
      experience: "Senior",
      skills: ["Figma", "Research", "Prototyping", "User Testing", "Design Systems"],
      bio: "UX Designer avec 5 ans d'expérience dans le design d'interfaces utilisateur. Passionnée par la recherche utilisateur et la création d'expériences digitales intuitives.",
      portfolio: "https://mariedubois.design",
      linkedin: "https://linkedin.com/in/mariedubois",
      email: "marie.dubois@email.com",
      availability: "available",
      salary: "50-65k€",
      languages: ["Français", "Anglais"],
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      visible: true,
      status: 'approved',
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2", 
      name: "Thomas Martin",
      title: "Product Designer",
      location: "Lyon, France",
      remote: "remote",
      experience: "Mid",
      skills: ["Sketch", "Figma", "Principle", "User Research", "Mobile Design"],
      bio: "Product Designer spécialisé dans les applications mobiles. Expérience dans les startups tech et passionné par l'innovation.",
      portfolio: "https://thomasmartin.design",
      linkedin: "https://linkedin.com/in/thomasmartin",
      email: "thomas.martin@email.com",
      availability: "available",
      salary: "40-55k€",
      languages: ["Français", "Anglais", "Espagnol"],
      photo: "",
      visible: true,
      status: 'approved',
      createdAt: "2024-01-14T14:30:00Z",
      updatedAt: "2024-01-14T14:30:00Z"
    },
    {
      id: "3",
      name: "Sophie Chen",
      title: "UX Researcher",
      location: "Bordeaux, France",
      remote: "onsite",
      experience: "Senior",
      skills: ["User Research", "Usability Testing", "Analytics", "Figma", "Miro"],
      bio: "UX Researcher avec une expertise en méthodes qualitatives et quantitatives. Expérience dans l'e-commerce et les services financiers.",
      portfolio: "https://sophiechen.research",
      linkedin: "https://linkedin.com/in/sophiechen",
      email: "sophie.chen@email.com",
      availability: "available",
      salary: "45-60k€",
      languages: ["Français", "Anglais", "Mandarin"],
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      visible: true,
      status: 'approved',
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T09:15:00Z"
    },
    {
      id: "4",
      name: "Alexandre Rousseau",
      title: "Lead UX Designer",
      location: "Marseille, France",
      remote: "hybrid",
      experience: "Lead",
      skills: ["Design Leadership", "Figma", "Design Systems", "Strategy", "Team Management"],
      bio: "Lead UX Designer avec 8 ans d'expérience et une expertise en leadership d'équipe design. Spécialisé dans la création de design systems.",
      portfolio: "https://alexrousseau.design",
      linkedin: "https://linkedin.com/in/alexrousseau",
      email: "alexandre.rousseau@email.com",
      availability: "busy",
      salary: "65-80k€",
      languages: ["Français", "Anglais"],
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      visible: false,
      approved: false,
      createdAt: "2024-01-12T16:20:00Z",
      updatedAt: "2024-01-12T16:20:00Z"
    },
    {
      id: "5",
      name: "Emma Laurent",
      title: "Junior UX Designer",
      location: "Toulouse, France",
      remote: "onsite",
      experience: "Junior",
      skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Wireframing"],
      bio: "Jeune UX Designer motivée avec une formation solide en design d'interface. Recherche une première expérience dans une équipe dynamique.",
      portfolio: "https://emmalaurant.design",
      linkedin: "https://linkedin.com/in/emmalaurant",
      email: "emma.laurent@email.com",
      availability: "available",
      salary: "30-40k€",
      languages: ["Français", "Anglais"],
      photo: "",
      visible: false,
      approved: false,
      createdAt: "2024-01-11T11:45:00Z",
      updatedAt: "2024-01-11T11:45:00Z"
    },
    {
      id: "6",
      name: "Julien Moreau",
      title: "Product Designer",
      location: "Nantes, France",
      remote: "remote",
      experience: "Mid",
      skills: ["Figma", "Principle", "After Effects", "Motion Design", "Mobile Design"],
      bio: "Product Designer spécialisé dans le motion design et les interactions. Passionné par la création d'expériences fluides et engageantes.",
      portfolio: "https://julienmoreau.design",
      linkedin: "https://linkedin.com/in/julienmoreau",
      email: "julien.moreau@email.com",
      availability: "available",
      salary: "45-60k€",
      languages: ["Français", "Anglais"],
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      visible: false,
      approved: false,
      createdAt: "2024-01-10T14:30:00Z",
      updatedAt: "2024-01-10T14:30:00Z"
    }
  ];
}

// Sauvegarder les candidats dans le fichier JSON
export function saveCandidates(candidates) {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(candidates, null, 2));
    console.log(`💾 ${candidates.length} candidats sauvegardés dans ${DATA_FILE}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des candidats:', error);
    return false;
  }
}

// Ajouter un nouveau candidat
export function addCandidate(candidate) {
  const existingCandidates = loadCandidates();
  const newCandidate = {
    ...candidate,
    id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    approved: candidate.approved !== undefined ? candidate.approved : false, // Par défaut non approuvé
    visible: candidate.visible !== undefined ? candidate.visible : false,   // Par défaut non visible
    status: candidate.status || 'pending', // Par défaut en attente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedCandidates = [newCandidate, ...existingCandidates];
  saveCandidates(updatedCandidates);
  console.log(`✨ Nouveau candidat ajouté: ${newCandidate.name} (status: ${newCandidate.status})`);
  return newCandidate;
}

// Mettre à jour un candidat
export function updateCandidate(id, updates) {
  const candidates = loadCandidates();
  const targetId = String(id);
  const candidateIndex = candidates.findIndex(c => String(c.id) === targetId);
  
  if (candidateIndex === -1) {
    throw new Error('Candidat non trouvé');
  }
  
  const currentCandidate = candidates[candidateIndex];
  
  // Si c'est une mise à jour par l'utilisateur
  if (updates.updatedByUser) {
    if (currentCandidate.status === 'approved') {
      console.log(`🔄 Candidat approuvé mis à jour par l'utilisateur: ${currentCandidate.name} - Retour en attente`);
      updates.status = 'pending'; // Remettre en attente
    } else {
      console.log(`🔄 Candidat mis à jour par l'utilisateur: ${currentCandidate.name}`);
    }
  }
  
  candidates[candidateIndex] = {
    ...currentCandidate,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveCandidates(candidates);
  console.log(`📝 Candidat mis à jour: ${candidates[candidateIndex].name} (status: ${candidates[candidateIndex].status || 'none'})`);
  return candidates[candidateIndex];
}

// Supprimer un candidat
export function deleteCandidate(id) {
  const candidates = loadCandidates();
  const candidateIndex = candidates.findIndex(c => c.id === id);
  
  if (candidateIndex === -1) {
    throw new Error('Candidat non trouvé');
  }
  
  const deletedCandidate = candidates[candidateIndex];
  candidates.splice(candidateIndex, 1);
  
  saveCandidates(candidates);
  console.log(`🗑️ Candidat supprimé: ${deletedCandidate.name}`);
  return deletedCandidate;
}

// Obtenir les statistiques des candidats
export function getCandidateStats() {
  const candidates = loadCandidates();
  
  return {
    total: candidates.length,
    byExperience: candidates.reduce((acc, candidate) => {
      acc[candidate.experience] = (acc[candidate.experience] || 0) + 1;
      return acc;
    }, {}),
    byRemote: candidates.reduce((acc, candidate) => {
      acc[candidate.remote] = (acc[candidate.remote] || 0) + 1;
      return acc;
    }, {}),
    byAvailability: candidates.reduce((acc, candidate) => {
      acc[candidate.availability] = (acc[candidate.availability] || 0) + 1;
      return acc;
    }, {}),
    byLocation: candidates.reduce((acc, candidate) => {
      acc[candidate.location] = (acc[candidate.location] || 0) + 1;
      return acc;
    }, {}),
    topSkills: candidates
      .flatMap(candidate => candidate.skills)
      .reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {}),
    lastUpdated: candidates.length > 0 ? Math.max(...candidates.map(candidate => new Date(candidate.updatedAt).getTime())) : null
  };
}
