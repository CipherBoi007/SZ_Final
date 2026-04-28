const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/env');
const { generateToken } = require('../utils/helpers');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

const signToken = (id) => {
  return jwt.sign({ id }, config.JWT.SECRET, {
    expiresIn: config.JWT.EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, config.JWT.REFRESH_SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await user.update({ refreshToken });

  const userData = user.toJSON();
  delete userData.password;
  delete userData.refreshToken;

  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: { user: userData },
  });
};

exports.sendSignupOTP = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;
  if (!email && !phone) return next(new AppError('Email or phone is required', 400));

  const identifier = email || phone;
  const type = email ? 'email' : 'phone';

  // Check if user already exists
  const existingUser = await User.findOne({ where: { [Op.or]: [{ email: email?.toLowerCase() }, { phone }] } });
  if (existingUser) return next(new AppError('User already exists with this email/phone', 400));

  await otpService.sendOTP(identifier, type, 'signup');
  res.status(200).json({ status: 'success', message: `Verification OTP sent to ${identifier}` });
});

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, otp } = req.body;

  if (config.OTP_VERI) {
    if (!otp) return next(new AppError('OTP is required for verification', 400));
    const identifier = email || phone;
    const result = await otpService.verifyOTP(identifier, otp, 'signup');
    if (!result.verified) return next(new AppError(result.message || 'Invalid OTP', 400));
  }

  const checkEmail = email?.toLowerCase();
  const existingUser = await User.findOne({ where: { [Op.or]: [{ email: checkEmail }, { phone }] } });
  if (existingUser) return next(new AppError('User already exists', 400));

  const userCount = await User.count();
  const role = userCount === 0 ? 'admin' : 'user';
  const user = await User.create({ name, email: checkEmail, phone, password, role });
  await createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, phone, password } = req.body;
  if (!password || (!email && !phone)) return next(new AppError('Email/phone and password are required', 400));

  const conditions = [];
  if (email) conditions.push({ email: email.toLowerCase() });
  if (phone) conditions.push({ phone });

  const user = await User.findOne({ where: { [Op.or]: conditions } });
  if (!user || !(await user.comparePassword(password))) return next(new AppError('Invalid credentials', 401));
  if (!user.isActive) return next(new AppError('Account deactivated', 401));

  await user.update({ lastLogin: new Date() });
  await createSendToken(user, 200, res);
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) return next(new AppError('No refresh token', 401));

  try {
    const decoded = jwt.verify(refreshToken, config.JWT.REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) throw new Error();

    await createSendToken(user, 200, res);
  } catch (err) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  if (req.user) await User.update({ refreshToken: null }, { where: { id: req.user.id } });
  res.clearCookie('refreshToken');
  res.status(200).json({ status: 'success', message: 'Logged out' });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) return next(new AppError('Incorrect current password', 401));

  await user.update({ password: newPassword });
  await createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return next(new AppError('User not found', 404));

  const resetToken = generateToken();
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  await user.update({ resetPasswordToken, resetPasswordExpire: Date.now() + 10 * 60 * 1000 });

  const resetURL = `${config.FRONTEND_URL}/auth/reset-password/${resetToken}`;
  await emailService.sendPasswordResetEmail(user.email, resetURL);
  res.status(200).json({ status: 'success', message: 'Email sent' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ where: { resetPasswordToken, resetPasswordExpire: { [Op.gt]: Date.now() } } });
  if (!user) return next(new AppError('Invalid token', 400));

  await user.update({ password: req.body.password, resetPasswordToken: null, resetPasswordExpire: null });
  res.status(200).json({ status: 'success', message: 'Password reset' });
});

exports.googleAuthCallback = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new AppError('Authentication failed', 401));

  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await user.update({ refreshToken, lastLogin: new Date() });

  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
  });

  // Redirect to frontend with token
  const redirectURL = `${config.FRONTEND_URL}/auth/google-callback?token=${token}`;
  res.redirect(redirectURL);
});

exports.sendOTP = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;
  if (!email && !phone) return next(new AppError('Email or phone is required', 400));

  const identifier = email || phone;
  const type = email ? 'email' : 'phone';

  // Check if user exists
  const user = await User.findOne({ where: { [Op.or]: [{ email: email?.toLowerCase() }, { phone }] } });
  if (!user) return next(new AppError('No account found with this email/phone', 404));
  if (!user.isActive) return next(new AppError('Account deactivated', 401));

  await otpService.sendOTP(identifier, type);
  res.status(200).json({ status: 'success', message: `OTP sent to ${identifier}` });
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, phone, otp } = req.body;
  if (!otp || (!email && !phone)) return next(new AppError('OTP and email/phone are required', 400));

  const identifier = email || phone;
  const result = await otpService.verifyOTP(identifier, otp);

  if (!result.verified) return next(new AppError(result.message || 'Invalid OTP', 400));

  const user = await User.findOne({ where: { [Op.or]: [{ email: email?.toLowerCase() }, { phone }] } });
  if (!user) return next(new AppError('User not found', 404));

  await user.update({ lastLogin: new Date() });
  await createSendToken(user, 200, res);
});