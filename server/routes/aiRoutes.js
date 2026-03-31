const express = require('express');
const { reviewCode, getReviews, getReviewById } = require('../controllers/aiController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Code review
router.post('/review', optionalProtect, reviewCode);

// History (Protected)
router.get('/history', protect, getReviews);
router.get('/history/:id', protect, getReviewById);

module.exports = router;
