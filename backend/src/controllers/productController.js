const { Product, Category, ProductImage, Review, User, ProductVariant, Order, OrderItem } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const cacheService = require('../services/cacheService');
const imageService = require('../services/imageService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Get all products with filtering, sorting, pagination
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const features = new APIFeatures(req.query).filter().search().sort().paginate();
  const queryOptions = features.build();

  const priceFilter = {};
  if (queryOptions.where.price) {
    priceFilter.price = queryOptions.where.price;
    delete queryOptions.where.price;
  }

  const products = await Product.findAll({
    where: queryOptions.where,
    attributes: ['id', 'name', 'brand', 'description', 'rating', 'numReviews', 'isFeatured', 'isNew', 'isTrending', 'material', 'categoryId', 'discount', 'createdAt'],
    include: [
      {
        model: ProductVariant,
        as: 'variants',
        attributes: ['id', 'size', 'color', 'price', 'stock'],
        where: Object.keys(priceFilter).length > 0 ? priceFilter : undefined,
        required: Object.keys(priceFilter).length > 0,
      },
      {
        model: ProductImage,
        as: 'images',
        attributes: ['id', 'url', 'isPrimary', 'order', 'variantId'],
        separate: true,
        order: [['order', 'ASC']],
      },
      { model: Category, attributes: ['id', 'name'] },
    ],
    order: queryOptions.order,
    limit: queryOptions.limit,
    offset: queryOptions.offset,
  });

  const totalCount = await Product.count({ where: queryOptions.where });

  const response = {
    products,
    pagination: {
      page: parseInt(req.query.page, 10) || 1,
      total: totalCount,
      pages: Math.ceil(totalCount / (parseInt(req.query.limit, 10) || 10)),
    },
    filters: {
      categories: await Category.findAll({ attributes: ['id', 'name'] }),
      brands: await Product.findAll({ 
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
        where: { brand: { [Op.ne]: null } },
        raw: true,
      }),
      priceRange: {
        min: await ProductVariant.min('price'),
        max: await ProductVariant.max('price'),
      },
    },
  };

  await cacheService.set(cacheKey, response, 300);
  res.status(200).json({ status: 'success', results: products.length, data: response });
});

// @desc    Get single product by ID
exports.getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const product = await Product.findByPk(id, {
    include: [
      { model: ProductVariant, as: 'variants' },
      { model: ProductImage, as: 'images' },
      { model: Category, attributes: ['id', 'name'] },
      { 
        model: Review, 
        as: 'reviews', 
        include: [{ model: User, attributes: ['id', 'name'] }],
        limit: 10,
        separate: true,
        order: [['createdAt', 'DESC']]
      },
    ],
  });

  if (!product) return next(new AppError('Product not found', 404));
  const productData = product.toJSON();

  await cacheService.set(cacheKey, productData, 300);
  res.status(200).json({ status: 'success', data: productData });
});

// @desc    Create new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const result = await sequelize.transaction(async (t) => {
    const product = await Product.create(req.body, { transaction: t });
    if (req.body.variants) {
      await ProductVariant.bulkCreate(req.body.variants.map(v => ({ ...v, productId: product.id })), { transaction: t });
    }
    return product;
  });

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file, i) => {
      const cloudinaryUrl = await imageService.uploadImage(file.path, 'products');
      return {
        productId: result.id,
        url: cloudinaryUrl,
        isPrimary: i === 0,
        order: i,
      };
    });
    
    const images = await Promise.all(uploadPromises);
    await ProductImage.bulkCreate(images);
  }

  await cacheService.delByPattern('products:*');
  res.status(201).json({ status: 'success', data: result });
});

// @desc    Update product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  await product.update(req.body);
  await cacheService.del(`product:${req.params.id}`);
  await cacheService.delByPattern('products:*');
  res.status(200).json({ status: 'success', data: product });
});

// @desc    Delete product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  await product.destroy();
  await cacheService.del(`product:${req.params.id}`);
  await cacheService.delByPattern('products:*');
  res.status(204).json({ status: 'success', data: null });
});

// @desc    Get featured products
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { isFeatured: true },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 10
  });
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Get new arrivals
exports.getNewArrivals = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { isNew: true },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 10,
    order: [['createdAt', 'DESC']]
  });
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Get trending products
exports.getTrendingProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { isTrending: true },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 10
  });
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Search products
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const products = await Product.findAll({
    where: { name: { [Op.iLike]: `%${q}%` } },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 20
  });
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Get products by category
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { categoryId: req.params.categoryId },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
      { model: Category, attributes: ['id', 'name'] },
    ],
  });
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Update product stock (Product level - updates first variant or all? Usually we want variant specific)
// But to keep routes working, I'll add a generic one
exports.updateStock = catchAsync(async (req, res, next) => {
  const variant = await ProductVariant.findOne({ where: { productId: req.params.id } });
  if (!variant) return next(new AppError('No variants found for this product', 404));
  await variant.update({ stock: req.body.stock || req.body.quantity });
  res.status(200).json({ status: 'success', data: variant });
});

// @desc    Update variant stock specifically
exports.updateVariantStock = catchAsync(async (req, res, next) => {
  const variant = await ProductVariant.findByPk(req.params.variantId);
  if (!variant) return next(new AppError('Variant not found', 404));
  await variant.update({ stock: req.body.stock || req.body.quantity });
  res.status(200).json({ status: 'success', data: variant });
});

// @desc    Add product review
exports.addReview = catchAsync(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const review = await Review.create({
    userId: req.user.id,
    productId: req.params.id,
    rating,
    title,
    comment
  });
  res.status(201).json({ status: 'success', data: review });
});

// @desc    Delete product image
exports.deleteProductImage = catchAsync(async (req, res, next) => {
  const image = await ProductImage.findByPk(req.params.imageId);
  if (!image) return next(new AppError('Image not found', 404));
  await image.destroy();
  res.status(204).json({ status: 'success', data: null });
});

// @desc    Set primary image
exports.setPrimaryImage = catchAsync(async (req, res, next) => {
  await ProductImage.update({ isPrimary: false }, { where: { productId: req.params.productId } });
  const image = await ProductImage.findByPk(req.params.imageId);
  await image.update({ isPrimary: true });
  res.status(200).json({ status: 'success', data: image });
});