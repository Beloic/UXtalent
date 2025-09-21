# 🧹 Scripts de Nettoyage Auth

Ces scripts permettent de maintenir la cohérence entre Supabase Auth et vos tables métier en supprimant les utilisateurs Auth orphelins.

## 📋 Problème résolu

Parfois, des utilisateurs existent dans Supabase Auth mais n'ont pas de profil correspondant dans vos tables métier (candidates, recruiters). Cela peut causer l'erreur "Un compte existe déjà avec cet email" lors de nouvelles inscriptions.

## 🛠️ Scripts disponibles

### 1. `cleanup-orphaned-auth-users.js` - Script complet

**Usage :**
```bash
# Analyse seulement (recommandé)
node cleanup-orphaned-auth-users.js

# Suppression automatique
node cleanup-orphaned-auth-users.js --force
```

**Fonctionnalités :**
- ✅ Analyse détaillée de tous les utilisateurs Auth
- ✅ Vérification des tables candidates et recruiters
- ✅ Affichage des détails des utilisateurs orphelins
- ✅ Suppression sécurisée avec confirmation
- ✅ Rapport complet des résultats

### 2. `quick-auth-cleanup.js` - Script rapide

**Usage :**
```bash
node quick-auth-cleanup.js
```

**Fonctionnalités :**
- ⚡ Nettoyage automatique et rapide
- 🗑️ Suppression immédiate des orphelins
- 📊 Rapport concis des résultats

## 🎯 Quand utiliser ces scripts

### Utilisation quotidienne
```bash
# Script rapide pour un nettoyage régulier
node quick-auth-cleanup.js
```

### Utilisation hebdomadaire
```bash
# Script complet pour un audit détaillé
node cleanup-orphaned-auth-users.js
```

### En cas de problème spécifique
```bash
# Si vous avez un email bloqué
node cleanup-orphaned-auth-users.js --force
```

## ⚠️ Précautions

1. **Sauvegarde** : Ces scripts suppriment définitivement des utilisateurs Auth
2. **Test** : Testez d'abord en mode analyse (`--force` non utilisé)
3. **Horaires** : Exécutez pendant les heures creuses
4. **Monitoring** : Surveillez les logs après exécution

## 🔧 Configuration

Les scripts utilisent automatiquement les variables d'environnement de `env.production` :
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## 📊 Exemple de sortie

```
🧹 NETTOYAGE RAPIDE AUTH
========================

📊 15 utilisateurs Auth
👤 12 candidats
⚠️  3 utilisateurs orphelins

🗑️ Suppression des utilisateurs orphelins...

✅ old-user1@example.com supprimé
✅ old-user2@example.com supprimé
✅ old-user3@example.com supprimé

🎉 Nettoyage terminé ! 3 utilisateurs supprimés.
```

## 🚀 Automatisation

Pour automatiser le nettoyage, vous pouvez :

1. **Cron job quotidien** :
```bash
# Ajouter dans crontab
0 2 * * * cd /path/to/your/app && node quick-auth-cleanup.js
```

2. **Script de déploiement** :
```bash
# Après chaque déploiement
npm run cleanup-auth
```

3. **Webhook** :
```bash
# Après des suppressions de profils
curl -X POST https://your-app.com/api/cleanup-auth
```

## 🆘 Dépannage

### Erreur "Variables d'environnement manquantes"
```bash
# Vérifier que env.production existe
ls -la env.production

# Vérifier le contenu
cat env.production | grep SUPABASE
```

### Erreur "Permission denied"
```bash
# Vérifier les permissions
chmod +x cleanup-orphaned-auth-users.js
chmod +x quick-auth-cleanup.js
```

### Erreur "Table not found"
- Vérifiez que vos tables `candidates` et `recruiters` existent
- Le script gère automatiquement les tables manquantes

## 📞 Support

En cas de problème :
1. Vérifiez les logs d'erreur
2. Testez avec le script complet en mode analyse
3. Vérifiez la configuration Supabase
4. Contactez l'équipe de développement
