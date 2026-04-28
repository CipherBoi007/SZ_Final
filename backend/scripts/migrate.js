require('dotenv').config();
const sequelize = require('../src/config/database');
require('../src/models/index'); // Loads all models and their associations

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');
    console.log('Starting database schema sync (migration)...');
    
    // Sync all models
    // { alter: true } is used here to update schema while preserving data
    await sequelize.sync({ alter: true });
    
    console.log('Database schema automatically synced (migration complete).');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();