# 🚀 GUIDE DE CONFIGURATION RENDER

## ⚠️ ERREUR ACTUELLE

Votre déploiement Render échoue car les variables d'environnement Supabase ne sont pas configurées.

## 🔧 SOLUTION - CONFIGURER LES VARIABLES D'ENVIRONNEMENT

### 1. Accéder à la configuration Render

1. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service backend `ux-jobs-pro-backend`
3. Allez dans l'onglet **Environment**

### 2. Ajouter les variables d'environnement

Ajoutez ces variables **UNE PAR UNE** :

#### Variables Supabase (OBLIGATOIRES)
```
VITE_SUPABASE_URL = https://ktfdrwpvofxuktnunukv.supabase.co
```

```
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTU4NDAsImV4cCI6MjA3MzE3MTg0MH0.v6886_P_zJuTv-fsZZRydSaVfQ0qLqY56SQJgWePpY8
```

```
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c
```

#### Variables Stripe (si configurées)
```
STRIPE_SECRET_KEY = sk_test_votre_clé_stripe
STRIPE_WEBHOOK_SECRET = whsec_votre_webhook_secret
```

#### Variables Redis (si utilisées)
```
REDIS_URL = redis://localhost:6379
REDIS_PASSWORD = 
```

#### Token Admin
```
ADMIN_TOKEN_SECRET = admin-token-secure-key-change-in-production
```

### 3. Redéployer le service

1. Cliquez sur **Save Changes**
2. Allez dans l'onglet **Deploys**
3. Cliquez sur **Manual Deploy** → **Deploy latest commit**

## ✅ VÉRIFICATION

Après configuration, votre service devrait démarrer avec succès et afficher :

```
✅ Configuration Supabase chargée
🚀 Serveur démarré sur le port 10000
```

## 🆘 DÉPANNAGE

### Si l'erreur persiste

1. **Vérifiez l'orthographe** des noms de variables (sensible à la casse)
2. **Vérifiez les valeurs** - pas d'espaces avant/après
3. **Redéployez** après chaque modification
4. **Consultez les logs** dans l'onglet Logs

### Variables manquantes courantes

- `VITE_SUPABASE_URL` - URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` - Clé publique Supabase
- `SUPABASE_SERVICE_KEY` - Clé service Supabase (côté serveur uniquement)

## 📋 CHECKLIST

- [ ] Variables Supabase ajoutées
- [ ] Variables Stripe ajoutées (si utilisées)
- [ ] Token admin configuré
- [ ] Service redéployé
- [ ] Logs vérifiés
- [ ] Service accessible

---

**Une fois configuré, votre backend sera opérationnel !** 🎉
