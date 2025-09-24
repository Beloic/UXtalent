# Comptes de test

> Ces identifiants sont destinés aux environnements de développement et de recette. Ne pas utiliser en production.

## Recruteur (plan Max)

- **Email**: recruteur.max.test+uxjobs@example.com
- **Mot de passe**: UxJobsPro!Test123

### Remarques
- Le script de seed `scripts/seed-recruiter-max.js` crée/normalise ce compte.
- Ces valeurs peuvent être surchargées par les variables d’environnement:
  - `TEST_RECRUITER_EMAIL`
  - `TEST_RECRUITER_PASSWORD`
- Si vous modifiez ces variables, relancez le seed pour aligner le profil côté base.

### Commandes utiles
```bash
# Seed du compte recruteur de test (plan Max)
npm run seed:recruiter:max
```
