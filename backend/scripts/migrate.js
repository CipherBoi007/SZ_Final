require('dotenv').config();
const sequelize = require('../src/config/database');
require('../src/models/index'); // Loads all models and their associations

const runMigration = async () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const isProduction = NODE_ENV === 'production';

  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    if (isProduction) {
      console.error('');
      console.error('⛔ DANGER: sequelize.sync({ alter: true }) is NOT safe for production.');
      console.error('   It can DROP COLUMNS, lose data, and cause schema locks.');
      console.error('   Use a proper migration tool (sequelize-cli) for production schema changes.');
      console.error('');
      console.error('   If you MUST proceed, set FORCE_MIGRATE=true:');
      console.error('   FORCE_MIGRATE=true node scripts/migrate.js');
      console.error('');

      if (process.env.FORCE_MIGRATE !== 'true') {
        process.exit(1);
      }

      console.warn('⚠️  FORCE_MIGRATE=true detected. Proceeding with caution...');
    }

    console.log('Starting database schema sync...');
    await sequelize.sync({ alter: true });
    console.log('Database schema synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();