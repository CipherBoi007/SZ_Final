const sequelize = require('./src/config/database');
const { 
  User, Product, Category, ProductVariant, ProductImage, 
  Order, OrderItem, Coupon, Address, Promotion, Review, CouponUsage 
} = require('./src/models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('--- 🚀 STARTING SOUTHZONE LEGACY SIMULATION (3 YEARS) ---');
    await sequelize.sync({ force: true });
    console.log('✓ Database Purged & Structural Integrity Verified');

    // ─── 1. CORE IDENTITIES ──────────────────────────
    const hashedBtn = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'SouthZone Executive',
      email: 'admin@southzone.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999'
    });

    // Create 50 Regular Users
    const users = [];
    for (let i = 1; i <= 50; i++) {
      users.push({
        name: `Customer ${i}`,
        email: `customer${i}@gmail.com`,
        password: 'user123',
        role: 'user',
        phone: `9${Math.floor(Math.random() * 1000000000)}`
      });
    }
    const createdUsers = await User.bulkCreate(users);
    console.log(`✓ ${createdUsers.length} Customer Profiles Synchronized`);

    // ─── 2. GEOGRAPHIC DISTRIBUTION ─────────────────
    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];
    const addresses = [];
    for (const u of createdUsers) {
      const numAddr = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numAddr; j++) {
        addresses.push({
          userId: u.id,
          name: u.name,
          phone: u.phone,
          addressLine1: `${Math.floor(Math.random() * 999) + 1} Elite Boulevard`,
          addressLine2: j === 0 ? 'Residency Area' : 'Work District',
          city: cities[Math.floor(Math.random() * cities.length)],
          state: 'Karnataka',
          pincode: '560001',
          type: j === 0 ? 'home' : 'work',
          isDefault: j === 0
        });
      }
    }
    const createdAddresses = await Address.bulkCreate(addresses);
    console.log('✓ Logistical Network Established');

    // ─── 3. COLLECTIONS (THE FOUR PILLARS) ────────────
    const categories = [
      { name: 'Minimalist Noir', description: 'The core aesthetic. Stripped back luxury.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800' },
      { name: 'Avant-Garde Edge', description: 'Architectural silhouettes and bold statements.', image: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800' },
      { name: 'Midnight Selection', description: 'Premium evening essentials for the modern elite.', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800' },
      { name: 'Urban Elite', description: 'Street-ready staples with a boutique finish.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800' }
    ];
    const createdCats = await Category.bulkCreate(categories);
    console.log('✓ Boutique Collections Defined');

    // ─── 4. PRODUCT INVENTORY (44 PIECES) ──────────
    const productNames = [
      'Heavyweight Tee', 'Linear Trousers', 'Monolith Overshirt', 'Essential Tank', 'Noir Denim', 
      'Vault Cardigan', 'Structure Hoodie', 'Architectural Jacket', 'Asymmetric Vest', 'Volume Cargo',
      'Midnight Blazer', 'Evening Silk Shirt', 'Velvet Bomber', 'Elite Joggers', 'Technical Parka'
    ];

    const categoryImages = [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
      'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800'
    ];

    const createdProducts = [];
    const sizes = ['S', 'M', 'L', 'XL'];

    for (let i = 0; i < 44; i++) {
      const catIdx = i % 4;
      const baseName = productNames[i % productNames.length];
      const basePrice = (Math.floor(Math.random() * 50) * 100) + 1499;

      const prod = await Product.create({
        name: `${baseName} ${String.fromCharCode(65 + Math.floor(i/15))}${i}`,
        brand: 'SouthZone',
        description: `Experience the peak of boutique craftsmanship. The ${baseName} represents our commitment to minimalist authority and structural perfection.`,
        categoryId: createdCats[catIdx].id,
        rating: 0,
        numReviews: 0,
        isFeatured: i < 8,
        isTrending: i % 5 === 0
      });

      // Variants
      for (const s of sizes) {
        await ProductVariant.create({
          productId: prod.id,
          size: s,
          color: 'Black',
          price: basePrice,
          stock: Math.floor(Math.random() * 50) + 5
        });
      }

      // Image
      await ProductImage.create({
        productId: prod.id,
        url: categoryImages[catIdx],
        isPrimary: true
      });

      createdProducts.push(prod);
    }
    console.log('✓ 44 High-Fidelity Products Synchronized');

    // ─── 5. COUPON LEDGER ────────────────────────────
    const welcomeCoupon = await Coupon.create({
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 2000,
      isActive: true,
      usageLimitPerUser: 1,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2027-12-31')
    });
    
    const seasonCoupon = await Coupon.create({
      code: 'ELITE500',
      discountType: 'fixed',
      discountValue: 500,
      minOrderValue: 5000,
      isActive: true,
      usageLimitPerUser: 1,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2027-12-31')
    });

    // ─── 6. THE TIMELINE (500 ORDERS) ────────────────
    console.log('--- ⏳ SYNCHRONIZING 3 YEARS OF TRANSACTIONS ---');
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'delivered', 'delivered', 'delivered']; // Weighted for Delivered
    
    for (let i = 0; i < 500; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const userAddr = createdAddresses.filter(a => a.userId === user.id);
      const addr = userAddr[Math.floor(Math.random() * userAddr.length)];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 1000); // Spread across ~3 years
      const date = new Date(new Date().setDate(new Date().getDate() - daysAgo));
      
      // Random product/variant
      const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const variants = await ProductVariant.findAll({ where: { productId: prod.id } });
      const variant = variants[Math.floor(Math.random() * variants.length)];

      const amount = variant.price;
      const isRefunded = status === 'cancelled' && Math.random() > 0.5;

      const order = await Order.create({
        orderNumber: `SZ-LEG-${10000 + i}`,
        userId: user.id,
        totalAmount: amount,
        finalAmount: amount,
        status: isRefunded ? 'cancelled' : status,
        paymentStatus: isRefunded ? 'refunded' : (status === 'cancelled' ? 'failed' : 'completed'),
        paymentMethod: 'razorpay',
        paymentId: `pay_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: date,
        updatedAt: date,
        shippingAddressSnapshot: addr.toJSON(),
        billingAddressSnapshot: addr.toJSON(),
        phone: user.phone,
        email: user.email,
        shippingAddressId: addr.id,
        billingAddressId: addr.id
      });

      await OrderItem.create({
        orderId: order.id,
        variantId: variant.id,
        quantity: 1,
        priceAtPurchase: amount,
        productSnapshot: { name: prod.name, brand: prod.brand, size: variant.size, color: variant.color }
      });

      // Simulated Coupon Usage (20% of orders)
      if (Math.random() > 0.8) {
        await CouponUsage.create({
          couponId: welcomeCoupon.id,
          userId: user.id,
          orderId: order.id,
          discountApplied: amount * 0.2
        });
      }

      // Seed Reviews for Delivered Orders (50% chance)
      if (status === 'delivered' && Math.random() > 0.5) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars mostly
        await Review.create({
          userId: user.id,
          productId: prod.id,
          rating: rating,
          comment: `Absolutely loved this piece. The quality is elite.`,
          createdAt: date
        });
      }
    }
    console.log('✓ Timeline Synchronized (500+ Orders Created)');

    // ─── 7. ANALYTICS SYNC ───────────────────────────
    console.log('--- 📊 CALCULATING BOUTIQUE PERFORMANCE ---');
    for (const prod of createdProducts) {
      const reviews = await Review.findAll({ where: { productId: prod.id } });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await prod.update({ 
          rating: avgRating.toFixed(1), 
          numReviews: reviews.length 
        });
      }
    }

    console.log('--- 🏁 SEEDING COMPLETE: LEGACY VERSION ---');
    console.log('Admin: admin@southzone.com / admin123');
    console.log('Test User: customer1@gmail.com / user123');
    process.exit(0);

  } catch (error) {
    console.error('Simulation Seeding Failed:', error);
    process.exit(1);
  }
};

seed();
