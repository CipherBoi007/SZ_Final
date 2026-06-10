const { Category, Product } = require('./src/models');
const sequelize = require('./src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const categories = await Category.findAll({ raw: true });
    console.log('--- CATEGORIES ---');
    console.log(categories.map(c => ({ id: c.id, name: c.name })));

    const products = await Product.findAll({ limit: 5, raw: true });
    console.log('--- PRODUCTS SAMPLE ---');
    console.log(products.map(p => ({ id: p.id, name: p.name, categoryId: p.categoryId })));

    const productCountWithCategory = await Product.count({
      where: {
        categoryId: categories.map(c => c.id)
      }
    });
    console.log(`Products matching category IDs: ${productCountWithCategory}`);

    process.exit(0);
  } catch (err) {
    console.error('Error running debug:', err);
    process.exit(1);
  }
}

run();
