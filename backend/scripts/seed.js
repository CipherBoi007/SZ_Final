const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { 
  User, 
  Category, 
  Product, 
  ProductImage, 
  Address, 
  Cart, 
  Wishlist, 
  Order, 
  OrderItem, 
  Review, 
  Coupon, 
  ProductVariant, 
  CouponUsage 
} = require('../src/models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Sync database (force: true for development, careful in production)
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Seed Users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      users.push({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `98765432${i.toString().padStart(2, '0')}`,
        password: await bcrypt.hash('password123', 12),
        role: i === 1 ? 'admin' : 'user',
        isActive: true,
      });
    }
    const createdUsers = await User.bulkCreate(users);
    console.log('Users seeded.');

    // Seed Categories (Hierarchical)
    const rootCategories = await Category.bulkCreate([
      { name: 'Men', description: 'Men Clothing' },
      { name: 'Women', description: 'Women Clothing' },
      { name: 'Kids', description: 'Kids Clothing' },
    ]);

    const subCategories = await Category.bulkCreate([
      { name: 'T-Shirts', parentId: rootCategories[0].id },
      { name: 'Jeans', parentId: rootCategories[0].id },
      { name: 'Dresses', parentId: rootCategories[1].id },
      { name: 'Toys', parentId: rootCategories[2].id },
    ]);
    console.log('Categories seeded.');

    // Seed Products
    const productsData = [];
    for (let i = 1; i <= 10; i++) {
      productsData.push({
        name: `Premium Product ${i}`,
        brand: `Brand ${i % 3 + 1}`,
        description: `This is a high-quality description for product ${i}`,
        material: 'Cotton Blend',
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        numReviews: Math.floor(Math.random() * 100),
        isFeatured: i % 3 === 0,
        categoryId: subCategories[i % subCategories.length].id,
      });
    }
    const createdProducts = await Product.bulkCreate(productsData);
    console.log('Products seeded.');

    // Seed Product Variants
    const variantsData = [];
    for (const product of createdProducts) {
      const sizes = ['S', 'M', 'L', 'XL'];
      const colors = ['Black', 'Blue', 'White'];
      
      for (const size of sizes) {
        for (const color of colors) {
          variantsData.push({
            productId: product.id,
            size,
            color,
            price: (Math.random() * 50 + 20).toFixed(2),
            stock: Math.floor(Math.random() * 50) + 10,
            sku: `SKU-${product.id.substring(0, 4)}-${size}-${color}-${Math.random().toString(36).substring(7)}`,
          });
        }
      }
    }
    const createdVariants = await ProductVariant.bulkCreate(variantsData);
    console.log('Product Variants seeded.');

    // Seed ProductImages
    const productImages = [];
    for (let i = 0; i < createdProducts.length; i++) {
      // Primary image for product
      productImages.push({
        url: `https://picsum.photos/seed/p${i}/800/800`,
        isPrimary: true,
        order: 0,
        productId: createdProducts[i].id,
      });

      // Variant specific images (for first 2 variants of each product)
      const productVariants = createdVariants.filter(v => v.productId === createdProducts[i].id);
      for (let j = 0; j < Math.min(2, productVariants.length); j++) {
        productImages.push({
          url: `https://picsum.photos/seed/v${i}${j}/800/800`,
          isPrimary: false,
          order: j + 1,
          productId: createdProducts[i].id,
          variantId: productVariants[j].id,
        });
      }
    }
    await ProductImage.bulkCreate(productImages);
    console.log('ProductImages seeded.');

    // Seed Addresses
    const addresses = [];
    for (const user of createdUsers) {
      addresses.push({
        type: 'home',
        name: user.name,
        phone: user.phone,
        addressLine1: `${Math.floor(Math.random() * 999) + 1} Fashion Street`,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
        userId: user.id,
      });
    }
    const createdAddresses = await Address.bulkCreate(addresses);
    console.log('Addresses seeded.');

    // Seed Coupons
    const coupons = await Coupon.bulkCreate([
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderValue: 500, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), isActive: true },
      { code: 'FLAT50', discountType: 'fixed', discountValue: 50, minOrderValue: 1000, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), isActive: true },
    ]);
    console.log('Coupons seeded.');

    // Seed Carts
    const carts = [];
    for (let i = 1; i < createdUsers.length; i++) { // Skip admin
      carts.push({
        quantity: 1,
        userId: createdUsers[i].id,
        variantId: createdVariants[Math.floor(Math.random() * createdVariants.length)].id,
      });
    }
    await Cart.bulkCreate(carts);
    console.log('Carts seeded.');

    // Seed Orders & OrderItems
    for (let i = 1; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const address = createdAddresses.find(a => a.userId === user.id);
      const variant = createdVariants[Math.floor(Math.random() * createdVariants.length)];
      const product = createdProducts.find(p => p.id === variant.productId);

      const order = await Order.create({
        orderNumber: `ORD-${Date.now()}-${i}`,
        totalAmount: variant.price,
        finalAmount: variant.price,
        status: 'delivered',
        paymentStatus: 'completed',
        paymentMethod: 'razorpay',
        shippingAddressSnapshot: address.toJSON(),
        billingAddressSnapshot: address.toJSON(),
        phone: user.phone,
        email: user.email,
        userId: user.id,
        shippingAddressId: address.id,
        billingAddressId: address.id,
      });

      await OrderItem.create({
        orderId: order.id,
        variantId: variant.id,
        quantity: 1,
        priceAtPurchase: variant.price,
        productSnapshot: {
          name: product.name,
          brand: product.brand,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
        }
      });
    }
    console.log('Orders & OrderItems seeded.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();