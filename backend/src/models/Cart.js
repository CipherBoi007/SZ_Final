const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('CRT'),
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  variantId: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Cart;