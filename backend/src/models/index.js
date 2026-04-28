const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const ProductImage = require('./ProductImage');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const Address = require('./Address');
const ProductVariant = require('./ProductVariant');

// User associations
User.hasOne(Cart, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
User.hasMany(CouponUsage, { foreignKey: 'userId' });
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });

Wishlist.belongsTo(User, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CouponUsage.belongsTo(User, { foreignKey: 'userId' });

// Category associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Product associations
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });

ProductVariant.belongsTo(Product, { foreignKey: 'productId' });
ProductVariant.hasMany(ProductImage, { foreignKey: 'variantId', as: 'images' });
ProductVariant.hasMany(Cart, { foreignKey: 'variantId' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId' });

ProductImage.belongsTo(Product, { foreignKey: 'productId' });
ProductImage.belongsTo(ProductVariant, { foreignKey: 'variantId' });

Review.belongsTo(Product, { foreignKey: 'productId' });
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(OrderItem, { foreignKey: 'orderItemId' });

Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
Order.belongsTo(Address, { as: 'shippingAddress', foreignKey: 'shippingAddressId' });
Order.belongsTo(Address, { as: 'billingAddress', foreignKey: 'billingAddressId' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });
OrderItem.hasOne(Review, { foreignKey: 'orderItemId' });

// Coupon associations
Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });
Coupon.hasMany(CouponUsage, { foreignKey: 'couponId', as: 'usages' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });

module.exports = {
  User,
  Product,
  Category,
  ProductImage,
  Cart,
  Order,
  OrderItem,
  Coupon,
  CouponUsage,
  Review,
  Wishlist,
  Address,
  ProductVariant,
};