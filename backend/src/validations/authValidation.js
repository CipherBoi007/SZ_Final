const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom((value) => {
      const allowedDomains = [
        'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 
        'icloud.com', 'me.com', 'live.com', 'zoho.com', 'protonmail.com',
        'aol.com', 'mail.com', 'gmx.com', 'yandex.com'
      ];
      const domain = value.split('@')[1]?.toLowerCase();
      if (!allowedDomains.includes(domain)) {
        throw new Error('Please use a trusted email provider (Gmail, Hotmail, etc.). Temporary emails are not allowed.');
      }
      return true;
    }),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
];

const loginValidation = [
  body('password')
    .notEmpty().withMessage('Password is required'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Please provide email or phone number');
    }
    return true;
  }),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom((value) => {
      const allowedDomains = [
        'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 
        'icloud.com', 'me.com', 'live.com', 'zoho.com', 'protonmail.com',
        'aol.com', 'mail.com', 'gmx.com', 'yandex.com'
      ];
      const domain = value.split('@')[1]?.toLowerCase();
      if (!allowedDomains.includes(domain)) {
        throw new Error('Authorized domains only (@gmail, @hotmail, etc.)');
      }
      return true;
    }),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),
];

const passwordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
];

module.exports = {
  registerValidation,
  loginValidation,
  passwordValidation,
};
