const express = require('express');
const router = express.Router();
const lookbookController = require('../controllers/lookbookController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route
router.get('/', lookbookController.getLookbook);

// Admin restricted routes
router.use(protect, restrictTo('admin'));

router.post('/', upload.array('images', 50), lookbookController.addLookbookImages);
router.patch('/reorder', lookbookController.reorderLookbook);
router.delete('/:id', lookbookController.deleteLookbookImage);

module.exports = router;
