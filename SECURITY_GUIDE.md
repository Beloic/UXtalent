# 🔒 Guide de Sécurité - UX Jobs Pro

## ⚠️ Risques de sécurité identifiés

### 1. Utilisation de la clé de service (Service Role Key)

**Problème** : Nous utilisons `supabaseAdmin` (clé de service) qui contourne toutes les politiques RLS.

**Risques** :
- Accès complet à toutes les tables sans restrictions
- Si la clé fuit, l'attaquant a les pleins pouvoirs
- Pas de contrôle d'accès au niveau des données

## 🛡️ Mesures de sécurité implémentées

### 1. Validation côté serveur
```javascript
// Vérification que l'utilisateur authentifié correspond au recruiter_id
if (companyData.recruiter_id !== authenticatedUserId) {
  throw new Error('Accès non autorisé : vous ne pouvez modifier que votre propre entreprise');
}
```

### 2. Middleware d'authentification
- Toutes les routes sont protégées par `requireRole(['recruiter', 'admin'])`
- Vérification du token JWT à chaque requête
- Extraction de l'ID utilisateur depuis le token

### 3. Validation des données
- Vérification que `recruiter_id` correspond à l'utilisateur authentifié
- Sanitisation des données d'entrée
- Validation des types de données

## 🔧 Solutions recommandées

### 1. **Solution idéale - RLS avec clé anonyme**
```sql
-- Créer des politiques RLS plus permissives
CREATE POLICY "Recruiters can manage their own data" ON recruiter_companies
  FOR ALL USING (auth.uid() = recruiter_id);
```

### 2. **Solution hybride - Clé de service avec validation stricte**
```javascript
// Validation stricte dans chaque fonction
export const secureFunction = async (data, userId) => {
  // Vérifier l'autorisation
  if (!userId || data.user_id !== userId) {
    throw new Error('Accès non autorisé');
  }
  
  // Utiliser supabaseAdmin avec validation
  return await supabaseAdmin.from('table').insert(data);
};
```

### 3. **Solution avancée - RLS avec fonctions personnalisées**
```sql
-- Créer des fonctions avec sécurité intégrée
CREATE OR REPLACE FUNCTION create_recruiter_company(
  p_company_name TEXT,
  p_company_description TEXT
) RETURNS UUID AS $$
DECLARE
  v_recruiter_id UUID;
BEGIN
  -- Vérifier l'authentification
  v_recruiter_id := auth.uid();
  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  
  -- Insérer avec l'ID de l'utilisateur authentifié
  INSERT INTO recruiter_companies (recruiter_id, company_name, company_description)
  VALUES (v_recruiter_id, p_company_name, p_company_description)
  RETURNING id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📋 Checklist de sécurité

### ✅ Implémenté
- [x] Middleware d'authentification sur toutes les routes
- [x] Validation de l'ID utilisateur dans les fonctions
- [x] Vérification des rôles (recruiter/admin)
- [x] Logging des erreurs de sécurité

### 🔄 À implémenter
- [ ] Audit des accès aux données
- [ ] Rate limiting sur les API
- [ ] Chiffrement des données sensibles
- [ ] Rotation des clés de service
- [ ] Monitoring des accès anormaux

### 🚨 Actions immédiates
- [ ] Réviser toutes les fonctions utilisant `supabaseAdmin`
- [ ] Ajouter des validations de sécurité
- [ ] Tester les cas d'accès non autorisé
- [ ] Documenter les permissions

## 🔍 Monitoring de sécurité

### Logs à surveiller
```javascript
// Exemple de log de sécurité
logger.warn('Tentative d\'accès non autorisé', {
  userId: req.user.id,
  attemptedAction: 'modify_company',
  targetUserId: companyData.recruiter_id,
  ip: req.ip,
  userAgent: req.get('User-Agent')
});
```

### Alertes recommandées
- Tentatives d'accès avec des IDs différents
- Requêtes avec des tokens invalides
- Accès à des données non autorisées
- Volume anormal de requêtes

## 📚 Ressources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**⚠️ IMPORTANT** : Ce guide doit être régulièrement mis à jour et les mesures de sécurité testées.
