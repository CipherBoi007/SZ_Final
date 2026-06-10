const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('ORI'),
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  variantId: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  productSnapshot: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = OrderItem;