const { Promotion } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.getActivePromotions = catchAsync(async (req, res, next) => {
  const now = new Date();
  
  const promotions = await Promotion.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        {
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now }
        },
        {
          startDate: null,
          endDate: null
        }
      ]
    },
    order: [['priority', 'DESC'], ['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: promotions.length,
    data: promotions
  });
});

// ─── Admin Endpoints ─────────────────────────────────

exports.getAllPromotions = catchAsync(async (req, res) => {
  const promotions = await Promotion.findAll({
    order: [['priority', 'DESC'], ['createdAt', 'DESC']]
  });
  res.status(200).json({ status: 'success', data: promotions });
});

exports.createPromotion = catchAsync(async (req, res) => {
  const promotion = await Promotion.create(req.body);
  res.status(201).json({ status: 'success', data: promotion });
});

exports.updatePromotion = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const promotion = await Promotion.findByPk(id);
  if (!promotion) return next(new AppError('Promotion not found', 404));
  await promotion.update(req.body);
  res.status(200).json({ status: 'success', data: promotion });
});

exports.deletePromotion = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const promotion = await Promotion.findByPk(id);
  if (!promotion) return next(new AppError('Promotion not found', 404));
  await promotion.destroy();
  res.status(204).json({ status: 'success', data: null });
});
