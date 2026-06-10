const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('CAT'),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  parentId: {
    type: DataTypes.STRING(15),
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Category;