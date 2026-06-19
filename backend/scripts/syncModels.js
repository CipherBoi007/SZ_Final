require('dotenv').config();
const sequelize = require('../src/config/database');
const { Lookbook } = require('../src/models');

async function sync() {
  try {
    await Lookbook.sync({ alter: true });
    console.log('Lookbook table synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing:', error);
    process.exit(1);
  }
}
sync();
