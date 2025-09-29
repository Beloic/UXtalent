#!/usr/bin/env node

import dotenv from 'dotenv';

// Charger les variables d'environnement avant tout
dotenv.config();

// Maintenant importer et démarrer le serveur
await import('./server.js');
