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
  CouponUsage,
  Promotion
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

    // Seed Categories
    const rootCategories = await Category.bulkCreate([
      { name: 'Casuals', description: 'Everyday comfortable wear', image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800' },
      { name: 'Formals', description: 'Sharp and professional attire', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800' },
      { name: 'Traditional', description: 'Ethnic and cultural wear', image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800' },
      { name: 'Streetwear', description: 'Urban and bold styles', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800' },
      { name: 'Sports', description: 'High-performance athletic gear', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800' },
    ]);

    console.log('Categories seeded.');

    // Realistic Product Names Pool
    const namePool = {
      'Casuals': ['Classic Polo Shirt', 'Slim Fit Denim Jeans', 'Essential Crewneck Tee', 'Cotton Twill Chinos', 'Hooded Sweatshirt'],
      'Formals': ['Premium Slim Fit Blazer', 'Oxford Button-Down Shirt', 'Pleated Dress Trousers', 'Classic Silk Tie', 'Evening Tuxedo Jacket'],
      'Traditional': ['Handloomed Silk Kurta', 'Royal Embroidered Sherwani', 'Classic Nehru Jacket', 'Indo-Western Fusion Set', 'Cotton Chikankari Kurta'],
      'Sports': ['Breathable Training Tee', 'Performance Tech Joggers', 'Compression Workout Shorts', 'Lightweight Windbreaker', 'Athletic Fit Hoodie'],
      'Streetwear': ['Oversized Graphic Tee', 'Cargo Jogger Pants', 'Distressed Denim Jacket', 'Urban Utility Vest', 'Street Style Bucket Hat']
    };

    // Seed Products
    const productsData = [];
    const productBasePrices = []; // Store base price for each product

    for (let i = 0; i < 20; i++) {
      const cat = rootCategories[i % rootCategories.length];
      const names = namePool[cat.name] || namePool['Casuals'];
      const productName = names[Math.floor(i / rootCategories.length) % names.length];
      const basePrice = (Math.floor(Math.random() * 20) * 100 + 999); // Prices like 999, 1499, 2999

      productBasePrices.push(basePrice);
      productsData.push({
        name: `${productName} ${i >= rootCategories.length ? 'II' : ''}`.trim(),
        brand: 'SouthZone',
        description: `Experience the perfect blend of style and comfort with our ${productName}. Crafted from premium materials for a superior fit.`,
        material: 'Premium Cotton / Blends',
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0 for better looks
        numReviews: Math.floor(Math.random() * 200) + 50,
        isFeatured: i % 3 === 0,
        categoryId: cat.id,
        // Randomize createdAt to test "New Arrivals" (some < 3 months, some > 3 months)
        createdAt: Math.random() > 0.5 
          ? new Date() 
          : new Date(new Date().setMonth(new Date().getMonth() - 6))
      });
    }
    const createdProducts = await Product.bulkCreate(productsData);
    console.log('Products seeded.');

    // Seed Product Variants
    const variantsData = [];
    createdProducts.forEach((product, i) => {
      const sizes = ['S', 'M', 'L', 'XL'];
      const colors = ['Black', 'Navy', 'White'];
      const price = productBasePrices[i]; // Use same price for all variants
      
      for (const size of sizes) {
        for (const color of colors) {
          variantsData.push({
            productId: product.id,
            size,
            color,
            price: price,
            stock: Math.floor(Math.random() * 50) + 20,
            sku: `SZ-${product.name.substring(0, 3).toUpperCase()}-${size}-${color}-${i}`,
          });
        }
      }
    });
    const createdVariants = await ProductVariant.bulkCreate(variantsData);
    console.log('Product Variants seeded.');

    // Relevant Product Images for Men's Wear
    const catImageMap = {
      'Casuals': ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c', 'https://images.unsplash.com/photo-1617137968427-85924c800a22'],
      'Formals': ['https://images.unsplash.com/photo-1507679799987-c73779587ccf', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f', 'https://images.unsplash.com/photo-1516257984877-283b9c81a549'],
      'Traditional': ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'],
      'Sports': ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798'],
      'Streetwear': ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c']
    };

    // Seed ProductImages
    const productImages = [];
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      const category = rootCategories.find(c => c.id === product.categoryId);
      const images = catImageMap[category.name] || catImageMap['Casuals'];
      const imgUrl = `${images[i % images.length]}?q=80&w=800`;

      // Primary image for product
      productImages.push({
        url: imgUrl,
        isPrimary: true,
        order: 0,
        productId: product.id,
      });

      // Variant specific images
      const productVariants = createdVariants.filter(v => v.productId === product.id);
      for (let j = 0; j < Math.min(2, productVariants.length); j++) {
        productImages.push({
          url: imgUrl, // Re-use for simplicity or add j variance
          isPrimary: false,
          order: j + 1,
          productId: product.id,
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

    // Seed Promotions (Campaign Banners)
    const promotions = await Promotion.bulkCreate([
      { 
        title: 'Diwali Dhamaka', 
        subtitle: 'Up to 50% Off on Ethnic Wear', 
        bannerImage: 'https://images.unsplash.com/photo-1517554558296-606067715f8a?q=80&w=1200', 
        targetLink: '/shop?category=Traditional',
        priority: 2,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000)
      },
      { 
        title: 'Pongal Special', 
        subtitle: 'Fresh styles for the harvest season', 
        bannerImage: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1200', 
        targetLink: '/shop',
        priority: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000)
      }
    ]);
    console.log('Promotions seeded.');

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
    console.log('Seeding orders for Trending section...');
    for (let i = 1; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const address = createdAddresses.find(a => a.userId === user.id);
      
      // Create 3 orders per user to boost trending data
      for (let j = 0; j < 3; j++) {
        const variant = createdVariants[Math.floor(Math.random() * createdVariants.length)];
        const product = createdProducts.find(p => p.id === variant.productId);

        const order = await Order.create({
          orderNumber: `ORD-${Date.now()}-${i}-${j}`,
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
          createdAt: new Date(), // Within 3 months
        });

        await OrderItem.create({
          orderId: order.id,
          variantId: variant.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          priceAtPurchase: variant.price,
          productSnapshot: {
            name: product.name,
            brand: product.brand,
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
          },
          createdAt: new Date(), // Within 3 months
        });
      }
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