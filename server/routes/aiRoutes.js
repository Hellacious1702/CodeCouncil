const express = require('express');
const { reviewCode } = require('../controllers/aiController');
const { optionalProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Allow optionally protective routes to test without login easily, 
// but associate code with user if token is provided.
router.post('/review', optionalProtect, reviewCode);

module.exports = router;
