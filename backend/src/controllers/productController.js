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

  // Normalize category/categoryId query params (e.g. ?category=Minimalist Noir -> categoryId=Minimalist Noir)
  if (req.query.category && !req.query.categoryId) {
    req.query.categoryId = req.query.category;
    delete req.query.category;
  }

  const features = new APIFeatures(req.query).filter().search().sort().paginate();
  const queryOptions = features.build();

  // Resolve category names inside categoryId to database IDs dynamically
  if (queryOptions.where.categoryId) {
    const categoryIdVal = queryOptions.where.categoryId;
    const categoryIds = Array.isArray(categoryIdVal) ? categoryIdVal : [categoryIdVal];
    
    const ids = [];
    const names = [];
    
    categoryIds.forEach(val => {
      if (typeof val === 'string' && val.startsWith('CAT') && val.length === 15) {
        ids.push(val);
      } else if (typeof val === 'string') {
        names.push(val);
      }
    });
    
    if (names.length > 0) {
      const foundCategories = await Category.findAll({
        where: {
          name: names
        }
      });
      ids.push(...foundCategories.map(c => c.id));
    }
    
    if (ids.length > 0) {
      queryOptions.where.categoryId = ids.length === 1 ? ids[0] : ids;
    } else {
      queryOptions.where.categoryId = 'NOT_FOUND';
    }
  }

  const variantFilter = {};
  if (queryOptions.where.price) {
    variantFilter.price = queryOptions.where.price;
    delete queryOptions.where.price;
  }
  if (queryOptions.where.size) {
    variantFilter.size = queryOptions.where.size;
    delete queryOptions.where.size;
  }
  if (queryOptions.where.stock) {
    variantFilter.stock = queryOptions.where.stock;
    delete queryOptions.where.stock;
  }

  // Map order by price to variant price
  let orderClause = queryOptions.order;
  let hasPriceSort = false;
  if (orderClause && orderClause.length > 0) {
    orderClause = orderClause.map(clause => {
      if (clause[0] === 'price') {
        hasPriceSort = true;
        return [{ model: ProductVariant, as: 'variants' }, 'price', clause[1]];
      }
      return clause;
    });
  }

  // Parallelize independent data fetching
  const [products, totalCount, categories, brands, priceRange] = await Promise.all([
    Product.findAll({
      where: queryOptions.where,
      attributes: ['id', 'name', 'brand', 'description', 'rating', 'numReviews', 'isFeatured', 'isNew', 'isTrending', 'material', 'categoryId', 'discount', 'createdAt'],
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'size', 'color', 'price', 'stock'],
          where: Object.keys(variantFilter).length > 0 ? variantFilter : undefined,
          required: Object.keys(variantFilter).length > 0 || hasPriceSort,
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
      order: orderClause,
      limit: queryOptions.limit,
      offset: queryOptions.offset,
    }),
    Product.count({
      where: queryOptions.where,
      include: Object.keys(variantFilter).length > 0 ? [
        {
          model: ProductVariant,
          as: 'variants',
          where: variantFilter,
          required: true
        }
      ] : undefined,
      distinct: true
    }),
    Category.findAll({ attributes: ['id', 'name'], raw: true }),
    Product.findAll({ 
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
      where: { brand: { [Op.ne]: null } },
      raw: true,
    }),
    ProductVariant.findAll({
      attributes: [
        [sequelize.fn('MIN', sequelize.col('price')), 'min'],
        [sequelize.fn('MAX', sequelize.col('price')), 'max']
      ],
      raw: true
    })
  ]);

  const response = {
    products,
    pagination: {
      page: parseInt(req.query.page, 10) || 1,
      total: totalCount,
      pages: Math.ceil(totalCount / (parseInt(req.query.limit, 10) || 10)),
    },
    filters: {
      categories,
      brands: brands.map(b => b.brand),
      priceRange: {
        min: parseFloat(priceRange[0]?.min || 0),
        max: parseFloat(priceRange[0]?.max || 0),
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
      // M7: Pass the file object (not file.path) — imageService expects an object with .path
      const cloudinaryUrl = await imageService.uploadImage(file, 'products');
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
  const cacheKey = 'products:featured';
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const products = await Product.findAll({
    where: { isFeatured: true },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 10
  });

  await cacheService.set(cacheKey, products, 3600); // 1 hour
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Get new arrivals
exports.getNewArrivals = catchAsync(async (req, res, next) => {
  const cacheKey = 'products:new-arrivals';
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const products = await Product.findAll({
    where: { 
      createdAt: { [Op.gte]: threeMonthsAgo } 
    },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 10,
    order: [['createdAt', 'DESC']]
  });

  await cacheService.set(cacheKey, products, 3600); // 1 hour
  res.status(200).json({ status: 'success', data: products });
});

// @desc    Get trending products
exports.getTrendingProducts = catchAsync(async (req, res, next) => {
  const cacheKey = 'products:trending';
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const cutoffDate = sequelize.escape(threeMonthsAgo.toISOString());

  // C4: Use sequelize.escape() to prevent SQL injection in literal subqueries
  const trendingProducts = await Product.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT SUM("OrderItem"."quantity")
            FROM "OrderItems" AS "OrderItem"
            INNER JOIN "ProductVariants" AS "Variant" ON "OrderItem"."variantId" = "Variant"."id"
            WHERE "Variant"."productId" = "Product"."id"
            AND "OrderItem"."createdAt" >= ${cutoffDate}
          )`),
          'orderCount'
        ]
      ]
    },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    order: [[sequelize.literal('"orderCount"'), 'DESC']],
    limit: 10,
    where: sequelize.literal(`(
      SELECT SUM("OrderItem"."quantity")
      FROM "OrderItems" AS "OrderItem"
      INNER JOIN "ProductVariants" AS "Variant" ON "OrderItem"."variantId" = "Variant"."id"
      WHERE "Variant"."productId" = "Product"."id"
      AND "OrderItem"."createdAt" >= ${cutoffDate}
    ) > 0`)
  });

  await cacheService.set(cacheKey, trendingProducts, 3600); // 1 hour
  res.status(200).json({ status: 'success', data: trendingProducts });
});

// @desc    Get top rated products (rating > 4.3)
exports.getTopRatedProducts = catchAsync(async (req, res, next) => {
  const cacheKey = 'products:top-rated';
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const products = await Product.findAll({
    where: { 
      rating: { [Op.gte]: 4.3 } 
    },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
    ],
    limit: 10,
    order: [['rating', 'DESC']]
  });

  await cacheService.set(cacheKey, products, 3600); // 1 hour
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
  const { categoryId } = req.params;
  const cacheKey = `products:category:${categoryId}`;
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return res.status(200).json({ status: 'success', fromCache: true, data: cachedData });

  const products = await Product.findAll({
    where: { categoryId },
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['order', 'ASC']] },
      { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'price', 'stock'] },
      { model: Category, attributes: ['id', 'name'] },
    ],
  });

  await cacheService.set(cacheKey, products, 300);
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

// @desc    Get all reviews (Admin)
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Product, attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.status(200).json({ status: 'success', results: reviews.length, data: reviews });
});

// @desc    Delete a review (Admin)
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  await review.destroy();
  res.status(204).json({ status: 'success', data: null });
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