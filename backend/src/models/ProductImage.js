const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('IMG'),
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  variantId: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ProductImage;