const redisClient = require('../config/redis');
const { isRedisReady } = require('../config/redis');
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');

// In-memory OTP fallback when Redis is unavailable
const otpStore = new Map();

class OTPService {
  /**
   * Generate and send OTP
   */
  async sendOTP(identifier, type = 'email', purpose = 'login') {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:${identifier}:${purpose}`;
    const ttl = 300; // 5 minutes

    // Store OTP
    if (isRedisReady()) {
      await redisClient.setEx(key, ttl, JSON.stringify({ otp, attempts: 0 }));
    } else {
      otpStore.set(key, {
        otp,
        attempts: 0,
        expiresAt: Date.now() + ttl * 1000,
      });
    }

    // Deliver OTP
    if (type === 'email') {
      await emailService.sendEmail(
        identifier,
        'Your SZ Login OTP',
        `<h1>Login OTP</h1><p>Your one-time password for SouthZone login is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`
      );
    } else {
      // WhatsApp delivery
      await whatsappService._sendTemplate(identifier, 'otp_verification', 'en', [
        {
          type: 'body',
          parameters: [{ type: 'text', text: otp }],
        },
      ]);
    }

    return { success: true, expiresIn: ttl };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(identifier, otp, purpose = 'login') {
    const key = `otp:${identifier}:${purpose}`;
    let storedData;

    if (isRedisReady()) {
      const data = await redisClient.get(key);
      if (!data) return { verified: false, message: 'OTP expired or not found' };
      storedData = JSON.parse(data);
    } else {
      storedData = otpStore.get(key);
      if (!storedData || storedData.expiresAt < Date.now()) {
        otpStore.delete(key);
        return { verified: false, message: 'OTP expired or not found' };
      }
    }

    if (storedData.otp === otp) {
      if (isRedisReady()) await redisClient.del(key);
      else otpStore.delete(key);
      return { verified: true };
    }

    // Increment attempts
    storedData.attempts += 1;
    if (storedData.attempts >= 5) {
      if (isRedisReady()) await redisClient.del(key);
      else otpStore.delete(key);
      return { verified: false, message: 'Max attempts exceeded' };
    }

    if (isRedisReady()) {
      const ttl = await redisClient.ttl(key);
      await redisClient.setEx(key, ttl > 0 ? ttl : 300, JSON.stringify(storedData));
    }

    return { verified: false, message: 'Invalid OTP' };
  }
}

module.exports = new OTPService();
