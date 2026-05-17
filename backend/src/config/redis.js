const redis = require('redis');
const config = require('./env');

// Support cloud Redis via full URL (Upstash, Redis Cloud) or host:port
const redisUrl = config.REDIS.URL || `redis://${config.REDIS.HOST}:${config.REDIS.PORT}`;

const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 5) {
        return new Error('Retry time exhausted');
      }
      return Math.min(retries * 1000, 5000);
    }
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Redis Connected'));

// Track connection state
let isRedisReady = false;

redisClient.on('ready', () => {
  isRedisReady = true;
});

redisClient.on('end', () => {
  isRedisReady = false;
});

// Graceful connect — don't crash if Redis is unavailable
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    isRedisReady = false;
    if (config.NODE_ENV === 'production') {
      console.error('⚠️  PRODUCTION WARNING: Redis unavailable. OTP and caching will not work correctly across multiple instances.');
    } else {
      console.warn('Redis connection failed. Caching will be disabled:', error.message);
    }
  }
})();

// Export both client and readiness check
module.exports = redisClient;
module.exports.isRedisReady = () => isRedisReady;