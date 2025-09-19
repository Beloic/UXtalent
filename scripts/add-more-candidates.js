import { supabaseAdmin } from '../src/database/supabaseClient.js';

// Candidats supplémentaires à ajouter à la base de données
const additionalCandidates = [
  {
    name: "Camille Leroy",
    title: "UX/UI Designer",
    location: "Lyon, France",
    remote: "hybrid",
    experience: "Mid",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    bio: "UX/UI Designer passionnée par la création d'interfaces intuitives et esthétiques. Spécialisée dans le design d'applications mobiles et web.",
    portfolio: "https://camilleleroy.design",
    linkedin: "https://linkedin.com/in/camilleleroy",
    email: "camille.leroy@email.com",
    availability: "available",
    salary: "40-55k€",
    languages: ["Français", "Anglais"],
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Nicolas Petit",
    title: "Senior Product Designer",
    location: "Bordeaux, France",
    remote: "remote",
    experience: "Senior",
    skills: ["Figma", "Design Systems", "Strategy", "User Research", "Prototyping"],
    bio: "Senior Product Designer avec 6 ans d'expérience dans les startups tech. Expert en design systems et stratégie produit.",
    portfolio: "https://nicolaspetit.design",
    linkedin: "https://linkedin.com/in/nicolaspetit",
    email: "nicolas.petit@email.com",
    availability: "available",
    salary: "55-70k€",
    languages: ["Français", "Anglais"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Léa Moreau",
    title: "UX Researcher",
    location: "Marseille, France",
    remote: "onsite",
    experience: "Mid",
    skills: ["User Research", "Usability Testing", "Analytics", "Figma", "Miro"],
    bio: "UX Researcher spécialisée dans les méthodes qualitatives et quantitatives. Expérience dans l'e-commerce et les services financiers.",
    portfolio: "https://leamoreau.research",
    linkedin: "https://linkedin.com/in/leamoreau",
    email: "lea.moreau@email.com",
    availability: "available",
    salary: "45-60k€",
    languages: ["Français", "Anglais", "Espagnol"],
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Antoine Dubois",
    title: "Lead UX Designer",
    location: "Toulouse, France",
    remote: "hybrid",
    experience: "Lead",
    skills: ["Design Leadership", "Figma", "Design Systems", "Strategy", "Team Management"],
    bio: "Lead UX Designer avec 8 ans d'expérience et une expertise en leadership d'équipe design. Spécialisé dans la création de design systems.",
    portfolio: "https://antoinedubois.design",
    linkedin: "https://linkedin.com/in/antoinedubois",
    email: "antoine.dubois@email.com",
    availability: "available",
    salary: "65-80k€",
    languages: ["Français", "Anglais"],
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Sarah Johnson",
    title: "Junior UX Designer",
    location: "Nantes, France",
    remote: "onsite",
    experience: "Junior",
    skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Wireframing"],
    bio: "Jeune UX Designer motivée avec une formation solide en design d'interface. Recherche une première expérience dans une équipe dynamique.",
    portfolio: "https://sarahjohnson.design",
    linkedin: "https://linkedin.com/in/sarahjohnson",
    email: "sarah.johnson@email.com",
    availability: "available",
    salary: "30-40k€",
    languages: ["Français", "Anglais"],
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Pierre Martin",
    title: "Product Designer",
    location: "Paris, France",
    remote: "remote",
    experience: "Mid",
    skills: ["Figma", "Principle", "After Effects", "Motion Design", "Mobile Design"],
    bio: "Product Designer spécialisé dans le motion design et les interactions. Passionné par la création d'expériences fluides et engageantes.",
    portfolio: "https://pierremartin.design",
    linkedin: "https://linkedin.com/in/pierremartin",
    email: "pierre.martin@email.com",
    availability: "available",
    salary: "45-60k€",
    languages: ["Français", "Anglais"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Julie Bernard",
    title: "Senior UX Designer",
    location: "Lyon, France",
    remote: "hybrid",
    experience: "Senior",
    skills: ["Figma", "Research", "Prototyping", "User Testing", "Design Systems"],
    bio: "UX Designer avec 5 ans d'expérience dans le design d'interfaces utilisateur. Passionnée par la recherche utilisateur et la création d'expériences digitales intuitives.",
    portfolio: "https://juliebernard.design",
    linkedin: "https://linkedin.com/in/juliebernard",
    email: "julie.bernard@email.com",
    availability: "available",
    salary: "50-65k€",
    languages: ["Français", "Anglais"],
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Maxime Rousseau",
    title: "UX Researcher",
    location: "Bordeaux, France",
    remote: "onsite",
    experience: "Senior",
    skills: ["User Research", "Usability Testing", "Analytics", "Figma", "Miro"],
    bio: "UX Researcher avec une expertise en méthodes qualitatives et quantitatives. Expérience dans l'e-commerce et les services financiers.",
    portfolio: "https://maximerousseau.research",
    linkedin: "https://linkedin.com/in/maximerousseau",
    email: "maxime.rousseau@email.com",
    availability: "available",
    salary: "45-60k€",
    languages: ["Français", "Anglais", "Mandarin"],
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function addCandidates() {
  try {
    console.log('🚀 Ajout de candidats supplémentaires à la base de données...');
    
    for (const candidate of additionalCandidates) {
      const { data, error } = await supabaseAdmin
        .from('candidates')
        .insert([candidate])
        .select();
      
      if (error) {
        console.error(`❌ Erreur lors de l'ajout de ${candidate.name}:`, error);
      } else {
        console.log(`✅ Candidat ajouté: ${candidate.name} (ID: ${data[0].id})`);
      }
    }
    
    console.log('🎉 Ajout terminé !');
    
    // Vérifier le nombre total de candidats approuvés
    const { data: approvedCandidates, error } = await supabaseAdmin
      .from('candidates')
      .select('id, name, status')
      .eq('status', 'approved');
    
    if (error) {
      console.error('❌ Erreur lors de la vérification:', error);
    } else {
      console.log(`📊 Total de candidats approuvés: ${approvedCandidates.length}`);
      console.log('Candidats approuvés:', approvedCandidates.map(c => c.name));
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
addCandidates();
