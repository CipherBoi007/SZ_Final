const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
    type: DataTypes.UUID,
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