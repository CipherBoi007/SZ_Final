const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('PRM'),
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetLink: {
    type: DataTypes.STRING,
    defaultValue: '/shop',
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

module.exports = Promotion;
