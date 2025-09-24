import 'dotenv/config';
import { supabaseAdmin } from '../src/lib/supabase.js';

// Réinitialise la table jobs: supprime toutes les offres et insère 5 nouvelles offres complètes
async function resetJobs() {
  if (!supabaseAdmin) {
    console.error('SUPABASE_SERVICE_KEY manquant. Abandon.');
    process.exit(1);
  }

  try {
    console.log('🔧 Réinitialisation des offres: suppression de toutes les lignes de jobs…');
    const { error: deleteError } = await supabaseAdmin
      .from('jobs')
      .delete()
      .not('id', 'is', null);
    if (deleteError) throw deleteError;

    console.log('🧱 Insertion de 5 nouvelles offres…');
    const nowIso = new Date().toISOString();

    const jobs = [
      {
        title: 'Senior UX Designer — SaaS B2B Analytics',
        company: 'Dataview Labs',
        location: 'Paris, France',
        remote: 'hybrid',
        type: 'full-time',
        seniority: 'senior',
        salary: '70k€–85k€ + bonus',
        description: 'Vous prendrez le lead sur l’expérience de bout en bout de notre plateforme d’analytics B2B. Vous travaillerez main dans la main avec Product, Data et Engineering pour définir la vision UX, prioriser la roadmap et livrer des expériences fluides et accessibles.',
        requirements: [
          '5+ ans en UX/Product Design sur des produits SaaS',
          'Maîtrise des design systems et de Figma',
          'Excellente capacité à cadrer des problèmes complexes',
          'Solide culture en accessibilité (WCAG) et recherche utilisateur',
        ],
        benefits: [
          'Télétravail flexible (2-3 jours/sem)',
          'Budget formation et conférences',
          'Matériel haut de gamme',
          'Participation au transport et mutuelle premium',
        ],
        tags: ['UX', 'SaaS', 'Design System', 'Accessibility', 'Research'],
        status: 'active',
        views_count: 0,
        applications_count: 0,
      },
      {
        title: 'Product Designer — Marketplace Mobile',
        company: 'Shoply',
        location: 'Lyon, France',
        remote: 'remote',
        type: 'full-time',
        seniority: 'mid',
        salary: '45k€–60k€',
        description: 'Concevoir des parcours mobiles fluides pour une marketplace à fort volume. Vous contribuerez aux recherches, aux tests utilisateurs et à l’amélioration continue des métriques de conversion.',
        requirements: [
          '3+ ans en Product/UX Design',
          'Très à l’aise sur mobile iOS/Android',
          'Bonnes bases d’UX writing et de prototypage',
        ],
        benefits: ['Full remote en France', 'Carte resto', 'Congés supplémentaires', 'Budget bien-être'],
        tags: ['Product Design', 'Mobile', 'Marketplace', 'Conversion'],
        status: 'active',
        views_count: 0,
        applications_count: 0,
      },
      {
        title: 'Lead Designer — Fintech Payments',
        company: 'Payflux',
        location: 'Remote, EU',
        remote: 'remote',
        type: 'full-time',
        seniority: 'lead',
        salary: '90k€–110k€ + equity',
        description: 'Vous dirigez une petite équipe de designers (3 personnes) et posez les standards du design (vision, process, qualité) pour une fintech en forte croissance.',
        requirements: [
          'Expérience de lead/management design',
          'Portefeuille de produits complexes B2B ou fintech',
          'Excellence en communication et storytelling produit',
        ],
        benefits: ['Equity', 'Budget home office', 'Séminaires équipe 2x/an'],
        tags: ['Lead', 'Fintech', 'Design Leadership', 'B2B'],
        status: 'active',
        views_count: 0,
        applications_count: 0,
      },
      {
        title: 'UX Researcher — Santé Digitale',
        company: 'Healtech',
        location: 'Nantes, France',
        remote: 'hybrid',
        type: 'contract',
        seniority: 'mid',
        salary: 'TJ: selon profil',
        description: 'Structurer la fonction recherche: plans d’études, entretiens, tests, repository insight, et influence sur la roadmap avec l’équipe produit.',
        requirements: [
          'Expérience démontrée en recherche utilisateur',
          'Connaissance réglementation santé (souhaitée)',
          'Capacité à transformer les insights en décisions produit',
        ],
        benefits: ['Horaires flexibles', 'Équipe bienveillante', 'Matériel adapté'],
        tags: ['Research', 'Santé', 'Quali/Quanti', 'Repository'],
        status: 'active',
        views_count: 0,
        applications_count: 0,
      },
      {
        title: 'UX/UI Designer — EdTech Platform',
        company: 'Learnly',
        location: 'Bordeaux, France',
        remote: 'on-site',
        type: 'part-time',
        seniority: 'junior',
        salary: '32k€–40k€ (pro-rata)',
        description: 'Contribuer à l’UI et à l’UX d’une plateforme d’apprentissage. Travail étroit avec la team pédagogique pour améliorer l’engagement et la rétention.',
        requirements: ['Portfolio UI solide', 'Connaissances de base en UX', 'Curiosité produit'],
        benefits: ['Tickets resto', 'Transport', 'Studio design dédié'],
        tags: ['UX/UI', 'EdTech', 'UI', 'Engagement'],
        status: 'active',
        views_count: 0,
        applications_count: 0,
      },
    ];

    const { data, error: insertError } = await supabaseAdmin
      .from('jobs')
      .insert(jobs)
      .select();

    if (insertError) throw insertError;

    console.log(`✅ ${data?.length || 0} offres insérées.`);
  } catch (error) {
    console.error('❌ Erreur reset jobs:', error.message);
    process.exitCode = 1;
  }
}

resetJobs().then(() => process.exit());


