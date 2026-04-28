/**
 * SZ Database Seeder
 * ─────────────────────
 * Run:  node src/seed.js
 * 
 * Creates realistic test data:
 *   • 2 users (1 admin + 1 customer)
 *   • 5 categories
 *   • 12 products with 2-4 variants each
 *   • Product images (picsum.photos)
 *   • 2 addresses for the customer
 *   • 3 coupons
 *   • 2 orders with items
 *   • 2 reviews
 */

const sequelize = require('./config/database');
const {
  User, Product, Category, ProductImage,
  ProductVariant, Address, Coupon, Order,
  OrderItem, Review, Cart, Wishlist,
} = require('./models');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Sync all tables (force = drop+recreate)
  await sequelize.sync({ force: true });
  console.log('✅ Tables recreated\n');

  // ─── Users ──────────────────────────────────────
  // Pass plain text — the User model's beforeCreate hook handles bcrypt hashing
  const admin = await User.create({
    name: 'Admin SZ',
    email: 'admin@southzone.in',
    phone: '9876543210',
    password: 'Test@1234',
    role: 'admin',
    isActive: true,
  });

  const customer = await User.create({
    name: 'Yogesh V',
    email: 'yogesh@test.com',
    phone: '9876543211',
    password: 'Test@1234',
    role: 'user',
    isActive: true,
  });

  console.log('✅ Users created');
  console.log(`   Admin:    admin@southzone.in / Test@1234`);
  console.log(`   Customer: yogesh@test.com    / Test@1234\n`);

  // ─── Categories ─────────────────────────────────
  const categories = await Category.bulkCreate([
    { name: 'Hoodies', description: 'Premium streetwear hoodies for all seasons', isActive: true },
    { name: 'T-Shirts', description: 'Graphic and plain tees with bold designs', isActive: true },
    { name: 'Pants', description: 'Joggers, cargo pants, and chinos', isActive: true },
    { name: 'Shirts', description: 'Casual and formal shirts', isActive: true },
    { name: 'Accessories', description: 'Caps, bags, and more', isActive: true },
  ]);
  console.log(`✅ ${categories.length} Categories created\n`);

  // ─── Products + Variants + Images ───────────────
  const productData = [
    // ── Hoodies ──
    {
      name: 'Shadow Oversized Hoodie',
      brand: 'SouthZone',
      description: 'Ultra-soft heavyweight cotton hoodie with a relaxed oversized fit. Features kangaroo pocket and adjustable drawstring hood. Perfect for layering.',
      material: '100% Premium Cotton Fleece, 380 GSM',
      categoryIdx: 0,
      isFeatured: true,
      isNew: true,
      isTrending: true,
      discount: 0,
      rating: 4.7,
      numReviews: 23,
      variants: [
        { size: 'M', color: 'Black', price: 1499, stock: 30 },
        { size: 'L', color: 'Black', price: 1499, stock: 25 },
        { size: 'XL', color: 'Black', price: 1599, stock: 20 },
        { size: 'M', color: 'Charcoal', price: 1499, stock: 15 },
        { size: 'L', color: 'Charcoal', price: 1499, stock: 18 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      name: 'Crimson Flame Hoodie',
      brand: 'SouthZone',
      description: 'Bold crimson red hoodie with flame-inspired embroidery on the back. Brushed fleece interior for extra warmth.',
      material: 'Cotton Blend, 350 GSM',
      categoryIdx: 0,
      isFeatured: true,
      isNew: false,
      isTrending: true,
      discount: 15,
      rating: 4.5,
      numReviews: 18,
      variants: [
        { size: 'S', color: 'Red', price: 1799, stock: 12 },
        { size: 'M', color: 'Red', price: 1799, stock: 20 },
        { size: 'L', color: 'Red', price: 1799, stock: 15 },
        { size: 'XL', color: 'Red', price: 1899, stock: 10 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      name: 'Midnight Zip-Up Hoodie',
      brand: 'SouthZone',
      description: 'Full zip hoodie in midnight navy with reflective SZ logo on the chest. Two side pockets and ribbed cuffs.',
      material: 'French Terry, 320 GSM',
      categoryIdx: 0,
      isFeatured: false,
      isNew: true,
      isTrending: false,
      discount: 0,
      rating: 4.3,
      numReviews: 9,
      variants: [
        { size: 'M', color: 'Navy', price: 1699, stock: 22 },
        { size: 'L', color: 'Navy', price: 1699, stock: 18 },
        { size: 'XL', color: 'Navy', price: 1699, stock: 14 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },

    // ── T-Shirts ──
    {
      name: 'Classic Logo Tee',
      brand: 'SouthZone',
      description: 'Signature SouthZone logo t-shirt with a clean minimal design. Bio-washed for a lived-in softness from day one.',
      material: '100% Organic Cotton, 180 GSM',
      categoryIdx: 1,
      isFeatured: true,
      isNew: false,
      isTrending: true,
      discount: 10,
      rating: 4.8,
      numReviews: 42,
      variants: [
        { size: 'S', color: 'White', price: 699, stock: 50 },
        { size: 'M', color: 'White', price: 699, stock: 60 },
        { size: 'L', color: 'White', price: 699, stock: 45 },
        { size: 'M', color: 'Black', price: 699, stock: 55 },
        { size: 'L', color: 'Black', price: 699, stock: 40 },
        { size: 'XL', color: 'Black', price: 749, stock: 30 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      name: 'Urban Graphic Tee',
      brand: 'SouthZone',
      description: 'Street-art inspired graphic print on premium cotton. Features a unique hand-drawn illustration that represents urban culture.',
      material: 'Ring-Spun Cotton, 200 GSM',
      categoryIdx: 1,
      isFeatured: false,
      isNew: true,
      isTrending: false,
      discount: 0,
      rating: 4.4,
      numReviews: 15,
      variants: [
        { size: 'M', color: 'Grey', price: 899, stock: 25 },
        { size: 'L', color: 'Grey', price: 899, stock: 20 },
        { size: 'XL', color: 'Grey', price: 899, stock: 15 },
        { size: 'M', color: 'Olive', price: 899, stock: 18 },
        { size: 'L', color: 'Olive', price: 899, stock: 12 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      name: 'Acid Wash Drop-Shoulder Tee',
      brand: 'SouthZone',
      description: 'Vintage acid wash finish with a modern drop-shoulder silhouette. Each piece is uniquely washed for a one-of-a-kind look.',
      material: 'Cotton, 220 GSM',
      categoryIdx: 1,
      isFeatured: true,
      isNew: true,
      isTrending: true,
      discount: 20,
      rating: 4.6,
      numReviews: 31,
      variants: [
        { size: 'S', color: 'Washed Black', price: 999, stock: 15 },
        { size: 'M', color: 'Washed Black', price: 999, stock: 25 },
        { size: 'L', color: 'Washed Black', price: 999, stock: 20 },
        { size: 'M', color: 'Washed Blue', price: 999, stock: 18 },
        { size: 'L', color: 'Washed Blue', price: 999, stock: 14 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },

    // ── Pants ──
    {
      name: 'SZ Cargo Joggers',
      brand: 'SouthZone',
      description: 'Utility-inspired cargo joggers with six functional pockets. Elasticated waist with drawstring and tapered ankle cuffs.',
      material: 'Cotton Twill, 280 GSM',
      categoryIdx: 2,
      isFeatured: true,
      isNew: false,
      isTrending: true,
      discount: 0,
      rating: 4.5,
      numReviews: 27,
      variants: [
        { size: 'M', color: 'Khaki', price: 1299, stock: 20 },
        { size: 'L', color: 'Khaki', price: 1299, stock: 25 },
        { size: 'XL', color: 'Khaki', price: 1399, stock: 15 },
        { size: 'M', color: 'Black', price: 1299, stock: 22 },
        { size: 'L', color: 'Black', price: 1299, stock: 18 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      name: 'Tech Fleece Track Pants',
      brand: 'SouthZone',
      description: 'Engineered fleece trackpants with zippered pockets and a slim-tapered fit. Designed for both gym sessions and casual outings.',
      material: 'Tech Fleece Blend, 300 GSM',
      categoryIdx: 2,
      isFeatured: false,
      isNew: true,
      isTrending: false,
      discount: 10,
      rating: 4.2,
      numReviews: 11,
      variants: [
        { size: 'M', color: 'Charcoal', price: 1599, stock: 15 },
        { size: 'L', color: 'Charcoal', price: 1599, stock: 12 },
        { size: 'XL', color: 'Charcoal', price: 1599, stock: 10 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },

    // ── Shirts ──
    {
      name: 'Linen Summer Shirt',
      brand: 'SouthZone',
      description: 'Lightweight pure linen shirt with a relaxed fit. Perfect for the Indian summer. Features mother-of-pearl buttons.',
      material: '100% Pure Linen',
      categoryIdx: 3,
      isFeatured: true,
      isNew: true,
      isTrending: false,
      discount: 0,
      rating: 4.6,
      numReviews: 19,
      variants: [
        { size: 'M', color: 'White', price: 1199, stock: 20 },
        { size: 'L', color: 'White', price: 1199, stock: 18 },
        { size: 'M', color: 'Sky Blue', price: 1199, stock: 16 },
        { size: 'L', color: 'Sky Blue', price: 1199, stock: 14 },
        { size: 'XL', color: 'Sky Blue', price: 1299, stock: 10 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      name: 'Mandarin Collar Kurta Shirt',
      brand: 'SouthZone',
      description: 'Modern take on the classic Indian kurta with a mandarin collar. Short-length for a casual yet refined look.',
      material: 'Cotton Silk Blend',
      categoryIdx: 3,
      isFeatured: false,
      isNew: false,
      isTrending: true,
      discount: 25,
      rating: 4.4,
      numReviews: 14,
      variants: [
        { size: 'M', color: 'Beige', price: 1399, stock: 12 },
        { size: 'L', color: 'Beige', price: 1399, stock: 10 },
        { size: 'M', color: 'Maroon', price: 1399, stock: 14 },
        { size: 'L', color: 'Maroon', price: 1399, stock: 11 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },

    // ── Accessories ──
    {
      name: 'SZ Snapback Cap',
      brand: 'SouthZone',
      description: 'Structured snapback cap with embroidered SZ logo on the front. Adjustable snap closure fits most head sizes.',
      material: 'Cotton Twill',
      categoryIdx: 4,
      isFeatured: false,
      isNew: true,
      isTrending: true,
      discount: 0,
      rating: 4.3,
      numReviews: 8,
      variants: [
        { size: 'M', color: 'Black', price: 599, stock: 40 },
        { size: 'M', color: 'White', price: 599, stock: 35 },
        { size: 'M', color: 'Red', price: 599, stock: 25 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
    {
      name: 'Canvas Tote Bag',
      brand: 'SouthZone',
      description: 'Heavy-duty canvas tote bag with SZ branding. Internal zip pocket and reinforced handles. Great for daily carry.',
      material: '12oz Canvas Cotton',
      categoryIdx: 4,
      isFeatured: false,
      isNew: false,
      isTrending: false,
      discount: 5,
      rating: 4.1,
      numReviews: 6,
      variants: [
        { size: 'M', color: 'Natural', price: 499, stock: 30 },
        { size: 'M', color: 'Black', price: 499, stock: 25 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
  ];

  const createdProducts = [];

  for (const p of productData) {
    const product = await Product.create({
      name: p.name,
      brand: p.brand,
      description: p.description,
      material: p.material,
      categoryId: categories[p.categoryIdx].id,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isTrending: p.isTrending,
      discount: p.discount,
      rating: p.rating,
      numReviews: p.numReviews,
    });

    // Create variants
    const variants = [];
    for (const v of p.variants) {
      const variant = await ProductVariant.create({
        productId: product.id,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
        sku: `SZ-${product.name.replace(/\s+/g, '').slice(0, 4).toUpperCase()}-${v.size}-${v.color.replace(/\s/g, '').toUpperCase().slice(0, 5)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      });
      variants.push(variant);
    }

    // Create images
    for (const img of p.images) {
      await ProductImage.create({
        productId: product.id,
        url: img.url,
        isPrimary: img.isPrimary,
      });
    }

    createdProducts.push({ product, variants });
  }

  console.log(`✅ ${createdProducts.length} Products created (with variants & images)\n`);

  // ─── Addresses ──────────────────────────────────
  const addr1 = await Address.create({
    userId: customer.id,
    type: 'home',
    name: 'Yogesh V',
    phone: '9876543211',
    addressLine1: '42, MG Road, Anna Nagar',
    addressLine2: 'Near City Mall',
    landmark: 'Opposite SBI Bank',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    country: 'India',
    isDefault: true,
  });

  await Address.create({
    userId: customer.id,
    type: 'work',
    name: 'Yogesh V',
    phone: '9876543211',
    addressLine1: '15, Tech Park, OMR Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600096',
    country: 'India',
    isDefault: false,
  });

  console.log('✅ 2 Addresses created for customer\n');

  // ─── Coupons ────────────────────────────────────
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await Coupon.bulkCreate([
    {
      code: 'WELCOME20',
      description: 'Get 20% off on your first order!',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 999,
      maxDiscount: 500,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 100,
      isPublic: true,
      isActive: true,
    },
    {
      code: 'FLAT200',
      description: 'Flat ₹200 off on orders above ₹1499',
      discountType: 'fixed',
      discountValue: 200,
      minOrderValue: 1499,
      maxDiscount: 200,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 50,
      isPublic: true,
      isActive: true,
    },
    {
      code: 'FLASH10',
      description: 'Limited time! 10% off everything',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: 300,
      startDate: now,
      endDate: nextWeek,
      usageLimit: 200,
      isPublic: true,
      isActive: true,
    },
  ]);

  console.log('✅ 3 Coupons created (WELCOME20, FLAT200, FLASH10)\n');

  // ─── Orders ─────────────────────────────────────
  const variant1 = createdProducts[0].variants[0]; // Shadow Hoodie M Black
  const variant2 = createdProducts[3].variants[1]; // Classic Logo Tee M White
  const variant3 = createdProducts[6].variants[0]; // Cargo Joggers M Khaki

  const addrSnapshot = {
    name: 'Yogesh V',
    phone: '9876543211',
    addressLine1: '42, MG Road, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    country: 'India',
  };

  const order1 = await Order.create({
    userId: customer.id,
    orderNumber: 'SZ-10001',
    status: 'delivered',
    totalAmount: 2198,
    discountAmount: 0,
    finalAmount: 2198,
    paymentMethod: 'cod',
    paymentStatus: 'completed',
    shippingAddressId: addr1.id,
    shippingAddressSnapshot: addrSnapshot,
    billingAddressSnapshot: addrSnapshot,
    phone: '9876543211',
    email: 'yogesh@test.com',
    estimatedDelivery: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  });

  await OrderItem.create({
    orderId: order1.id,
    variantId: variant1.id,
    quantity: 1,
    priceAtPurchase: 1499,
    productSnapshot: {
      name: 'Shadow Oversized Hoodie',
      size: 'M',
      color: 'Black',
      brand: 'SouthZone',
    },
  });

  await OrderItem.create({
    orderId: order1.id,
    variantId: variant2.id,
    quantity: 1,
    priceAtPurchase: 699,
    productSnapshot: {
      name: 'Classic Logo Tee',
      size: 'M',
      color: 'White',
      brand: 'SouthZone',
    },
  });

  const order2 = await Order.create({
    userId: customer.id,
    orderNumber: 'SZ-10002',
    status: 'shipped',
    totalAmount: 1299,
    discountAmount: 0,
    finalAmount: 1299,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingAddressId: addr1.id,
    shippingAddressSnapshot: addrSnapshot,
    billingAddressSnapshot: addrSnapshot,
    phone: '9876543211',
    email: 'yogesh@test.com',
    trackingNumber: 'SZTRK2026042601',
    carrier: 'Delhivery',
    estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
  });

  await OrderItem.create({
    orderId: order2.id,
    variantId: variant3.id,
    quantity: 1,
    priceAtPurchase: 1299,
    productSnapshot: {
      name: 'SZ Cargo Joggers',
      size: 'M',
      color: 'Khaki',
      brand: 'SouthZone',
    },
  });

  console.log('✅ 2 Orders created (1 delivered, 1 shipped)\n');

  // ─── Reviews ────────────────────────────────────
  await Review.create({
    userId: customer.id,
    productId: createdProducts[0].product.id,
    rating: 5,
    title: 'Best hoodie I own!',
    comment: 'The quality is incredible. The fabric is so soft and the fit is perfect. Definitely ordering more colors.',
    isVerifiedPurchase: true,
  });

  await Review.create({
    userId: customer.id,
    productId: createdProducts[3].product.id,
    rating: 4,
    title: 'Great everyday tee',
    comment: 'Nice quality cotton, washes well. The logo print is subtle and clean. Wish they had more color options.',
    isVerifiedPurchase: true,
  });

  console.log('✅ 2 Reviews created\n');

  // ─── Wishlist ───────────────────────────────────
  await Wishlist.create({
    userId: customer.id,
    productId: createdProducts[1].product.id, // Crimson Flame Hoodie
  });

  await Wishlist.create({
    userId: customer.id,
    productId: createdProducts[5].product.id, // Acid Wash Tee
  });

  console.log('✅ 2 Wishlist items created\n');

  // ─── Cart ───────────────────────────────────────
  await Cart.create({
    userId: customer.id,
    variantId: createdProducts[8].variants[0].id, // Linen Shirt M White
    quantity: 1,
  });

  console.log('✅ 1 Cart item created\n');

  // ─── Done ───────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('  📧 Admin Login:');
  console.log('     Email:    admin@southzone.in');
  console.log('     Password: Test@1234');
  console.log('');
  console.log('  📧 Customer Login:');
  console.log('     Email:    yogesh@test.com');
  console.log('     Password: Test@1234');
  console.log('');
  console.log('  🎟️  Coupons: WELCOME20, FLAT200, FLASH10');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await sequelize.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
