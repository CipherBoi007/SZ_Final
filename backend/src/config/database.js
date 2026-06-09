const { Sequelize } = require('sequelize');
const config = require('./env');

const dialectOptions = {};

// H2: SSL is required for cloud-hosted PostgreSQL (RDS, Supabase, Neon, etc.)
if (config.DB.SSL) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(config.DB.NAME, config.DB.USER, config.DB.PASSWORD, {
  host: config.DB.HOST,
  port: config.DB.PORT,
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  dialectOptions,
  pool: {
    max: config.DB.POOL_MAX,     // M5: Configurable via DB_POOL_MAX env var (default: 5)
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 3,                       // Retry connection up to 3 times
  },
});

module.exports = sequelize;