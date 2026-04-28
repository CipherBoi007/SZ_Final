const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { 
  registerValidation, 
  loginValidation, 
  passwordValidation 
} = require('../validations/authValidation');

router.post('/register', authLimiter, validate(registerValidation), authController.register);
router.post('/login', authLimiter, validate(loginValidation), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);

router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(passwordValidation), authController.resetPassword);

router.post('/send-otp', authLimiter, authController.sendOTP);
router.post('/send-signup-otp', authLimiter, authController.sendSignupOTP);
router.post('/verify-otp', authLimiter, authController.verifyOTP);

// Compatibility with profile update password
router.patch('/update-password', protect, validate(passwordValidation), authController.updatePassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), authController.googleAuthCallback);

module.exports = router;