import { logger } from '../logger/clientLogger.js';

// Client Upstash Redis REST API
class UpstashClient {
  constructor(restUrl, restToken) {
    this.restUrl = restUrl;
    this.restToken = restToken;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Test de connexion avec une commande simple
      await this.ping();
      this.isConnected = true;
      logger.info('✅ Upstash Redis REST Client Connected');
      return true;
    } catch (error) {
      logger.error('❌ Upstash Redis REST Client connection failed:', { error: error.message });
      this.isConnected = false;
      return false;
    }
  }

  async ping() {
    return await this.executeCommand(['PING']);
  }

  async get(key) {
    try {
      const result = await this.executeCommand(['GET', key]);
      return result === null ? null : JSON.parse(result);
    } catch (error) {
      logger.error('❌ Upstash GET error:', { error: error.message, key });
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      const command = ttl ? ['SETEX', key, ttl, serializedValue] : ['SET', key, serializedValue];
      await this.executeCommand(command);
      return true;
    } catch (error) {
      logger.error('❌ Upstash SET error:', { error: error.message, key });
      return false;
    }
  }

  async del(key) {
    try {
      await this.executeCommand(['DEL', key]);
      return true;
    } catch (error) {
      logger.error('❌ Upstash DEL error:', { error: error.message, key });
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.executeCommand(['EXISTS', key]);
      return result === 1;
    } catch (error) {
      logger.error('❌ Upstash EXISTS error:', { error: error.message, key });
      return false;
    }
  }

  async ttl(key) {
    try {
      return await this.executeCommand(['TTL', key]);
    } catch (error) {
      logger.error('❌ Upstash TTL error:', { error: error.message, key });
      return -1;
    }
  }

  async expire(key, ttl) {
    try {
      await this.executeCommand(['EXPIRE', key, ttl]);
      return true;
    } catch (error) {
      logger.error('❌ Upstash EXPIRE error:', { error: error.message, key });
      return false;
    }
  }

  async keys(pattern) {
    try {
      return await this.executeCommand(['KEYS', pattern]);
    } catch (error) {
      logger.error('❌ Upstash KEYS error:', { error: error.message, pattern });
      return [];
    }
  }

  async dbSize() {
    try {
      return await this.executeCommand(['DBSIZE']);
    } catch (error) {
      logger.error('❌ Upstash DBSIZE error:', { error: error.message });
      return 0;
    }
  }

  async info(section = 'memory') {
    try {
      return await this.executeCommand(['INFO', section]);
    } catch (error) {
      logger.error('❌ Upstash INFO error:', { error: error.message, section });
      return `# ${section}\n# Upstash Redis REST API\n# Memory managed by Upstash`;
    }
  }

  async executeCommand(command) {
    try {
      const response = await fetch(this.restUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.restToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Upstash retourne un tableau avec [result, error]
      if (result.length === 2 && result[1]) {
        throw new Error(result[1]);
      }

      return result[0];
    } catch (error) {
      logger.error('❌ Upstash command execution error:', { 
        error: error.message, 
        command: command[0] 
      });
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
    logger.info('🔌 Upstash Redis REST Client Disconnected');
  }
}

export default UpstashClient;
