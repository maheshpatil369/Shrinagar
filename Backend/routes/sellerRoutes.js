// maheshpatil369/shrinagar/Shrinagar-abcbe203037457af5cdd1912b6e3260dabf070c5/Backend/routes/sellerRoutes.js
const express = require('express');
const router = express.Router();
const {
    enrollSeller,
    getSellerDashboard,
    getSellerProducts,
    getSellerAnalytics,
} = require('../controllers/sellerController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

// --- Seller-Specific Routes ---

// CORRECTED: This route is now set to '/enroll' to match the frontend API call.
router.route('/enroll').post(protect, authorize('seller'), enrollSeller);

// Route for a seller to get their main dashboard information (profile details).
router.route('/dashboard').get(protect, authorize('seller'), getSellerDashboard);

// Route for a seller to get a list of all their products.
router.route('/products').get(protect, authorize('seller'), getSellerProducts);

// NEW: Route for a seller to get their analytics data.
router.route('/analytics').get(protect, authorize('seller'), getSellerAnalytics);

module.exports = router;
