const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/env');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const razorpay = new Razorpay({
  key_id: config.RAZORPAY.KEY_ID,
  key_secret: config.RAZORPAY.KEY_SECRET,
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount) return next(new AppError('Amount is required', 400));

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    status: 'success',
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', config.RAZORPAY.KEY_SECRET)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    // Payment is verified
    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
    });
  } else {
    return next(new AppError('Invalid payment signature', 400));
  }
});
