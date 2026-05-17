const { Order, OrderItem, Cart, Product, Coupon, CouponUsage, User, Address, ProductImage, ProductVariant } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateOrderNumber, calculateDiscount } = require('../utils/helpers');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');
const config = require('../config/env');

// @desc    Create new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { 
    shippingAddressId, 
    paymentMethod, 
    directBuy, 
    items: directItems,
    couponCode,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  // All orders are now prepaid via Razorpay
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Payment details missing. SouthZone strictly accepts prepaid orders only.', 400));
  }
  
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', config.RAZORPAY.KEY_SECRET)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature !== expectedSign) {
    return next(new AppError('Invalid payment signature. Security alert triggered.', 400));
  }

  const transaction = await sequelize.transaction();

  try {
    let totalAmount = 0;
    let orderItemsData = [];
    let isDirectBuy = directBuy === true;

    if (isDirectBuy && directItems) {
      for (const item of directItems) {
        const variant = await ProductVariant.findByPk(item.variantId, { include: [{ model: Product }], transaction });
        if (!variant) throw new Error('Variant not found');
        const price = variant.price;
        totalAmount += parseFloat(price) * item.quantity;
        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          priceAtPurchase: price,
          productSnapshot: { name: variant.Product.name, size: variant.size, color: variant.color }
        });
        await variant.decrement('stock', { by: item.quantity, transaction });
      }
    } else {
      const cartItems = await Cart.findAll({
        where: { userId: req.user.id },
        include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product }] }],
        transaction
      });
      if (cartItems.length === 0) throw new Error('Cart is empty');
      for (const item of cartItems) {
        const price = item.variant.price;
        totalAmount += parseFloat(price) * item.quantity;
        orderItemsData.push({
          variantId: item.variant.id,
          quantity: item.quantity,
          priceAtPurchase: price,
          productSnapshot: { name: item.variant.Product.name, size: item.variant.size, color: item.variant.color }
        });
        await item.variant.decrement('stock', { by: item.quantity, transaction });
      }
    }

    // Handle Coupon
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        where: {
          code: couponCode,
          isActive: true,
          startDate: { [Op.lte]: new Date() },
          endDate: { [Op.gte]: new Date() },
        },
        transaction
      });

      if (appliedCoupon) {
        if (totalAmount >= appliedCoupon.minOrderValue) {
          discountAmount = calculateDiscount(totalAmount, appliedCoupon);
        }
      }
    }

    const shippingAddr = await Address.findByPk(shippingAddressId, { transaction });
    if (!shippingAddr) throw new Error('Shipping address not found. Please select a valid address.');
    
    // Calculate Estimated Delivery (Order Date + 7 Days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      totalAmount,
      discountAmount,
      couponId: appliedCoupon ? appliedCoupon.id : null,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      finalAmount: Math.max(0, totalAmount - discountAmount),
      paymentMethod: 'razorpay',
      status: 'pending',
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
      shippingAddressId,
      billingAddressId: shippingAddressId, // Usually same for boutique
      shippingAddressSnapshot: shippingAddr.toJSON(),
      billingAddressSnapshot: shippingAddr.toJSON(),
      phone: shippingAddr.phone,
      email: req.user.email,
      estimatedDelivery,
    }, { transaction });

    await OrderItem.bulkCreate(orderItemsData.map(item => ({ ...item, orderId: order.id })), { transaction });
    if (!isDirectBuy) await Cart.destroy({ where: { userId: req.user.id }, transaction });
    
    if (appliedCoupon) {
      await appliedCoupon.increment('usedCount', { transaction });
      await CouponUsage.create({
        couponId: appliedCoupon.id,
        userId: req.user.id,
        orderId: order.id,
        discountApplied: discountAmount
      }, { transaction });
    }

    await transaction.commit();

    // ─── Post-Transaction Notifications ──────────────────
    try {
      const orderWithItems = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'orderItems' }] });
      const phone = order.phone || req.user.phone;
      
      if (phone) {
        await whatsappService.sendOrderConfirmation(
          phone, 
          order.orderNumber, 
          order.finalAmount, 
          orderWithItems.orderItems.length
        );

        if (razorpay_payment_id) {
          await whatsappService.sendPaymentConfirmation(
            phone,
            order.orderNumber,
            order.finalAmount,
            razorpay_payment_id
          );
        }
      }
      
      await emailService.sendOrderConfirmationEmail(req.user.email, order);
    } catch (notifErr) {
      console.error('Notification Error (Non-blocking):', notifErr.message);
    }

    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return next(new AppError(error.message, 500));
  }
});

// @desc    Get all orders for current user
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, as: 'orderItems' }],
    order: [['createdAt', 'DESC']]
  });
  res.status(200).json({ status: 'success', data: orders });
});

// @desc    Get single order
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: OrderItem, as: 'orderItems' }]
  });
  if (!order) return next(new AppError('Order not found', 404));
  res.status(200).json({ status: 'success', data: order });
});

// @desc    Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: OrderItem, as: 'orderItems' }],
  });
  if (!order) return next(new AppError('Order not found', 404));

  // Business rule: Only pending/confirmed orders can be cancelled
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  if (!cancellableStatuses.includes(order.status)) {
    return next(new AppError(`Order cannot be cancelled. Current status: ${order.status}`, 400));
  }

  const transaction = await sequelize.transaction();
  try {
    // Restore stock for each order item
    if (order.orderItems && order.orderItems.length > 0) {
      for (const item of order.orderItems) {
        await ProductVariant.increment('stock', {
          by: item.quantity,
          where: { id: item.variantId },
          transaction,
        });
      }
    }

    await order.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: req.body.reason || 'Cancelled by customer',
    }, { transaction });

    await transaction.commit();
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return next(new AppError('Failed to cancel order', 500));
  }
});

// @desc    Track order
exports.trackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  res.status(200).json({ status: 'success', data: { status: order.status, updatedAt: order.updatedAt } });
});

// @desc    Request return
exports.requestReturn = catchAsync(async (req, res, next) => {
  return next(new AppError('Return functionality is not yet available. Please contact support.', 501));
});

// @desc    Reorder
exports.reorder = catchAsync(async (req, res, next) => {
  return next(new AppError('Reorder functionality is not yet available.', 501));
});

// @desc    Get invoice
exports.getInvoice = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  res.status(200).json({ status: 'success', data: { invoiceNumber: `INV-${order.orderNumber}` } });
});

// @desc    Verify payment
exports.verifyPayment = catchAsync(async (req, res, next) => {
  return next(new AppError('Use /api/payment/verify-payment for payment verification.', 501));
});