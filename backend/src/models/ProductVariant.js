const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('VAR'),
    primaryKey: true,
  },
  productId: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  size: {
    type: DataTypes.ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['productId'],
    },
    {
      fields: ['sku'],
    },
  ],
});

module.exports = ProductVariant;
