const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const Lookbook = sequelize.define('Lookbook', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('LBK'),
    primaryKey: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

module.exports = Lookbook;
