const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');
const generateCustomId = require('../src/utils/idGenerator');
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

const productsData = [
  // Pants (10 products)
  {
    name: 'Classic Slim-Fit Chinos',
    description: 'Versatile stretch twill chinos with a refined slim-straight silhouette, perfect for any smart-casual occasion.',
    price: 899,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Urban Cargo Trousers',
    description: 'Durable cotton cargo pants with multiple utility pockets, reinforced seams, and tapered drawstring ankles.',
    price: 1099,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Relaxed Linen Pants',
    description: 'Lightweight, highly breathable linen-blend trousers with an elastic waistband and drawstring for ultimate comfort.',
    price: 799,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Classic Pleated Dress Pants',
    description: 'Tailored formal trousers with a sharp front crease, structured waist, and soft, wrinkle-resistant finish.',
    price: 1299,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Distressed Slim Denim Jeans',
    description: 'Washed indigo denim slim-fit jeans featuring subtle distressed details and premium stretch comfort.',
    price: 999,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Heavyweight Fleece Joggers',
    description: 'Cozy, thick loopback cotton track pants with a comfortable drawstring waist and deep side-zippered pockets.',
    price: 699,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Tailored Corduroy Trousers',
    description: 'Soft, vintage-inspired textured corduroy pants in a rich hue, tailored for comfortable and stylish everyday wear.',
    price: 950,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Structured Crop Trousers',
    description: 'Modern cropped-fit trousers featuring a clean front panel, side pockets, and hidden slide-lock closure.',
    price: 850,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Athletic Fit Utility Joggers',
    description: 'Sleek moisture-wicking joggers with zippered cuffs, dynamic paneling, and secure phone pockets.',
    price: 599,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1483726234730-29b5314a04d1?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Sateen Luxury Dress Pants',
    description: 'Exquisite cotton sateen formal trousers with a subtle sheen, customized waistband, and tailored slim-fit design.',
    price: 1199,
    categoryName: 'Pants',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },

  // Shirts (10 products)
  {
    name: 'Oxford Button-Down Shirt',
    description: 'Classic heavyweight organic cotton oxford shirt featuring a structured button-down collar and single chest pocket.',
    price: 699,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Premium Silk-Blend Shirt',
    description: 'Luxurious, flowing silk-blend button-down shirt with a standard collar and an exceptionally soft, premium finish.',
    price: 999,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Linen Summer Button-Up',
    description: 'Lightweight and highly breathable pure linen casual shirt with a relaxed silhouette and classic chest pocket.',
    price: 599,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Diagonal Asymmetric Dress Shirt',
    description: 'Avant-garde design shirt featuring a unique diagonal collar extension and concealed front placket.',
    price: 799,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Denim Utility Overshirt',
    description: 'Washed indigo denim shirt jacket with dual button-flap chest pockets and durable double-needle stitching.',
    price: 899,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1516257984877-283b9c81a549?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Flannel Plaid Casual Shirt',
    description: 'Soft brushed cotton flannel shirt in a warm, timeless plaid pattern, ideal for layering during cooler weather.',
    price: 650,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Sleek Evening Polo Shirt',
    description: 'High-thread count mercerized knit polo shirt, designed for a sharp look on smart-casual evenings.',
    price: 499,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Mandarin Collar Casual Shirt',
    description: 'Minimalist band collar shirt in soft slub cotton, perfect for clean layering or wearing solo.',
    price: 549,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Striped Resort Cuban Shirt',
    description: 'Relaxed-fit cuban collar shirt featuring vintage vertical stripe patterns, ideal for warm weekend getaways.',
    price: 499,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Modern Twill Work Shirt',
    description: 'Heavyweight cotton twill utility shirt designed for rugged everyday styling and long-lasting wear.',
    price: 749,
    categoryName: 'Shirts',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },

  // T-Shirts (10 products)
  {
    name: 'Noir Organic Cotton Tee',
    description: 'Ultra-soft premium organic cotton t-shirt with a clean, classic crewneck fit and reinforced collar.',
    price: 299,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Oversized Streetwear Graphic Tee',
    description: 'Drop shoulder, heavy knit streetwear tee featuring a custom abstract graphic print on the back.',
    price: 399,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Splatter Print Mercerized Tee',
    description: 'Artistic abstract splatter graphic tee made from high-shine, silky-soft mercerized cotton.',
    price: 349,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Minimalist Linen-Blend Tee',
    description: 'Breathable linen-blend t-shirt with a beautiful subtle texture, drop tail, and split side seams.',
    price: 329,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Asymmetric Longline Tee',
    description: 'Avant-garde streetwear t-shirt featuring a unique raw-cut angled bottom hem and relaxed drape.',
    price: 349,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Heavyweight Boxy White Tee',
    description: 'Classic thick loopback organic cotton crewneck tee in a structured, boxy silhouette.',
    price: 299,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Heather Grey Performance Tee',
    description: 'Flexible, ultra-light tri-blend athletic tee optimized for daily comfort and dynamic range of motion.',
    price: 249,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Earth-Tone Relaxed Fit Tee',
    description: 'Soft pigment-dyed cotton tee with a washed vintage appearance, chest pocket, and relaxed fit.',
    price: 279,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Raw Edge Slub Cotton Tee',
    description: 'Textured slub cotton t-shirt featuring raw, rolled-edge details on the crewneck and sleeve cuffs.',
    price: 299,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Classic Striped Crewneck Tee',
    description: 'Yarn-dyed cotton striped tee with standard fit and super-soft handfeel, a true wardrobe staple.',
    price: 349,
    categoryName: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },

  // Gym Wear (10 products)
  {
    name: 'Compression Training Tee',
    description: 'Moisture-wicking, highly supportive fit training top with flatlock anti-chafe stitching.',
    price: 449,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Aero-Knit Runner Shorts',
    description: 'Double-layer active sports shorts featuring an internal compression liner and quick-dry outer shell.',
    price: 499,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Active Dry-Fit Tank Top',
    description: 'High breathability lightweight training tank with dropped armholes for unrestricted movement.',
    price: 349,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Fleece Sports Hoodie',
    description: 'Warm, moisture-managing technical fleece pullover with ergonomic raglan sleeves and hood.',
    price: 899,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Tech Fleece Training Joggers',
    description: 'Sleek tapered fit tech fleece track pants with zippered utility pockets and elastic waist.',
    price: 799,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Elite Performance Track Jacket',
    description: 'Full-zip athletic track jacket with a high mock neck, side pockets, and breathable mesh inserts.',
    price: 999,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1483726234730-29b5314a04d1?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Thermal Workout Leggings',
    description: 'High-stretch compression leggings designed to retain heat and support muscles during training.',
    price: 599,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Ventilated Mesh Gym Shorts',
    description: 'Classic loose-fit mesh athletic shorts with side ventilation slits and adjustable drawcord.',
    price: 399,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Windproof Hooded Running Jacket',
    description: 'Ultra-light windproof running shell with reflective safety details and secure zip pockets.',
    price: 1199,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Ultra-Soft Recovery Joggers',
    description: 'Super-soft modal fleece pants designed for rest, recovery, and warm-down stretches.',
    price: 699,
    categoryName: 'Gym Wear',
    image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=800',
    isFeatured: false,
    isTrending: false
  }
];

const seedDatabase = async () => {
  try {
    console.log('--- 🚀 STARTING SOUTHZONE PRODUCTION MIGRATION & SEEDING ---');

    // 1. Fetch and backup existing users to prevent credential loss
    let existingUsers = [];
    try {
      existingUsers = await User.findAll();
      console.log(`✓ Backed up ${existingUsers.length} existing user profiles from the database.`);
    } catch (err) {
      console.log('No existing users to backup or table does not exist.');
    }

    // 2. Sync database schema (force: true drops existing tables to migrate UUIDs to STRING(15) IDs)
    await sequelize.sync({ force: true });
    console.log('✓ Database schema reset and synced successfully.');

    // 3. Restore/Create Users with custom USR format
    const userIdMap = {};
    const usersToCreate = [];

    existingUsers.forEach(u => {
      const originalId = u.id;
      // Preserve original custom ID or generate a new one matching the USR pattern
      const newId = (originalId.startsWith('USR') && originalId.length === 15) ? originalId : generateCustomId('USR');
      userIdMap[originalId] = newId;

      usersToCreate.push({
        id: newId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: u.password, // Hook will bypass double hashing as it begins with $2
        googleId: u.googleId,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      });
    });

    if (usersToCreate.length > 0) {
      await User.bulkCreate(usersToCreate);
      console.log(`✓ Restored ${usersToCreate.length} existing user accounts without credentials loss.`);
    } else {
      // Seed default accounts if database was empty
      const adminUser = await User.create({
        name: 'SouthZone Executive',
        email: 'admin@southzone.com',
        password: 'admin123',
        role: 'admin',
        phone: '9999999999'
      });
      console.log('✓ Created Admin Account: admin@southzone.com / admin123');

      const customers = [];
      for (let i = 1; i <= 20; i++) {
        customers.push({
          id: generateCustomId('USR'),
          name: `Customer ${i}`,
          email: `customer${i}@gmail.com`,
          password: 'user123',
          role: 'user',
          phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`
        });
      }
      await User.bulkCreate(customers);
      console.log('✓ Seeded 20 default customer accounts (password: user123)');
    }

    const allUsers = await User.findAll();

    // 4. Seed Logistical Addresses
    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];
    const addresses = [];
    for (const u of allUsers) {
      const numAddr = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numAddr; j++) {
        addresses.push({
          userId: u.id,
          name: u.name,
          phone: u.phone || '9999999999',
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
    console.log(`✓ Logistical Network Established (${createdAddresses.length} addresses).`);

    // 5. Seed Boutique Categories (The 4 Pillars)
        const categorySeeds = [
      { name: 'Pants', description: 'Tailored trousers, premium chinos, relaxed joggers, and durable utility pants.', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800' },
      { name: 'Shirts', description: 'Oxford button-downs, premium linen shirts, and sleek evening attire.', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800' },
      { name: 'T-Shirts', description: 'Organic cotton crewnecks, oversized streetwear tees, and modern knits.', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800' },
      { name: 'Gym Wear', description: 'Moisture-wicking compression tees, running shorts, and technical training joggers.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' }
    ];
    const createdCats = await Category.bulkCreate(categorySeeds);
    console.log('✓ Boutique Collections Defined');

    // 6. Seed Product Inventory & Product Images (44 pieces, prices between 299 and 1299)
    const createdProducts = [];
    const createdVariants = [];
    const productImages = [];
    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['Black', 'Navy', 'White'];

    for (let i = 0; i < productsData.length; i++) {
      const p = productsData[i];
      const cat = createdCats.find(c => c.name === p.categoryName);

      const prod = await Product.create({
        name: p.name,
        brand: 'SouthZone',
        description: p.description,
        material: 'Premium Cotton Blend',
        categoryId: cat.id,
        rating: 0,
        numReviews: 0,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending
      });

      createdProducts.push(prod);

      // Create primary image
      productImages.push({
        url: p.image,
        isPrimary: true,
        order: 0,
        productId: prod.id
      });

      // Create variants
      for (const size of sizes) {
        for (const color of colors) {
          const variant = await ProductVariant.create({
            productId: prod.id,
            size,
            color,
            price: p.price,
            stock: Math.floor(Math.random() * 50) + 15,
            sku: `SZ-${prod.name.substring(0, 3).toUpperCase()}-${size}-${color}-${i}`
          });
          createdVariants.push(variant);
        }
      }
    }

    await ProductImage.bulkCreate(productImages);
    console.log(`✓ 40 Real, Trending products seeded with unique images and prices (249-1299).`);

    // 7. Seed Coupons
    const welcomeCoupon = await Coupon.create({
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 500,
      isActive: true,
      usageLimitPerUser: 1,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2027-12-31')
    });
    
    const seasonCoupon = await Coupon.create({
      code: 'ELITE100',
      discountType: 'fixed',
      discountValue: 100,
      minOrderValue: 800,
      isActive: true,
      usageLimitPerUser: 1,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2027-12-31')
    });
    console.log('✓ Coupon Ledgers Configured.');

    // 8. Seed Promotions (Active Campaign Banners)
    await Promotion.bulkCreate([
      { 
        title: 'Premium Pants Collection', 
        subtitle: 'Tailored for ultimate comfort and fit', 
        bannerImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200', 
        targetLink: '/shop?category=' + createdCats[0].id,
        priority: 2,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000)
      },
      { 
        title: 'Elite Gym Wear Collection', 
        subtitle: 'High performance training apparel', 
        bannerImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200', 
        targetLink: '/shop?category=' + createdCats[3].id,
        priority: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000)
      }
    ]);
    console.log('✓ Campaign Promotions Seeded.');

    // 9. Seed Carts
    const carts = [];
    const customerUsers = allUsers.filter(u => u.role === 'user');
    for (let i = 0; i < Math.min(10, customerUsers.length); i++) {
      carts.push({
        quantity: 1,
        userId: customerUsers[i].id,
        variantId: createdVariants[Math.floor(Math.random() * createdVariants.length)].id,
      });
    }
    await Cart.bulkCreate(carts);
    console.log('✓ Carts seeded.');

    // 10. Seed Orders & OrderItems (500 orders over 3 years)
    console.log('--- ⏳ SYNCHRONIZING 3 YEARS OF TRANSACTIONS (500+ ORDERS) ---');
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'delivered', 'delivered', 'delivered'];
    
    for (let i = 0; i < 500; i++) {
      const user = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const userAddresses = createdAddresses.filter(a => a.userId === user.id);
      const addr = userAddresses[Math.floor(Math.random() * userAddresses.length)];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 1000); // 3-year spread
      const date = new Date(new Date().setDate(new Date().getDate() - daysAgo));
      
      const variant = createdVariants[Math.floor(Math.random() * createdVariants.length)];
      const product = createdProducts.find(p => p.id === variant.productId);

      const amount = Number(variant.price);
      const isRefunded = status === 'cancelled' && Math.random() > 0.5;

      const order = await Order.create({
        orderNumber: `ORD-${100000000000 + i}`,
        userId: user.id,
        totalAmount: amount,
        finalAmount: amount,
        status: isRefunded ? 'cancelled' : status,
        paymentStatus: isRefunded ? 'refunded' : (status === 'cancelled' ? 'failed' : 'completed'),
        paymentMethod: 'razorpay',
        paymentId: generateCustomId('TXN'), // Correct Custom TXN ID format
        createdAt: date,
        updatedAt: date,
        shippingAddressSnapshot: addr.toJSON(),
        billingAddressSnapshot: addr.toJSON(),
        phone: user.phone || '9999999999',
        email: user.email,
        shippingAddressId: addr.id,
        billingAddressId: addr.id
      });

      await OrderItem.create({
        orderId: order.id,
        variantId: variant.id,
        quantity: 1,
        priceAtPurchase: amount,
        productSnapshot: { 
          name: product.name, 
          brand: product.brand, 
          size: variant.size, 
          color: variant.color,
          sku: variant.sku 
        },
        createdAt: date,
        updatedAt: date
      });

      // Simulate coupon usage occasionally
      if (Math.random() > 0.85) {
        await CouponUsage.create({
          couponId: welcomeCoupon.id,
          userId: user.id,
          orderId: order.id,
          discountApplied: amount * 0.2,
          createdAt: date,
          updatedAt: date
        });
      }

      // Seed Reviews for Delivered orders (30% chance)
      if (status === 'delivered' && Math.random() > 0.7) {
        const rating = Math.floor(Math.random() * 2) + 4; // Mostly 4-5 stars
        await Review.create({
          userId: user.id,
          productId: product.id,
          rating: rating,
          comment: `Elite fit and comfort. Extremely fast delivery.`,
          createdAt: date,
          updatedAt: date
        });
      }
    }
    console.log('✓ Timeline Synchronized (500+ Orders & Transactions Created).');

    // 11. Sync Product Review aggregates
    console.log('--- 📊 CALCULATING PERFORMANCE STATISTICS ---');
    for (const prod of createdProducts) {
      const reviews = await Review.findAll({ where: { productId: prod.id } });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await prod.update({ 
          rating: avgRating.toFixed(1), 
          numReviews: reviews.length 
        });
      } else {
        await prod.update({
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          numReviews: Math.floor(Math.random() * 150) + 20
        });
      }
    }

    // 12. Flush Redis cache to prevent stale data
    try {
      const cacheService = require('../src/services/cacheService');
      await cacheService.flush();
      console.log('✓ Successfully flushed Redis cache.');
    } catch (cacheErr) {
      console.log('Skipped cache flush or Redis not available.');
    }

    console.log('--- 🏁 SOUTHZONE PRODUCTION SEEDING COMPLETED SUCCESSFUL ---');
    console.log('Admin login: admin@southzone.com / admin123');
    console.log('Customer login: customer1@gmail.com / user123');
  } catch (error) {
    console.error('Fatal Seeding Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedDatabase();