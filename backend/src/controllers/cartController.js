const { Cart, Product, ProductImage, ProductVariant } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res, next) => {
  const cartItems = await Cart.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: ProductVariant,
        as: 'variant',
        include: [
          {
            model: Product,
            include: [
              {
                model: ProductImage,
                as: 'images',
                where: { isPrimary: true },
                required: false,
              },
            ],
          },
        ],
      },
    ],
  });

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.quantity * parseFloat(item.variant.price));
  }, 0);

  res.status(200).json({
    status: 'success',
    data: {
      items: cartItems,
      total: cartTotal.toFixed(2),
      itemCount: cartItems.length,
    },
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { variantId, quantity = 1 } = req.body;

  if (!variantId) {
    return next(new AppError('Please provide a variant ID', 400));
  }

  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) {
    return next(new AppError('Product variant not found', 404));
  }

  if (variant.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  const existingCartItem = await Cart.findOne({
    where: {
      userId: req.user.id,
      variantId,
    },
  });

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;
    if (variant.stock < newQuantity) {
      return next(new AppError('Insufficient stock', 400));
    }

    await existingCartItem.update({ quantity: newQuantity });
    
    res.status(200).json({
      status: 'success',
      message: 'Cart updated successfully',
      data: existingCartItem,
    });
  } else {
    const cartItem = await Cart.create({
      userId: req.user.id,
      variantId,
      quantity,
    });

    res.status(201).json({
      status: 'success',
      data: cartItem,
    });
  }
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const cartItem = await Cart.findOne({
    where: {
      id,
      userId: req.user.id,
    },
    include: [{ model: ProductVariant, as: 'variant' }],
  });

  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  if (cartItem.variant.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  await cartItem.update({ quantity });

  res.status(200).json({
    status: 'success',
    data: cartItem,
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cartItem = await Cart.findOne({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  await cartItem.destroy();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  await Cart.destroy({
    where: { userId: req.user.id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});