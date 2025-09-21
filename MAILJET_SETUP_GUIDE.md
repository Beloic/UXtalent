# Guide de Configuration Mailjet SMTP pour Supabase

## Vue d'ensemble

Ce guide explique comment migrer de Gmail SMTP vers Mailjet SMTP dans votre application Supabase.

## Prérequis

1. Compte Mailjet actif
2. Domaine vérifié dans Mailjet (`loicbernard.com`)
3. API Key et Secret Key Mailjet

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `env.production` :

```bash
# Configuration SMTP Mailjet
MAILJET_API_KEY=your-mailjet-api-key-here
MAILJET_SECRET_KEY=your-mailjet-secret-key-here
MAILJET_FROM_EMAIL=hello@loicbernard.com
```

### 2. Configuration Supabase

Dans votre fichier `supabase/config.toml`, la configuration SMTP est maintenant :

```toml
[auth.email.smtp]
enabled = true
host = "in-v3.mailjet.com"
port = 587
user = "env(MAILJET_API_KEY)"
pass = "env(MAILJET_SECRET_KEY)"
admin_email = "env(MAILJET_FROM_EMAIL)"
sender_name = "UX Jobs Pro"
```

### 3. Interface Supabase Dashboard

Dans le Dashboard Supabase (Authentication > Settings > SMTP Settings) :

- **Host** : `in-v3.mailjet.com`
- **Port** : `587`
- **Username** : Votre API Key Mailjet
- **Password** : Votre Secret Key Mailjet
- **Sender email** : `hello@loicbernard.com`
- **Sender name** : `UX Jobs Pro`

## Test de la configuration

### Script de test automatique

Exécutez le script de test pour vérifier la configuration :

```bash
node test-mailjet-smtp.js
```

Ce script :
- Vérifie les variables d'environnement
- Teste la connexion SMTP
- Envoie un email de test
- Fournit des suggestions en cas d'erreur

### Test manuel dans Supabase

1. Allez dans Authentication > Users
2. Créez un nouvel utilisateur de test
3. Vérifiez que l'email de confirmation est envoyé
4. Consultez les logs Mailjet pour confirmer l'envoi

## Avantages de Mailjet

- **Délivrabilité améliorée** : Meilleure réputation que Gmail SMTP
- **Analytics détaillés** : Suivi des ouvertures, clics, bounces
- **Templates personnalisés** : Création d'emails professionnels
- **Support dédié** : Assistance technique spécialisée
- **Conformité** : RGPD, CAN-SPAM, etc.

## Migration depuis Gmail SMTP

### Étapes de migration

1. ✅ Configurer les variables Mailjet
2. ✅ Mettre à jour la configuration Supabase
3. ✅ Tester la configuration
4. 🔄 Déployer en production
5. 🔄 Surveiller les métriques Mailjet

### Ancienne configuration (Gmail)

```toml
# Ancienne configuration Gmail (commentée)
[auth.email.smtp]
enabled = true
host = "smtp.gmail.com"
port = 587
user = "env(GMAIL_SMTP_USER)"
pass = "env(GMAIL_SMTP_PASS)"
admin_email = "env(GMAIL_SMTP_USER)"
sender_name = "UX Jobs Pro"
```

## Surveillance et maintenance

### Métriques à surveiller

- **Taux de délivrabilité** : > 95%
- **Taux d'ouverture** : Variable selon le type d'email
- **Taux de clic** : Variable selon le contenu
- **Taux de bounce** : < 5%

### Logs et debugging

- Consultez les logs Mailjet dans le dashboard
- Surveillez les erreurs SMTP dans Supabase
- Utilisez le script de test en cas de problème

## Support et ressources

- [Documentation Mailjet SMTP](https://dev.mailjet.com/email/guides/send-api-v31/)
- [Configuration Supabase Auth](https://supabase.com/docs/guides/auth/auth-email)
- [Guide de délivrabilité Mailjet](https://www.mailjet.com/deliverability-guide/)

## Dépannage

### Erreurs courantes

1. **EAUTH** : Vérifiez vos clés API Mailjet
2. **ECONNECTION** : Vérifiez la connectivité réseau
3. **Bounces** : Vérifiez la validation du domaine
4. **Spam** : Respectez les bonnes pratiques d'emailing

### Commandes utiles

```bash
# Test de la configuration
node test-mailjet-smtp.js

# Vérification des variables d'environnement
echo $MAILJET_API_KEY

# Test de connectivité SMTP
telnet in-v3.mailjet.com 587
```

---

**Note** : Ce guide est spécifique à la configuration UX Jobs Pro. Adaptez les paramètres selon vos besoins.
