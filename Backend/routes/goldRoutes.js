// Backend/routes/goldRoutes.js
const express = require('express');
const router = express.Router();
const { getMetalPrice } = require('../controllers/goldController.js');

// Route to get price for a specific metal symbol (e.g., /api/gold/XAU)
router.route('/:symbol').get(getMetalPrice);

module.exports = router;