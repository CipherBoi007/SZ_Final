const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect, restrictTo } = require('../middleware/auth');

// Public route
router.get('/active', promotionController.getActivePromotions);

// Admin restricted routes
router.use(protect, restrictTo('admin'));

router.get('/', promotionController.getAllPromotions);
router.post('/', promotionController.createPromotion);
router.patch('/:id', promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
