const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('CPU'),
    primaryKey: true,
  },
  couponId: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'Coupons',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['couponId'],
    },
    {
      fields: ['userId'],
    },
  ],
});

module.exports = CouponUsage;
