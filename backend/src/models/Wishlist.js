const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('WSH'),
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'productId'],
    },
  ],
});

module.exports = Wishlist;