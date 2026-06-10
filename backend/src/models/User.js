const { DataTypes } = require('sequelize');
const generateCustomId = require('../utils/idGenerator');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(15),
    defaultValue: () => generateCustomId('USR'),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid elite email address' },
      notTempEmail(value) {
        const blockedDomains = [
          '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 
          'dispostable.com', 'temp-mail.org', 'burnablemail.com', 
          'trashmail.com', 'yopmail.com'
        ];
        const domain = value.split('@')[1];
        
        if (blockedDomains.includes(domain)) {
          throw new Error('No temporary email supported. Please use a professional domain.');
        }

        // Reserve southzone.com for admins only
        if (domain === 'southzone.com') {
          const currentRole = this.getDataValue('role') || this.role;
          if (currentRole !== 'admin') {
            throw new Error('This domain is reserved for internal SouthZone authority only.');
          }
        }
      }
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  },
  refreshToken: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        if (!user.password.startsWith('$2')) { user.password = await bcrypt.hash(user.password, 12); }
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        if (!user.password.startsWith('$2')) { user.password = await bcrypt.hash(user.password, 12); }
      }
    },
  },
});

User.prototype.comparePassword = async function(candidatePassword) {
  // No password set (e.g., Google-only user) — always reject password login
  if (!this.password) return false;
  // Ensure password is a bcrypt hash before comparing
  if (!this.password.startsWith('$2')) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;