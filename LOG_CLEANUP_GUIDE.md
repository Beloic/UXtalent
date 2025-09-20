# Guide de Nettoyage des Logs

Ce guide explique comment nettoyer et maintenir les logs de l'application UX Jobs Pro.

## Vue d'ensemble du système de logging

L'application utilise Winston pour la gestion des logs avec les transports suivants :

- **Console** : Affichage en temps réel pendant le développement
- **Fichiers avec rotation quotidienne** :
  - `app-YYYY-MM-DD.log` : Logs généraux de l'application
  - `error-YYYY-MM-DD.log` : Logs d'erreurs uniquement

## Règles de rétention

| Type de log | Durée de rétention | Taille max par fichier |
|-------------|-------------------|----------------------|
| `app-*.log` | 14 jours | 20 MB |
| `error-*.log` | 30 jours | 20 MB |

## Script de nettoyage automatique

Un script de nettoyage automatique est disponible : `scripts/cleanup-logs.js`

### Utilisation

```bash
# Nettoyer les anciens logs
node scripts/cleanup-logs.js clean

# Afficher les statistiques des logs
node scripts/cleanup-logs.js stats

# Afficher l'aide
node scripts/cleanup-logs.js help
```

### Automatisation

Pour automatiser le nettoyage, vous pouvez :

1. **Ajouter une tâche cron** (Linux/Mac) :
   ```bash
   # Nettoyer tous les jours à 2h du matin
   0 2 * * * cd /path/to/ux-jobs-pro && node scripts/cleanup-logs.js clean
   ```

2. **Utiliser PM2** avec un script de nettoyage :
   ```bash
   pm2 start scripts/cleanup-logs.js --name "log-cleanup" --cron "0 2 * * *"
   ```

## Nettoyage manuel

### Supprimer tous les logs

```bash
# Supprimer tous les fichiers de logs
rm -f logs/*.log
```

### Supprimer les logs anciens

```bash
# Supprimer les logs de plus de 7 jours
find logs/ -name "*.log" -mtime +7 -delete

# Supprimer les logs de plus de 30 jours
find logs/ -name "*.log" -mtime +30 -delete
```

## Surveillance des logs

### Vérifier l'espace disque utilisé

```bash
# Taille du dossier logs
du -sh logs/

# Détail par fichier
ls -lah logs/
```

### Surveiller les logs en temps réel

```bash
# Suivre les logs d'application
tail -f logs/app-$(date +%Y-%m-%d).log

# Suivre les logs d'erreurs
tail -f logs/error-$(date +%Y-%m-%d).log
```

## Configuration du logging

### Variables d'environnement

- `LOG_LEVEL` : Niveau de log (error, warn, info, debug)
- `NODE_ENV` : Environnement (development, production)

### Personnalisation

Le système de logging peut être personnalisé dans `src/logger/logger.js` :

- Modifier les formats de log
- Ajouter de nouveaux transports
- Changer les règles de rotation
- Ajuster les niveaux de log

## Dépannage

### Problèmes courants

1. **Espace disque insuffisant**
   - Vérifier la taille des logs : `du -sh logs/`
   - Exécuter le nettoyage : `node scripts/cleanup-logs.js clean`

2. **Logs trop verbeux**
   - Ajuster le niveau de log : `export LOG_LEVEL=warn`
   - Redémarrer l'application

3. **Rotation des logs défaillante**
   - Vérifier les permissions sur le dossier logs
   - Vérifier l'espace disque disponible

### Logs d'erreur courants

- **Redis connection errors** : Vérifier la configuration Redis
- **API request errors** : Vérifier les endpoints et l'authentification
- **Cache errors** : Vérifier la configuration du cache

## Bonnes pratiques

1. **Surveillance régulière** : Vérifier les logs quotidiennement
2. **Nettoyage automatique** : Configurer le nettoyage automatique
3. **Rotation appropriée** : Ajuster les règles selon les besoins
4. **Monitoring** : Surveiller l'espace disque utilisé par les logs
5. **Backup** : Sauvegarder les logs importants avant nettoyage

## Changements récents

### Suppression du système de scraping

Les logs de scraping ont été supprimés car :
- Le système de scraping n'était plus utilisé
- Les métriques montraient 0 exécutions
- Cela simplifie la maintenance

### Optimisations

- Suppression des transports inutiles
- Nettoyage du code des métriques
- Script de nettoyage automatique ajouté
