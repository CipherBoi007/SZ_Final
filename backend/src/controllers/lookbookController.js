const { Lookbook } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const imageService = require('../services/imageService');

// @desc    Get all lookbook images
// @route   GET /api/lookbook
// @access  Public
exports.getLookbook = catchAsync(async (req, res) => {
  const images = await Lookbook.findAll({
    order: [['order', 'ASC'], ['createdAt', 'DESC']]
  });
  res.status(200).json({ status: 'success', data: images });
});

// @desc    Add lookbook images (bulk)
// @route   POST /api/lookbook
// @access  Private/Admin
exports.addLookbookImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(new AppError('Please upload at least one image', 400));
  
  const currentCount = await Lookbook.count();
  
  const uploadPromises = req.files.map(async (file, index) => {
    const imageUrl = await imageService.uploadImage(file, 'lookbook');
    return {
      imageUrl,
      order: currentCount + index
    };
  });
  
  const imageData = await Promise.all(uploadPromises);
  const images = await Lookbook.bulkCreate(imageData);
  
  res.status(201).json({ status: 'success', data: images });
});

// @desc    Delete lookbook image
// @route   DELETE /api/lookbook/:id
// @access  Private/Admin
exports.deleteLookbookImage = catchAsync(async (req, res, next) => {
  const image = await Lookbook.findByPk(req.params.id);
  if (!image) return next(new AppError('Image not found', 404));
  
  await image.destroy();
  res.status(204).json({ status: 'success', data: null });
});

// @desc    Reorder lookbook images
// @route   PATCH /api/lookbook/reorder
// @access  Private/Admin
exports.reorderLookbook = catchAsync(async (req, res, next) => {
  const { orderings } = req.body; // [{ id: '...', order: 0 }, ...]
  
  if (!orderings || !Array.isArray(orderings)) {
    return next(new AppError('Invalid orderings format', 400));
  }
  
  const promises = orderings.map(item => 
    Lookbook.update({ order: item.order }, { where: { id: item.id } })
  );
  
  await Promise.all(promises);
  res.status(200).json({ status: 'success', message: 'Reordered successfully' });
});
