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
  // Minimalist Noir (Category 1)
  {
    name: 'Noir Cotton T-Shirt',
    description: 'Ultra-soft premium cotton t-shirt with a clean, classic fit.',
    price: 299,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Slate Grey Hoodie',
    description: 'Heavyweight organic cotton hoodie with a double-lined hood.',
    price: 699,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Noir Denim Slim Jeans',
    description: 'Classic five-pocket denim jeans with raw finish and slight stretch.',
    price: 999,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Basic Cotton Turtleneck',
    description: 'Form-fitting soft knit turtleneck pullover for layered looks.',
    price: 599,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1615655096345-61a54750068d?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Noir Linen Summer Shirt',
    description: 'Breathable and lightweight linen button-up shirt in deep charcoal.',
    price: 499,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Windproof Monolith Parka',
    description: 'Weather-resistant lightweight parka jacket with functional pockets.',
    price: 1299,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Noir Essential Sweatpants',
    description: 'Tapered fleece joggers with drawstring waist and zip pockets.',
    price: 399,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Tailored Twill Chinos',
    description: 'Premium stretch twill chinos with a modern slim-straight silhouette.',
    price: 799,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Noir Urban Cargo Shorts',
    description: 'Durable cotton cargo shorts with multiple utility pockets.',
    price: 450,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Luxe Heavyweight Crew',
    description: 'Pre-shrunk thick loopback cotton crewneck sweatshirt in ash.',
    price: 899,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Noir Fitted Casual Shorts',
    description: 'Lightweight linen-blend shorts for clean casual lounging.',
    price: 349,
    categoryName: 'Minimalist Noir',
    image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },

  // Avant-Garde Edge (Category 2)
  {
    name: 'Asymmetric Hem Tee',
    description: 'Unique longline tee with an angled raw-cut bottom hem.',
    price: 349,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Structured Grid Hoodie',
    description: 'Techno-fabric hoodie with structured seams and minimalist look.',
    price: 799,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1609873814058-a8928924184a?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Paneled Utility Cargo Pants',
    description: 'Multi-pocket cargo trousers featuring geometric paneling.',
    price: 1099,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Splatter Print Tee',
    description: 'Artistic abstract splatter graphic tee made from mercerized cotton.',
    price: 399,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Draped Knit Cardigan',
    description: 'Collarless open-front long knit cardigan in charcoal blend.',
    price: 899,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Avant Tech Windbreaker',
    description: 'Ultra-light water repellent sports jacket with asymmetric zip.',
    price: 1199,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Angled Collar Dress Shirt',
    description: 'Avant-garde button shirt with a unique diagonal collar extension.',
    price: 599,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Slouchy Dropped-Crotch Joggers',
    description: 'Comfortable knit sweatpants with a distinct relaxed rise.',
    price: 699,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1483726234730-29b5314a04d1?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Wrap Collar Sweatshirt',
    description: 'Double-breasted collar neck jersey pullover in black.',
    price: 850,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Deconstructed Hem Tee',
    description: 'Raw edge crewneck tee with distressed details on shoulders.',
    price: 450,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Panel Denim Utility Jacket',
    description: 'Dark wash raw denim jacket with multi-textured cotton patches.',
    price: 1299,
    categoryName: 'Avant-Garde Edge',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },

  // Midnight Selection (Category 3)
  {
    name: 'Midnight Silk Shirt',
    description: 'Sleek luxury silk-blend button shirt with standard collar.',
    price: 899,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Tuxedo Evening Blazer',
    description: 'Slim fit structured blazer with satin peak lapels.',
    price: 1299,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Midnight Velvet Bomber',
    description: 'Deep navy velvet jacket with premium metallic zippers.',
    price: 1199,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Satin Trim Trousers',
    description: 'Sharp formal trousers with a clean satin stripe along the sides.',
    price: 999,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Midnight Knit Sweater',
    description: 'Soft merino wool crewneck sweater in deep navy blue.',
    price: 799,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Midnight Silk Kurta',
    description: 'Elegant luxury traditional silk kurta for festive evenings.',
    price: 699,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Classic Oxford Dress Shirt',
    description: 'Premium white cotton dress shirt with button-down cuffs.',
    price: 599,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Sleek Fit Evening Polo',
    description: 'High-thread count knit polo shirt in dark navy blue.',
    price: 499,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Textured Evening Vest',
    description: 'Button-up dress vest in charcoal grey herringbone design.',
    price: 399,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Midnight Trench Coat',
    description: 'Double-breasted classic wool-blend trench coat in pure black.',
    price: 1299,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Midnight Silk Bow Tie',
    description: 'Premium satin self-tie formal bow tie in classic black.',
    price: 299,
    categoryName: 'Midnight Selection',
    image: 'https://images.unsplash.com/photo-1516257984877-283b9c81a549?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },

  // Urban Elite (Category 4)
  {
    name: 'Boxy Graphic Streetwear Tee',
    description: 'Thick heavy cotton streetwear graphic tee with retro vibes.',
    price: 399,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800',
    isFeatured: true,
    isTrending: true
  },
  {
    name: 'Streetwear Cargo Joggers',
    description: 'Multi-pocket canvas cargo pants with elasticated hems.',
    price: 999,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Elite Heavy Knit Hoodie',
    description: '450gsm double-cotton hoodie in vintage washed black.',
    price: 899,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Distressed Denim Overshirt',
    description: 'Medium wash denim shirt jacket with light distressing and snap buttons.',
    price: 699,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1516257984877-283b9c81a549?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Urban Flight Bomber Jacket',
    description: 'Water-resistant nylon aviator jacket with sleeve zip pocket.',
    price: 1199,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Retro Block Windbreaker',
    description: 'High-collar sport windbreaker in colorblocked neutral tones.',
    price: 1099,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800',
    isFeatured: true,
    isTrending: false
  },
  {
    name: 'Elite Gym Fleece Joggers',
    description: 'Tapered fit cotton fleece track pants for street and workout.',
    price: 599,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Basic Oversized Tee',
    description: 'Drop shoulder relaxed heavy knit tee in minimalist white.',
    price: 299,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
    isFeatured: false,
    isTrending: true
  },
  {
    name: 'Urban Utility Overshirt',
    description: 'Durable cotton drill jacket with flap pockets on chest.',
    price: 799,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Classic Street Shorts',
    description: 'Woven cotton shorts with an elastic waistband and relaxed fit.',
    price: 499,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800',
    isFeatured: false,
    isTrending: false
  },
  {
    name: 'Urban Puffer Utility Vest',
    description: 'Insulated quilted zip-up vest with water-repellent shell.',
    price: 1299,
    categoryName: 'Urban Elite',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
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
      { name: 'Minimalist Noir', description: 'The core aesthetic. Stripped back luxury.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800' },
      { name: 'Avant-Garde Edge', description: 'Architectural silhouettes and bold statements.', image: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800' },
      { name: 'Midnight Selection', description: 'Premium evening essentials for the modern elite.', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800' },
      { name: 'Urban Elite', description: 'Street-ready staples with a boutique finish.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800' }
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
    console.log(`✓ 44 Real, Trending Dresses seeded with unique images and prices (299-1299).`);

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
        title: 'Minimalist Noir Campaign', 
        subtitle: 'Stripped back luxury essentials', 
        bannerImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200', 
        targetLink: '/shop?category=' + createdCats[0].id,
        priority: 2,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000)
      },
      { 
        title: 'Midnight Collection Elite', 
        subtitle: 'Sharp silhouettes for evening attire', 
        bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200', 
        targetLink: '/shop?category=' + createdCats[2].id,
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