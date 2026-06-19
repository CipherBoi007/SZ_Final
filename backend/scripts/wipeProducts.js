const sequelize = require('../src/config/database');

const {
  Review,
  OrderItem,
  Order,
  Cart,
  Wishlist,
  ProductImage,
  ProductVariant,
  Product
} = require('../src/models');

async function wipeDatabase() {
  try {
    console.log('Authenticating with database...');
    await sequelize.authenticate();
    console.log('Connected.');

    console.log('Wiping Reviews...');
    await Review.destroy({ where: {} });

    console.log('Wiping OrderItems...');
    await OrderItem.destroy({ where: {} });

    console.log('Wiping Orders...');
    await Order.destroy({ where: {} });

    console.log('Wiping CartItems...');
    await Cart.destroy({ where: {} });

    console.log('Wiping WishlistItems...');
    await Wishlist.destroy({ where: {} });

    console.log('Wiping ProductImages...');
    await ProductImage.destroy({ where: {} });

    console.log('Wiping ProductVariants...');
    await ProductVariant.destroy({ where: {} });

    console.log('Wiping Products...');
    await Product.destroy({ where: {} });

    console.log('Successfully wiped all products and related transactions! Users and other configuration data are kept intact.');
  } catch (error) {
    console.error('Error wiping data:', error);
  } finally {
    await sequelize.close();
  }
}

wipeDatabase();
