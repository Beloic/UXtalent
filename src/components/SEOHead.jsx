import React from 'react';
import { generateSEOTitle, generateSEODescription, generateSEOKeywords } from '../utils/seoUtils';

/**
 * Composant SEO Head pour gérer les métadonnées
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre de la page
 * @param {string} props.description - Description de la page
 * @param {string} props.type - Type de contenu (profile, job, forum, etc.)
 * @param {Array} props.keywords - Mots-clés supplémentaires
 * @param {string} props.image - Image Open Graph
 * @param {string} props.url - URL canonique
 * @param {string} props.author - Auteur du contenu
 * @param {string} props.publishedTime - Date de publication
 * @param {string} props.modifiedTime - Date de modification
 * @returns {JSX.Element} Balises meta SEO
 */
export default function SEOHead({
  title,
  description,
  type = '',
  keywords = [],
  image = '/logo.webp',
  url = '',
  author = 'UX Talent',
  publishedTime = '',
  modifiedTime = ''
}) {
  const seoTitle = generateSEOTitle(title, type);
  const seoDescription = generateSEODescription(description, type);
  const seoKeywords = generateSEOKeywords(type, keywords);
  
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const ogImage = image.startsWith('http') ? image : `${window?.location?.origin || ''}${image}`;

  return (
    <>
      {/* Métadonnées de base */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* URL canonique */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type === 'profile' ? 'profile' : 'website'} />
      <meta property="og:site_name" content="UX Talent" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@UXTalent" />
      
      {/* Métadonnées supplémentaires */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Dates de publication/modification */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'profile' ? "Person" : type === 'job' ? "JobPosting" : "WebSite",
          "name": seoTitle,
          "description": seoDescription,
          "url": canonicalUrl,
          "image": ogImage,
          "author": {
            "@type": "Organization",
            "name": author
          },
          ...(type === 'job' && {
            "hiringOrganization": {
              "@type": "Organization",
              "name": "UX Talent"
            },
            "jobLocation": {
              "@type": "Place",
              "name": "France"
            },
            "employmentType": "FULL_TIME"
          }),
          ...(type === 'profile' && {
            "jobTitle": "Designer UX/UI",
            "worksFor": {
              "@type": "Organization",
              "name": "UX Talent"
            }
          })
        })}
      </script>
    </>
  );
}

/**
 * Hook pour utiliser les utilitaires SEO
 */
export const useSEO = () => {
  const updatePageSEO = (options) => {
    if (typeof document === 'undefined') return;
    
    const {
      title,
      description,
      type = '',
      keywords = [],
      image = '/logo.webp',
      url = window.location.href
    } = options;
    
    const seoTitle = generateSEOTitle(title, type);
    const seoDescription = generateSEODescription(description, type);
    const seoKeywords = generateSEOKeywords(type, keywords);
    
    // Mettre à jour le titre
    document.title = seoTitle;
    
    // Mettre à jour les métadonnées existantes
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    const updateProperty = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    updateMeta('description', seoDescription);
    updateMeta('keywords', seoKeywords.join(', '));
    updateProperty('og:title', seoTitle);
    updateProperty('og:description', seoDescription);
    updateProperty('og:image', image.startsWith('http') ? image : `${window.location.origin}${image}`);
    updateProperty('og:url', url);
    
    // Mettre à jour l'URL canonique
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  };
  
  return { updatePageSEO };
};
