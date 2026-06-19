const { User, Product, Order, Coupon, Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const whatsappService = require('../services/whatsappService');
const paymentService = require('../services/paymentService');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Order,
        limit: 10,
        order: [['createdAt', 'DESC']],
      },
    ],
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // H8: Whitelist allowed fields to prevent mass assignment attacks
  const allowedFields = ['name', 'email', 'phone', 'isActive'];
  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  await user.update(updateData);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.promoteToAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.update({ role: 'admin' });

  res.status(200).json({
    status: 'success',
    message: 'User promoted to admin successfully',
  });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'admin') {
    // Check if this is the last admin
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      return next(new AppError('Cannot deactivate the last admin', 400));
    }
  }

  await user.update({ isActive: false });

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully',
  });
});

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalProducts,
    totalOrders,
    ordersThisMonth,
    overallRevenue,
    revenueThisMonth,
    recentOrders,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
    Product.count(),
    Order.count(),
    Order.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
    Order.sum('finalAmount', {
      where: {
        paymentStatus: 'completed',
      },
    }),
    Order.sum('finalAmount', {
      where: {
        createdAt: { [Op.gte]: startOfMonth },
        paymentStatus: 'completed',
      },
    }),
    Order.findAll({
      limit: 5, // Tightened to 5 as requested
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      products: totalProducts,
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
      },
      revenue: {
        overall: overallRevenue || 0,
        thisMonth: revenueThisMonth || 0,
      },
      recentOrders,
    },
  });
});

// ─── Financial Ledger ────────────────────────────────
exports.getTransactions = catchAsync(async (req, res) => {
  const orders = await Order.findAll({
    where: { paymentStatus: { [Op.in]: ['completed', 'refunded'] } },
    order: [['createdAt', 'ASC']], // Ascending for running total logic
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
  });

  let runningTotal = 0;
  const transactions = orders.map(order => {
    const isRefunded = order.status === 'refunded' || order.paymentStatus === 'refunded';
    const amount = Number(order.finalAmount || order.totalAmount);
    
    // Logic: Credit if paid, Debit if refunded
    const credit = isRefunded ? 0 : amount;
    const debit = isRefunded ? amount : 0;
    
    runningTotal += (credit - debit);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      user: order.user,
      credit,
      debit,
      runningTotal,
      status: order.status
    };
  }).reverse(); // Reverse back to show most recent at top

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});

// ─── Admin Orders ────────────────────────────────────
exports.getAllOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await Order.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
  });

  res.status(200).json({ 
    status: 'success', 
    total: count,
    page,
    pages: Math.ceil(count / limit),
    data: rows 
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { 
        model: require('../models').OrderItem, 
        as: 'orderItems',
      }
    ]
  });

  if (!order) return next(new AppError('Order not found', 404));

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, trackingNumber, carrier } = req.body;
  const order = await Order.findByPk(id);
  if (!order) return next(new AppError('Order not found', 404));
  const updateData = { status };
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (carrier) updateData.carrier = carrier;
  await order.update(updateData);

  // ─── Post-Update Notifications ─────────────────────
  try {
    const phone = order.phone;
    if (phone) {
      if (status === 'shipped') {
        await whatsappService.sendOrderShipped(phone, order.orderNumber, trackingNumber, carrier);
      } else if (status === 'delivered') {
        await whatsappService.sendOrderDelivered(phone, order.orderNumber);
      }
    }
  } catch (notifErr) {
    console.error('Admin Notification Error:', notifErr.message);
  }

  res.status(200).json({ status: 'success', data: order });
});

// ─── Admin Delivery Date ────────────────────────────────
exports.updateDeliveryDate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deliveryDate } = req.body;

  const order = await Order.findByPk(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Format delivery date with day name
  const formattedDate = new Date(deliveryDate);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDeliveryDate = formattedDate.toLocaleDateString('en-IN', options);

  await order.update({
    deliveryDate,
    estimatedDelivery: deliveryDate,
    deliveryDateFormatted: formattedDeliveryDate, // Store formatted date
  });

  res.status(200).json({
    status: 'success',
    message: 'Delivery date updated successfully',
    data: { 
      deliveryDate,
      formattedDeliveryDate,
    },
  });
});

const imageService = require('../services/imageService');

// ─── Admin Categories ────────────────────────────────
exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.status(200).json({ status: 'success', data: categories });
});

exports.createCategory = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image = await imageService.uploadImage(req.file, 'categories');
  }
  const category = await Category.create(req.body);
  res.status(201).json({ status: 'success', data: category });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) return next(new AppError('Category not found', 404));
  
  if (req.file) {
    // Optionally delete old image if it exists on cloudinary
    if (category.image && category.image.includes('cloudinary')) {
      await imageService.deleteImage(category.image).catch(err => console.error('Failed to delete old category image:', err));
    }
    req.body.image = await imageService.uploadImage(req.file, 'categories');
  }
  
  await category.update(req.body);
  res.status(200).json({ status: 'success', data: category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) return next(new AppError('Category not found', 404));
  await category.destroy();
  res.status(204).json({ status: 'success', data: null });
});

// ─── Admin Refunds ───────────────────────────────────
// @desc    Process refund for cancelled order
exports.processRefund = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findByPk(id);

  if (!order) return next(new AppError('Order not found', 404));
  if (order.paymentStatus !== 'completed') return next(new AppError('No successful payment found to refund', 400));
  if (order.status !== 'cancelled' && order.status !== 'refunded') {
    return next(new AppError('Only cancelled orders can be refunded', 400));
  }

  try {
    const refund = await paymentService.refundPayment(order.paymentId, order.finalAmount);
    
    await order.update({
      status: 'refunded',
      paymentStatus: 'refunded',
      refundId: refund.id,
      refundedAt: new Date(),
    });

    res.status(200).json({ 
      status: 'success', 
      message: 'Refund processed successfully via Razorpay',
      data: { refundId: refund.id } 
    });
  } catch (error) {
    return next(new AppError(`Razorpay Refund Failed: ${error.message}`, 500));
  }
});