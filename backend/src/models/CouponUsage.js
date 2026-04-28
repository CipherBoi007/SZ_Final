const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  couponId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Coupons',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
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
