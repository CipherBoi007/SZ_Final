const { Wishlist, Product, ProductImage, Cart, ProductVariant } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false }] }],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', data: wishlist });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const productId = req.params.productId || req.body.productId;
  const product = await Product.findByPk(productId);
  if (!product) return next(new AppError('Product not found', 404));

  const existing = await Wishlist.findOne({ where: { userId: req.user.id, productId } });
  if (existing) return next(new AppError('Already in wishlist', 400));

  const item = await Wishlist.create({ userId: req.user.id, productId });
  res.status(201).json({ status: 'success', data: item });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const item = await Wishlist.findOne({ where: { [Op.or]: [{ id: req.params.id }, { productId: req.params.id }, { productId: req.params.productId }], userId: req.user.id } });
  // Fallback for simple ID delete
  const idToDelete = req.params.id || req.params.productId;
  await Wishlist.destroy({ where: { [Op.or]: [{ id: idToDelete }, { productId: idToDelete }], userId: req.user.id } });
  res.status(200).json({ status: 'success', message: 'Removed' });
});

exports.checkWishlistStatus = catchAsync(async (req, res, next) => {
  const item = await Wishlist.findOne({ where: { productId: req.params.productId, userId: req.user.id } });
  res.status(200).json({ status: 'success', data: { isInWishlist: !!item } });
});

exports.moveToCart = catchAsync(async (req, res, next) => {
  const { variantId } = req.body;
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) return next(new AppError('Variant not found', 404));

  await Cart.create({ userId: req.user.id, variantId, quantity: 1 });
  await Wishlist.destroy({ where: { userId: req.user.id, productId: variant.productId } });
  res.status(200).json({ status: 'success', message: 'Moved to cart' });
});

exports.getWishlistCount = catchAsync(async (req, res, next) => {
  const count = await Wishlist.count({ where: { userId: req.user.id } });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.clearWishlist = catchAsync(async (req, res, next) => {
  await Wishlist.destroy({ where: { userId: req.user.id } });
  res.status(200).json({ status: 'success', message: 'Wishlist cleared' });
});