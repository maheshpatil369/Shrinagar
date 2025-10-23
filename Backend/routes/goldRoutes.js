// Backend/routes/goldRoutes.js
const express = require('express');
const router = express.Router();
const { getGoldPrice } = require('../controllers/goldController.js');
// Optional: Add protect middleware if you only want logged-in users to fetch
// const { protect } = require('../middleware/authMiddleware.js');

// Public route to get gold price
router.route('/price').get(getGoldPrice);

module.exports = router;
