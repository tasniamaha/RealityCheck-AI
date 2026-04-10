const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/pending', protect, authorize('EXPERT'), adminController.getPendingReviews);
router.post('/verify/:id', protect, authorize('EXPERT'), adminController.submitVerdict);

module.exports = router;