// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/stats').get(protect, admin, getDashboardStats);

module.exports = router;
