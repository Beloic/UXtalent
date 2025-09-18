# Guide pour vérifier l'envoi d'emails dans Supabase

## 📧 Où vérifier les logs d'email

### 1. Dans Supabase Dashboard
- Allez sur : https://supabase.com/dashboard/project/ktfdrwpvofxuktnunukv
- **Settings** → **Logs** → **Email**
- Vous verrez tous les emails envoyés avec leur statut

### 2. Types de logs à vérifier

#### ✅ Emails envoyés avec succès
- Status: `sent`
- Type: `signup` (inscription)
- Destinataire: email de l'utilisateur

#### ❌ Emails en erreur
- Status: `failed`
- Erreur: raison de l'échec (SMTP, authentification, etc.)

#### 📤 Emails en cours
- Status: `pending`
- Type: `signup`

### 3. Informations importantes dans les logs

```
- Email ID: identifiant unique
- Recipient: destinataire
- Subject: sujet de l'email
- Status: sent/failed/pending
- Created at: date d'envoi
- Error: message d'erreur si échec
```

### 4. Requêtes SQL pour vérifier les logs

```sql
-- Vérifier les logs d'email récents
SELECT 
    id,
    created_at,
    recipient,
    subject,
    status,
    error_message,
    template_type
FROM auth.email_logs 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Vérifier les emails pour nos utilisateurs de test
SELECT 
    id,
    created_at,
    recipient,
    subject,
    status,
    error_message
FROM auth.email_logs 
WHERE recipient IN (
    'hello+1@loicbernard.com',
    'be.loic23+9@gmail.com', 
    'be.loic23+15@gmail.com'
)
ORDER BY created_at DESC;
```

### 5. Vérifications à faire

1. **Dans Supabase Dashboard** :
   - Settings → Logs → Email
   - Chercher les emails récents (dernière heure)
   - Vérifier le statut : `sent` ✅ ou `failed` ❌

2. **Dans votre boîte email** :
   - Vérifier la réception des emails
   - Vérifier les spams/courrier indésirable
   - Vérifier que le contenu est correct

3. **Si problème** :
   - Regarder le message d'erreur dans les logs
   - Vérifier la configuration SMTP
   - Tester avec un autre email

### 6. Exemple de logs normaux

```
✅ Email envoyé avec succès :
- Recipient: hello+1@loicbernard.com
- Subject: Confirm your signup
- Status: sent
- Created: 2025-09-18 14:24:52

❌ Email en erreur :
- Recipient: test@example.com
- Subject: Confirm your signup  
- Status: failed
- Error: SMTP authentication failed
```

### 7. Actions si problème

- **SMTP Error** : Vérifier les paramètres SMTP
- **Authentication Error** : Vérifier le mot de passe d'application
- **Rate Limit** : Attendre et réessayer
- **Invalid Email** : Vérifier le format de l'email
