const redisClient = require('../config/redis');
const { isRedisReady } = require('../config/redis');

class CacheService {
  _isAvailable() {
    return isRedisReady() && redisClient.isOpen;
  }

  async _waitForReady(timeoutMs = 3000) {
    if (this._isAvailable()) return true;
    if (!redisClient.isOpen) return false;

    return new Promise((resolve) => {
      const onReady = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        resolve(false);
      };
      const timer = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeoutMs);

      function cleanup() {
        redisClient.removeListener('ready', onReady);
        redisClient.removeListener('error', onError);
        clearTimeout(timer);
      }

      redisClient.once('ready', onReady);
      redisClient.once('error', onError);
    });
  }

  async get(key) {
    if (!this._isAvailable()) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this._isAvailable()) return;
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error.message);
    }
  }

  async del(key) {
    if (!this._isAvailable()) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error.message);
    }
  }

  async delByPattern(pattern) {
    await this._waitForReady();
    if (!this._isAvailable()) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache delete by pattern error:', error.message);
    }
  }

  async flush() {
    await this._waitForReady();
    if (!this._isAvailable()) return;
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error.message);
    }
  }
}

module.exports = new CacheService();