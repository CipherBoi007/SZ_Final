const { User, Order, Wishlist, Review, Address, Product, ProductImage, OrderItem, Coupon } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const imageService = require('../services/imageService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Get current user profile
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Address, as: 'addresses' },
      { model: Order, as: 'orders', limit: 5, order: [['createdAt', 'DESC']] }
    ],
  });

  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({ status: 'success', data: user });
});

// @desc    Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, email, phone } = req.body;
  await req.user.update({ name, email, phone });
  res.status(200).json({ status: 'success', data: req.user });
});

// @desc    Upload profile picture
exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image', 400));
  const imageUrl = `/uploads/profiles/${req.file.filename}`;
  await req.user.update({ profileImage: imageUrl });
  res.status(200).json({ status: 'success', data: { profileImage: imageUrl } });
});

// @desc    Delete profile picture
exports.deleteProfilePicture = catchAsync(async (req, res, next) => {
  await req.user.update({ profileImage: null });
  res.status(200).json({ status: 'success', message: 'Deleted' });
});

// @desc    Get my orders
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
  res.status(200).json({ status: 'success', data: orders });
});

// @desc    Get single order
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
  res.status(200).json({ status: 'success', data: order });
});

// @desc    Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
  await order.update({ status: 'cancelled' });
  res.status(200).json({ status: 'success', data: order });
});

// @desc    Get wishlist
exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findAll({ where: { userId: req.user.id }, include: [{ model: Product, as: 'product' }] });
  res.status(200).json({ status: 'success', data: wishlist });
});

// @desc    Get my reviews
exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({ where: { userId: req.user.id }, include: [Product] });
  res.status(200).json({ status: 'success', data: reviews });
});

// @desc    Change password
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) return next(new AppError('Incorrect password', 401));
  await user.update({ password: newPassword });
  res.status(200).json({ status: 'success', message: 'Changed' });
});

// @desc    Deactivate account
exports.deactivateAccount = catchAsync(async (req, res, next) => {
  await req.user.update({ isActive: false });
  res.status(200).json({ status: 'success', message: 'Deactivated' });
});

// @desc    Get user stats
exports.getUserStats = catchAsync(async (req, res, next) => {
  const orderCount = await Order.count({ where: { userId: req.user.id } });
  res.status(200).json({ status: 'success', data: { orderCount } });
});