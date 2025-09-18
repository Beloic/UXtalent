# Pattern de Design des Containers

## Vue d'ensemble

Ce document décrit le pattern de design utilisé pour les containers dans l'application UX Jobs Pro. Ce pattern assure une cohérence visuelle et une séparation claire entre les différents éléments de l'interface.

## Principe fondamental

**Aucun container mère** - Chaque élément doit être dans son propre container indépendant, sans wrapper englobant.

## Style standard des containers

### Classes CSS utilisées
```css
bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4
```

### Détail des classes
- `bg-white` : Fond blanc
- `rounded-xl` : Coins arrondis (plus arrondi que rounded-lg)
- `shadow-md` : Ombre moyenne
- `border border-gray-100` : Bordure fine grise
- `p-8` : Padding généreux (32px)
- `hover:shadow-lg` : Ombre plus prononcée au survol
- `hover:border-gray-200` : Bordure plus foncée au survol
- `transition-all duration-200` : Transitions fluides
- `my-4` : Marge verticale pour séparer les containers

## Structure recommandée

### ✅ Structure correcte
```jsx
<>
  {/* Titre de section */}
  <div className="mb-8">
    <h2>Titre de la section</h2>
    <p>Description</p>
  </div>

  {/* Container individuel 1 */}
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
    <Component1 />
  </div>

  {/* Container individuel 2 */}
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
    <Component2 />
  </div>
</>
```

### ❌ Structure à éviter
```jsx
{/* Container mère - À ÉVITER */}
<div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
  <div className="mb-8">
    <h2>Titre</h2>
  </div>
  
  <div className="space-y-4">
    <div className="border border-gray-200 rounded-2xl p-6">
      <Component1 />
    </div>
    <div className="border border-gray-200 rounded-2xl p-6">
      <Component2 />
    </div>
  </div>
</div>
```

## Pages implémentées

### 1. Page de gestion des talents (RecruiterDashboard - onglet kanban)
- **Container Kanban** : Vue kanban des candidats
- **Container Calendrier** : Calendrier des rendez-vous
- **Titre séparé** : "Vue Kanban" avec description

### 2. Page Mes offres d'emploi (RecruiterDashboard - onglet myjobs)
- **Titre séparé** : "Mes offres d'emploi" avec boutons d'action
- **Containers individuels** : Une offre = un container

### 3. Page Matching (MatchingDashboard)
- **Containers individuels** : Un candidat recommandé = un container
- **Style de référence** : Ce style a été utilisé comme modèle

## Avantages de ce pattern

1. **Cohérence visuelle** : Tous les containers ont le même aspect
2. **Séparation claire** : Chaque élément est visuellement distinct
3. **Interactions fluides** : Effets hover cohérents
4. **Maintenabilité** : Code plus lisible et modulaire
5. **Responsive** : S'adapte bien aux différentes tailles d'écran

## Règles à suivre

1. **Toujours utiliser le style standard** pour les containers individuels
2. **Séparer les titres** du contenu avec `mb-8`
3. **Pas de container mère** qui englobe plusieurs éléments
4. **Utiliser des Fragments React** (`<>`) si nécessaire pour grouper sans wrapper
5. **Appliquer `my-4`** pour l'espacement vertical entre containers

## Exemples d'utilisation

### Pour une nouvelle page
```jsx
const NewPage = () => {
  return (
    <>
      {/* Titre de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle Page</h1>
        <p className="text-gray-600">Description de la page</p>
      </div>

      {/* Container 1 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
        <Component1 />
      </div>

      {/* Container 2 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
        <Component2 />
      </div>
    </>
  );
};
```

### Pour des éléments de liste
```jsx
{items.map((item) => (
  <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-200 my-4">
    <ItemContent item={item} />
  </div>
))}
```

## Maintenance

Ce pattern doit être appliqué à toutes les nouvelles pages et composants. Lors de la refactorisation d'anciennes pages, remplacer les containers mère par des containers individuels suivant ce pattern.

---

**Date de création** : 2025-01-18  
**Dernière mise à jour** : 2025-01-18  
**Version** : 1.1

## Changelog

### Version 1.1 (2025-01-18)
- Ajout de dropdowns pour les candidatures des offres d'emploi
- Amélioration de l'organisation des contenus avec états fermés par défaut
