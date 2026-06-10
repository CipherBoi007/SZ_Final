const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('REV'),
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING,
  },
  comment: {
    type: DataTypes.TEXT,
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  orderItemId: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Review;