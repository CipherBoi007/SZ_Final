const { Promotion } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const imageService = require('../services/imageService');

exports.getActivePromotions = catchAsync(async (req, res, next) => {
  const now = new Date();
  
  const promotions = await Promotion.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        {
          [Op.or]: [
            { startDate: null },
            { startDate: { [Op.lte]: now } }
          ]
        },
        {
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: now } }
          ]
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
  const data = { ...req.body };
  if (data.startDate === '') data.startDate = null;
  if (data.endDate === '') data.endDate = null;
  if (req.file) {
    data.bannerImage = await imageService.uploadImage(req.file, 'promotions');
  }
  const promotion = await Promotion.create(data);
  res.status(201).json({ status: 'success', data: promotion });
});

exports.updatePromotion = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const promotion = await Promotion.findByPk(id);
  if (!promotion) return next(new AppError('Promotion not found', 404));
  
  const data = { ...req.body };
  if (data.startDate === '') data.startDate = null;
  if (data.endDate === '') data.endDate = null;
  if (req.file) {
    data.bannerImage = await imageService.uploadImage(req.file, 'promotions');
  }
  
  await promotion.update(data);
  res.status(200).json({ status: 'success', data: promotion });
});

exports.deletePromotion = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const promotion = await Promotion.findByPk(id);
  if (!promotion) return next(new AppError('Promotion not found', 404));
  await promotion.destroy();
  res.status(204).json({ status: 'success', data: null });
});
